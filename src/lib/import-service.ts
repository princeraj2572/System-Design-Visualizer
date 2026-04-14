/**
 * Import Service - Parse and validate imported files
 */

import { Project, NodeData, Edge, NodeGroup } from '@/types/architecture';

export interface ImportResult {
  success: boolean;
  project?: Project;
  errors: string[];
  warnings: string[];
}

/**
 * Parse JSON import
 */
export function parseJSONImport(content: string): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = JSON.parse(content);

    // Validate structure
    if (!data.project) {
      errors.push('Invalid import format: missing "project" field');
      return { success: false, errors, warnings };
    }

    const { id, name, description, nodes, edges, groups } = data.project;

    if (!id || !name || !Array.isArray(nodes)) {
      errors.push('Invalid import format: missing required fields (id, name, nodes)');
      return { success: false, errors, warnings };
    }

    if (!Array.isArray(edges)) {
      errors.push('Invalid import format: edges must be an array');
      return { success: false, errors, warnings };
    }

    // Validate nodes
    const nodeIds = new Set<string>();
    const validatedNodes: NodeData[] = [];

    for (const node of nodes) {
      if (!node.id || !node.type) {
        errors.push(`Invalid node: missing id or type`);
        continue;
      }

      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Invalid node ${node.id}: missing or invalid position`);
        continue;
      }

      if (!node.metadata || !node.metadata.name) {
        errors.push(`Invalid node ${node.id}: missing metadata or name`);
        continue;
      }

      nodeIds.add(node.id);
      validatedNodes.push(node);
    }

    // Validate edges
    const validatedEdges: Edge[] = [];
    for (const edge of edges) {
      if (!edge.id || !edge.source || !edge.target) {
        warnings.push(`Invalid edge: missing id, source, or target. Skipping.`);
        continue;
      }

      if (!nodeIds.has(edge.source)) {
        warnings.push(`Edge references unknown source node: ${edge.source}`);
        continue;
      }

      if (!nodeIds.has(edge.target)) {
        warnings.push(`Edge references unknown target node: ${edge.target}`);
        continue;
      }

      validatedEdges.push(edge);
    }

    // Validate groups
    const validatedGroups: NodeGroup[] = [];
    if (groups && Array.isArray(groups)) {
      for (const group of groups) {
        if (!group.id || !group.name || !Array.isArray(group.childNodeIds)) {
          warnings.push(`Invalid group: skipping`);
          continue;
        }

        // Check that all child nodes exist
        const missingNodes = group.childNodeIds.filter((nodeId: string) => !nodeIds.has(nodeId));
        if (missingNodes.length > 0) {
          warnings.push(`Group "${group.name}" references non-existent nodes: ${missingNodes.join(', ')}`);
        }

        validatedGroups.push(group);
      }
    }

    const project: Project = {
      id,
      name,
      description: description || '',
      nodes: validatedNodes,
      edges: validatedEdges,
      groups: validatedGroups,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      project,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors, warnings };
  }
}

/**
 * Parse YAML import (simplified YAML parser)
 */
export function parseYAMLImport(content: string): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const lines = content.split('\n');

    // Parse nodes
    const nodeIndex = lines.findIndex((line) => line.trim().startsWith('nodes:'));
    if (nodeIndex === -1) {
      errors.push('No nodes section found in YAML');
      return { success: false, errors, warnings };
    }

    const nodes: NodeData[] = [];
    for (let j = nodeIndex + 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.trim().startsWith('edges:')) break;

      if (line.trim().startsWith('- id:')) {
        // Parse node
        const nodeData: any = {
          id: '',
          type: 'service',
          position: { x: 0, y: 0 },
          metadata: { name: '', description: '', technology: '' },
        };

        // Extract node properties
        let k = j;
        while (k < lines.length && !lines[k].trim().startsWith('- id:')) {
          const nodeLine = lines[k].trim();
          if (nodeLine.startsWith('id:')) {
            nodeData.id = nodeLine.replace('id:', '').trim().replace(/"/g, '');
          } else if (nodeLine.startsWith('type:')) {
            const typeStr = nodeLine.replace('type:', '').trim().replace(/"/g, '');
            if (typeStr && isValidNodeType(typeStr)) {
              nodeData.type = typeStr;
            }
          } else if (nodeLine.startsWith('name:')) {
            nodeData.metadata.name = nodeLine.replace('name:', '').trim().replace(/"/g, '');
          } else if (nodeLine.startsWith('x:')) {
            nodeData.position.x = parseFloat(nodeLine.replace('x:', '').trim());
          } else if (nodeLine.startsWith('y:')) {
            nodeData.position.y = parseFloat(nodeLine.replace('y:', '').trim());
          }
          k++;
        }

        if (nodeData.id && nodeData.type && nodeData.metadata.name) {
          nodes.push(nodeData);
        }
      }
    }

    return parseJSONImport(
      JSON.stringify({
        project: {
          id: Math.random().toString(36).substr(2, 9),
          name: 'Imported Project',
          description: '',
          nodes,
          edges: [],
          groups: [],
        },
      })
    );
  } catch (error) {
    errors.push(`YAML parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors, warnings };
  }
}

/**
 * Import from file
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = await file.text();
    const filename = file.name.toLowerCase();

    if (filename.endsWith('.json')) {
      return parseJSONImport(content);
    } else if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
      return parseYAMLImport(content);
    } else {
      // Try to detect format
      if (content.trim().startsWith('{')) {
        return parseJSONImport(content);
      } else {
        return parseYAMLImport(content);
      }
    }
  } catch (error) {
    errors.push(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors, warnings };
  }
}

/**
 * Check if a string is a valid NodeType
 */
function isValidNodeType(type: string): boolean {
  const validTypes = [
    'client', 'web-frontend', 'mobile-app',
    'api-gateway', 'rest-api', 'graphql-server', 'grpc-server', 'websocket-server',
    'lambda', 'container', 'vm',
    'sql-database', 'nosql-database', 'graph-database', 'search-engine', 'data-warehouse',
    'cache', 'cdn',
    'message-queue', 'pub-sub', 'event-bus',
    'load-balancer', 'reverse-proxy', 'firewall', 'dns', 'storage',
    'monitoring', 'logging', 'tracing', 'alerting',
    'service', 'worker',
    'api-server', 'database',
  ];
  return validTypes.includes(type);
}
