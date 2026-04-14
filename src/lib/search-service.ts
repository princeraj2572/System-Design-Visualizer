/**
 * Search & Filter Service - Query and filter architecture nodes
 */

import { NodeData, Edge } from '@/types/architecture';

export interface SearchQuery {
  text: string;
  filters: {
    types: string[];
    hasIncoming: boolean;
    hasOutgoing: boolean;
    tier: string | null;
  };
}

export interface SearchResult {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
  matchCount: number;
}

/**
 * Search nodes by text (name, description, technology)
 */
export function searchNodesByText(nodes: NodeData[], query: string): Set<string> {
  if (!query.trim()) return new Set();

  const lowerQuery = query.toLowerCase();
  const matching = new Set<string>();

  nodes.forEach((node) => {
    if (
      node.metadata.name.toLowerCase().includes(lowerQuery) ||
      node.metadata.description.toLowerCase().includes(lowerQuery) ||
      node.metadata.technology.toLowerCase().includes(lowerQuery)
    ) {
      matching.add(node.id);
    }
  });

  return matching;
}

/**
 * Filter nodes by type
 */
export function filterNodesByType(nodes: NodeData[], types: string[]): Set<string> {
  if (types.length === 0) return new Set(nodes.map((n) => n.id));

  const matching = new Set<string>();
  nodes.forEach((node) => {
    if (types.includes(node.type)) {
      matching.add(node.id);
    }
  });

  return matching;
}

/**
 * Filter nodes by connectivity
 */
export function filterNodesByConnectivity(
  nodes: NodeData[],
  edges: Edge[],
  hasIncoming: boolean,
  hasOutgoing: boolean
): Set<string> {
  const matching = new Set<string>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Build connectivity map
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();

  edges.forEach((edge) => {
    if (nodeIds.has(edge.source)) {
      outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1);
    }
    if (nodeIds.has(edge.target)) {
      incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
    }
  });

  nodeIds.forEach((id) => {
    const incomingCount = incoming.get(id) || 0;
    const outgoingCount = outgoing.get(id) || 0;

    if (hasIncoming && hasOutgoing) {
      if (incomingCount > 0 || outgoingCount > 0) matching.add(id);
    } else if (hasIncoming) {
      if (incomingCount > 0) matching.add(id);
    } else if (hasOutgoing) {
      if (outgoingCount > 0) matching.add(id);
    }
  });

  return matching;
}

/**
 * Combine all search filters
 */
export function executeSearch(
  nodes: NodeData[],
  edges: Edge[],
  query: SearchQuery
): SearchResult {
  let textMatches = new Set(nodes.map((n) => n.id));
  if (query.text) {
    textMatches = searchNodesByText(nodes, query.text);
  }

  const typeMatches = filterNodesByType(nodes, query.filters.types);

  let connectivityMatches = new Set(nodes.map((n) => n.id));
  if (query.filters.hasIncoming || query.filters.hasOutgoing) {
    connectivityMatches = filterNodesByConnectivity(
      nodes,
      edges,
      query.filters.hasIncoming,
      query.filters.hasOutgoing
    );
  }

  // Intersect all filter sets
  const matchingNodeIds = new Set<string>();
  textMatches.forEach((id) => {
    if (typeMatches.has(id) && connectivityMatches.has(id)) {
      matchingNodeIds.add(id);
    }
  });

  // Find edges between matching nodes
  const matchingEdgeIds = new Set<string>();
  edges.forEach((edge) => {
    if (matchingNodeIds.has(edge.source) && matchingNodeIds.has(edge.target)) {
      matchingEdgeIds.add(edge.id);
    }
  });

  return {
    nodeIds: matchingNodeIds,
    edgeIds: matchingEdgeIds,
    matchCount: matchingNodeIds.size,
  };
}

/**
 * Get all unique node types from nodes
 */
export function getUniqueNodeTypes(nodes: NodeData[]): string[] {
  const types = new Set(nodes.map((n) => n.type));
  return Array.from(types).sort();
}
