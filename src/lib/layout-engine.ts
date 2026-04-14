/**
 * Layout engine for automatic hierarchical arrangement of nodes
 * Uses Dagre algorithm to compute optimal positions
 */

import { NodeData, Edge } from '@/types/architecture';

export interface LayoutResult {
  nodes: NodeData[];
  edges: Edge[];
}

/**
 * Arrange nodes in a hierarchical layout using Dagre-inspired algorithm
 * Note: Full Dagre requires 'npm install dagre @dagrejs/dagre'
 * This is a simplified implementation that works without external deps
 */
export const layoutNodesHierarchical = (
  nodes: NodeData[],
  edges: Edge[],
  options?: {
    rankGap?: number;
    nodeSpacing?: number;
    direction?: 'TB' | 'LR'; // Top-Bottom or Left-Right
  }
): LayoutResult => {
  const rankGap = options?.rankGap || 150;
  const nodeSpacing = options?.nodeSpacing || 200;
  const direction = options?.direction || 'TB';

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  // Build adjacency lists
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  const inEdges = new Map<string, string[]>();

  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    outEdges.set(node.id, []);
    inEdges.set(node.id, []);
  });

  edges.forEach((edge) => {
    const inDeg = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, inDeg + 1);

    const out = outEdges.get(edge.source) || [];
    out.push(edge.target);
    outEdges.set(edge.source, out);

    const inE = inEdges.get(edge.target) || [];
    inE.push(edge.source);
    inEdges.set(edge.target, inE);
  });

  // Find root nodes (no incoming edges)
  const roots: string[] = [];
  nodes.forEach((node) => {
    if ((inDegree.get(node.id) || 0) === 0) {
      roots.push(node.id);
    }
  });

  // If no roots (cyclic graph), use first node
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0].id);
  }

  // BFS to assign ranks
  const ranks = new Map<string, number>();
  const visited = new Set<string>();
  const queue: string[] = [...roots];

  roots.forEach((root) => ranks.set(root, 0));

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);

    const children = outEdges.get(node) || [];
    const currentRank = ranks.get(node) || 0;

    children.forEach((child) => {
      const childRank = ranks.get(child) || 0;
      ranks.set(child, Math.max(childRank, currentRank + 1));

      if (!visited.has(child)) {
        queue.push(child);
      }
    });
  }

  // Unvisited nodes (disconnected) - assign to first available rank
  nodes.forEach((node) => {
    if (!ranks.has(node.id)) {
      ranks.set(node.id, 0);
    }
  });

  // Group nodes by rank
  const rankGroups = new Map<number, string[]>();
  ranks.forEach((rank, nodeId) => {
    if (!rankGroups.has(rank)) {
      rankGroups.set(rank, []);
    }
    rankGroups.get(rank)!.push(nodeId);
  });

  // Position nodes
  const newNodes = nodes.map((node) => {
    const rank = ranks.get(node.id) || 0;
    const nodesInRank = rankGroups.get(rank) || [];
    const indexInRank = nodesInRank.indexOf(node.id);

    let x: number, y: number;

    if (direction === 'TB') {
      // Top-Bottom layout
      y = rank * rankGap;
      const totalWidth = nodesInRank.length * nodeSpacing;
      x = indexInRank * nodeSpacing - totalWidth / 2;
    } else {
      // Left-Right layout
      x = rank * rankGap;
      const totalHeight = nodesInRank.length * nodeSpacing;
      y = indexInRank * nodeSpacing - totalHeight / 2;
    }

    return {
      ...node,
      position: { x, y },
    };
  });

  return { nodes: newNodes, edges };
};

/**
 * Build hierarchy tree from nodes and edges
 */
export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children: HierarchyNode[];
  level: number;
  incomingEdges: number;
  outgoingEdges: number;
}

export const buildHierarchy = (
  nodes: NodeData[],
  edges: Edge[]
): HierarchyNode[] => {
  const nodeMap = new Map<string, NodeData>();
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    outgoing.set(node.id, []);
    incoming.set(node.id, 0);
  });

  edges.forEach((edge) => {
    const out = outgoing.get(edge.source) || [];
    out.push(edge.target);
    outgoing.set(edge.source, out);

    const inCount = (incoming.get(edge.target) || 0) + 1;
    incoming.set(edge.target, inCount);
  });

  // Find roots (no incoming edges)
  const roots: string[] = [];
  nodes.forEach((node) => {
    if ((incoming.get(node.id) || 0) === 0) {
      roots.push(node.id);
    }
  });

  // Build tree recursively
  const buildNode = (id: string, visited: Set<string>, level: number): HierarchyNode => {
    const node = nodeMap.get(id)!;
    const children: HierarchyNode[] = [];

    const children_ids = outgoing.get(id) || [];
    children_ids.forEach((childId) => {
      if (!visited.has(childId)) {
        visited.add(childId);
        children.push(buildNode(childId, visited, level + 1));
      }
    });

    return {
      id,
      name: node.metadata.name,
      type: node.type,
      children,
      level,
      incomingEdges: incoming.get(id) || 0,
      outgoingEdges: children_ids.length,
    };
  };

  const visited = new Set<string>(roots);
  const tree: HierarchyNode[] = roots.map((rootId) =>
    buildNode(rootId, visited, 0)
  );

  // Add disconnected nodes as roots
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      tree.push(buildNode(node.id, visited, 0));
    }
  });

  return tree;
};
