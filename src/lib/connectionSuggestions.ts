/**
 * Connection Suggestions - recommends nodes to connect based on component type
 */

import { Node, Edge } from '@xyflow/react';
import { NodeDataExtended, ConnectionSuggestion } from '@/types/architecture';
import { getComponentDefinition, COMPONENT_LIBRARY } from './componentLibrary';

/**
 * Get connection suggestions for a selected node
 * Returns components not yet connected that should be
 */
export function getSuggestionsForNode(
  selectedNode: Node<NodeDataExtended>,
  allNodes: Node<NodeDataExtended>[],
  allEdges: Edge[]
): ConnectionSuggestion[] {
  // Find component definition by node label
  const compId = findComponentIdByLabel(selectedNode.data?.label ?? selectedNode.data?.name ?? '');
  if (!compId) return [];

  const def = getComponentDefinition(compId);
  if (!def) return [];

  // Track already-connected component types
  const connectedComponentIds = new Set<string>();

  allEdges
    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    .forEach(e => {
      const otherId = e.source === selectedNode.id ? e.target : e.source;
      const other = allNodes.find(n => n.id === otherId);
      if (other) {
        const cid = findComponentIdByLabel(other.data?.label ?? '');
        if (cid) connectedComponentIds.add(cid);
      }
    });

  const suggestions: ConnectionSuggestion[] = [];

  // Suggest targets not yet connected
  for (const targetCompId of def.suggestedTargets) {
    if (!connectedComponentIds.has(targetCompId)) {
      const targetDef = getComponentDefinition(targetCompId);
      if (targetDef) {
        suggestions.push({
          componentId: targetCompId,
          label: targetDef.label,
          icon: targetDef.icon,
          reason: `${def.label} typically connects to ${targetDef.label}`,
          direction: 'add-target',
        });
      }
    }
  }

  // Suggest sources not yet connected
  for (const sourceCompId of def.suggestedSources) {
    if (!connectedComponentIds.has(sourceCompId)) {
      const sourceDef = getComponentDefinition(sourceCompId);
      if (sourceDef) {
        suggestions.push({
          componentId: sourceCompId,
          label: sourceDef.label,
          icon: sourceDef.icon,
          reason: `${sourceDef.label} typically routes to ${def.label}`,
          direction: 'add-source',
        });
      }
    }
  }

  // Return max 4 suggestions
  return suggestions.slice(0, 4);
}

/**
 * Find component ID by matching label
 */
function findComponentIdByLabel(label: string): string | undefined {
  return COMPONENT_LIBRARY.find(
    c => c.label.toLowerCase() === label.toLowerCase()
  )?.id;
}
