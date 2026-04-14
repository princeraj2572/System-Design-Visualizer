/**
 * Analytics Service - Analyze architecture for insights and issues
 */

import { Project } from '../models/types';

export interface NodeMetrics {
  id: string;
  name: string;
  type: string;
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  isHub: boolean;
  isSinglePointOfFailure: boolean;
}

export interface EdgeMetrics {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface AnalyticsReport {
  projectId: string;
  projectName: string;
  summary: {
    totalNodes: number;
    totalEdges: number;
    totalGroups: number;
    nodeTypesUsed: string[];
    typeDistribution: Record<string, number>;
  };
  nodeMetrics: NodeMetrics[];
  circularDependencies: string[][];
  isolatedNodes: string[]; // Nodes with no connections
  hubs: string[]; // Nodes with high in-degree
  singlePointsOfFailure: string[];
  architectureHealth: {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  };
}

/**
 * Analyze project architecture
 */
export function analyzeProject(project: Project): AnalyticsReport {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Build adjacency matrix
  const nodeIds = project.nodes.map((n) => n.id);
  const nodeIndex = new Map(nodeIds.map((id, i) => [id, i]));
  const adjacencyMatrix: Set<string>[] = Array(nodeIds.length)
    .fill(null)
    .map(() => new Set());

  const inDegree = new Map(nodeIds.map((id) => [id, 0]));
  const outDegree = new Map(nodeIds.map((id) => [id, 0]));

  // Build adjacency
  project.edges.forEach((edge) => {
    const sourceIdx = nodeIndex.get(edge.source);
    const targetIdx = nodeIndex.get(edge.target);

    if (sourceIdx !== undefined && targetIdx !== undefined) {
      adjacencyMatrix[sourceIdx].add(edge.target);
      outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // Find circular dependencies
  const circularDependencies = findCircularDependencies(nodeIds, nodeIndex, adjacencyMatrix);
  if (circularDependencies.length > 0) {
    issues.push(`Found ${circularDependencies.length} circular dependency cycle(s)`);
    recommendations.push('Consider refactoring to break circular dependencies');
  }

  // Identify isolated nodes
  const isolatedNodes = nodeIds.filter(
    (id) => (inDegree.get(id) || 0) + (outDegree.get(id) || 0) === 0
  );
  if (isolatedNodes.length > 0) {
    issues.push(`${isolatedNodes.length} isolated component(s) not connected to architecture`);
    if (isolatedNodes.length > project.nodes.length * 0.2) {
      recommendations.push('Many isolated components: consider consolidation or adding connections');
    }
  }

  // Identify hubs (high in-degree)
  const avgInDegree = project.edges.length / Math.max(project.nodes.length, 1);
  const hubs = nodeIds.filter((id) => (inDegree.get(id) || 0) > avgInDegree + 1);

  if (hubs.length > 0) {
    issues.push(`${hubs.length} potential bottleneck(s): high-dependency component(s)`);
    recommendations.push('Monitor hub components for performance and reliability');
  }

  // Single points of failure (only incoming connections, many incoming)
  const singlePointsOfFailure = nodeIds.filter((id) => {
    const incoming = inDegree.get(id) || 0;
    const outgoing = outDegree.get(id) || 0;
    return incoming > 2 && outgoing === 0; // High dependency but doesn't provide onward connections
  });

  if (singlePointsOfFailure.length > 0) {
    issues.push(`${singlePointsOfFailure.length} potential single point(s) of failure`);
    recommendations.push('Add redundancy for critical components');
  }

  // Node metrics
  const nodeMetrics: NodeMetrics[] = nodeIds.map((id) => {
    const inDeg = inDegree.get(id) || 0;
    const outDeg = outDegree.get(id) || 0;
    const node = project.nodes.find((n) => n.id === id)!;

    return {
      id,
      name: node.metadata.name,
      type: node.type,
      inDegree: inDeg,
      outDegree: outDeg,
      totalDegree: inDeg + outDeg,
      isHub: inDeg > avgInDegree + 1,
      isSinglePointOfFailure: singlePointsOfFailure.includes(id),
    };
  });

  // Type distribution
  const typeDistribution: Record<string, number> = {};
  project.nodes.forEach((node) => {
    typeDistribution[node.type] = (typeDistribution[node.type] || 0) + 1;
  });

  const typesUsed = Object.keys(typeDistribution);

  // Calculate health score
  let healthScore = 100;
  if (circularDependencies.length > 0) healthScore -= Math.min(20, circularDependencies.length * 5);
  if (isolatedNodes.length > 0) {
    const isolationPenalty = Math.min(15, (isolatedNodes.length / project.nodes.length) * 30);
    healthScore -= isolationPenalty;
  }
  if (singlePointsOfFailure.length > 0) healthScore -= Math.min(20, singlePointsOfFailure.length * 5);
  if (hubs.length > project.nodes.length * 0.1) healthScore -= 10;

  // Recommendations based on type distribution
  if (typesUsed.length > 15) {
    recommendations.push('Architecture uses many different component types; ensure consistency');
  }

  if (circularDependencies.length === 0 && isolatedNodes.length === 0 && singlePointsOfFailure.length === 0) {
    recommendations.push('✓ Architecture follows good practices');
  }

  return {
    projectId: project.id,
    projectName: project.name,
    summary: {
      totalNodes: project.nodes.length,
      totalEdges: project.edges.length,
      totalGroups: project.groups?.length || 0,
      nodeTypesUsed: typesUsed,
      typeDistribution,
    },
    nodeMetrics,
    circularDependencies,
    isolatedNodes,
    hubs,
    singlePointsOfFailure,
    architectureHealth: {
      score: Math.max(0, Math.round(healthScore)),
      issues,
      recommendations,
    },
  };
}

/**
 * Find circular dependencies using DFS
 */
function findCircularDependencies(
  nodeIds: string[],
  nodeIndex: Map<string, number>,
  adjacencyMatrix: Set<string>[]
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<number>();
  const recursionStack = new Map<number, number>(); // node index -> path index

  function dfs(nodeIdx: number, path: number[]): void {
    visited.add(nodeIdx);
    recursionStack.set(nodeIdx, path.length);
    path.push(nodeIdx);

    for (const neighbor of adjacencyMatrix[nodeIdx]) {
      const neighborIdx = nodeIndex.get(neighbor);
      if (neighborIdx === undefined) continue;

      if (!visited.has(neighborIdx)) {
        dfs(neighborIdx, [...path]);
      } else if (recursionStack.has(neighborIdx)) {
        // Found cycle
        const cycleStart = recursionStack.get(neighborIdx)!;
        const cycle = path.slice(cycleStart).map((idx) => nodeIds[idx]);
        cycles.push(cycle);
      }
    }

    recursionStack.delete(nodeIdx);
  }

  for (let i = 0; i < nodeIds.length; i++) {
    if (!visited.has(i)) {
      dfs(i, []);
    }
  }

  // Remove duplicate cycles
  const uniqueCycles: string[][] = [];
  const cycleSignatures = new Set<string>();

  for (const cycle of cycles) {
    const signature = cycle.sort().join('|');
    if (!cycleSignatures.has(signature)) {
      cycleSignatures.add(signature);
      uniqueCycles.push(cycle);
    }
  }

  return uniqueCycles;
}

/**
 * Get detailed metrics for a specific node
 */
export function getNodeDetailedMetrics(project: Project, nodeId: string) {
  const node = project.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const incomingEdges = project.edges.filter((e) => e.target === nodeId);
  const outgoingEdges = project.edges.filter((e) => e.source === nodeId);

  return {
    node,
    incomingEdges: incomingEdges.map((e) => ({
      ...e,
      sourceName: project.nodes.find((n) => n.id === e.source)?.metadata.name,
    })),
    outgoingEdges: outgoingEdges.map((e) => ({
      ...e,
      targetName: project.nodes.find((n) => n.id === e.target)?.metadata.name,
    })),
    totalIncoming: incomingEdges.length,
    totalOutgoing: outgoingEdges.length,
  };
}
