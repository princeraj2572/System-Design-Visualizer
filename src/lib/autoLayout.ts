/**
 * Auto Layout Engine - spec-aligned using Dagre
 * Hierarchical graph layout for architecture diagrams
 */

import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';

const NODE_WIDTH = 140;
const NODE_HEIGHT = 70;

/**
 * Run Dagre layout algorithm on nodes and edges
 * Returns positioned nodes ready for React Flow
 */
export function runDagreLayout(
  nodes: Node<NodeDataExtended>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): Node<NodeDataExtended>[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  // LR = left to right, TB = top to bottom
  g.setGraph({
    rankdir: direction,
    ranksep: 80,
    nodesep: 40,
  });

  // Add nodes
  nodes.forEach(node => {
    const w = (node.style?.width as number) ?? NODE_WIDTH;
    const h = (node.style?.height as number) ?? NODE_HEIGHT;
    g.setNode(node.id, { width: w, height: h });
  });

  // Add edges
  edges.forEach(edge => {
    if (nodes.some(n => n.id === edge.source) && nodes.some(n => n.id === edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Run layout
  dagre.layout(g);

  // Apply positioned coordinates back to nodes
  return nodes.map(node => {
    const { x, y } = g.node(node.id);
    const w = (node.style?.width as number) ?? NODE_WIDTH;
    const h = (node.style?.height as number) ?? NODE_HEIGHT;
    return {
      ...node,
      position: {
        x: x - w / 2,
        y: y - h / 2,
      },
    };
  });
}

/**
 * Layout options preset
 */
export const layoutPresets = {
  leftToRight: () => ({ rankdir: 'LR', ranksep: 80, nodesep: 40 }),
  topToBottom: () => ({ rankdir: 'TB', ranksep: 100, nodesep: 50 }),
  compact: () => ({ rankdir: 'LR', ranksep: 60, nodesep: 30 }),
  spacious: () => ({ rankdir: 'LR', ranksep: 120, nodesep: 60 }),
};
