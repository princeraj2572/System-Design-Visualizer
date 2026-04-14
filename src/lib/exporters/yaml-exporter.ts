/**
 * YAML Export Format
 * Exports architecture as structured YAML specification for easy reading and version control
 */

import { escapeYaml, createCommentHeader } from './export-utils';

export interface YamlExportOptions {
  includeMetadata: boolean;
  includeTags: boolean;
  prettyPrint: boolean;
}

export interface YamlExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
}

/**
 * Export architecture to YAML format
 */
export function exportYaml(
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options: Partial<YamlExportOptions> = {}
): YamlExportResult {
  const opts: YamlExportOptions = {
    includeMetadata: true,
    includeTags: false,
    prettyPrint: true,
    ...options,
  };

  const header = createCommentHeader('yaml', projectName);

  const yamlLines: string[] = [header];

  // Metadata section
  if (opts.includeMetadata) {
    yamlLines.push('metadata:');
    yamlLines.push(`  version: '1.0'`);
    yamlLines.push(`  name: "${escapeYaml(projectName)}"`);
    yamlLines.push(`  generated: ${new Date().toISOString()}`);
    yamlLines.push('');
  }

  // Components section
  yamlLines.push('components:');
  nodes.forEach((node, idx) => {
    yamlLines.push(`  - id: ${node.id}`);
    yamlLines.push(`    index: ${idx}`);
    yamlLines.push(`    type: ${node.type}`);
    yamlLines.push(`    name: "${escapeYaml(node.metadata?.name || node.name || 'Unnamed')}"`);

    if (node.metadata?.description) {
      yamlLines.push(`    description: "${escapeYaml(node.metadata.description)}"`);
    }

    if (node.metadata?.technology) {
      yamlLines.push(`    technology: "${escapeYaml(node.metadata.technology)}"`);
    }

    yamlLines.push(`    position:`);
    yamlLines.push(`      x: ${Math.round(node.position?.x || 0)}`);
    yamlLines.push(`      y: ${Math.round(node.position?.y || 0)}`);
  });

  yamlLines.push('');

  // Connections section
  if (edges.length > 0) {
    yamlLines.push('connections:');
    edges.forEach((edge, idx) => {
      yamlLines.push(`  - id: ${edge.id}`);
      yamlLines.push(`    index: ${idx}`);
      yamlLines.push(`    from: ${edge.source}`);
      yamlLines.push(`    to: ${edge.target}`);
      yamlLines.push(`    type: ${edge.type || 'generic'}`);

      if (edge.label) {
        yamlLines.push(`    label: "${escapeYaml(edge.label)}"`);
      }
    });
  }

  const content = yamlLines.join('\n');

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.yaml`,
    mimeType: 'application/yaml',
    description: 'YAML architecture specification - structured format for version control and parsing',
  };
}

/**
 * Parse YAML export back to nodes and edges
 */
export function parseYamlExport(yamlContent: string): {
  nodes: any[];
  edges: any[];
  metadata: Record<string, any>;
} {
  try {
    // Simple YAML parser - for production consider using js-yaml library
    const lines = yamlContent.split('\n');
    const nodes: any[] = [];
    const edges: any[] = [];
    let metadata: Record<string, any> = {};

    let currentSection = '';
    let currentNode: any = null;
    let currentEdge: any = null;

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed === 'metadata:') {
        currentSection = 'metadata';
        return;
      }
      if (trimmed === 'components:') {
        currentSection = 'components';
        return;
      }
      if (trimmed === 'connections:') {
        currentSection = 'connections';
        return;
      }

      if (currentSection === 'components') {
        if (trimmed.startsWith('- id:')) {
          if (currentNode) nodes.push(currentNode);
          currentNode = { id: trimmed.replace('- id: ', '') };
        } else if (trimmed.startsWith('type:') && currentNode) {
          currentNode.type = trimmed.replace('type: ', '');
        } else if (trimmed.startsWith('name:') && currentNode) {
          currentNode.name = trimmed.replace('name: ', '').replace(/^"|"$/g, '');
        }
      }

      if (currentSection === 'connections') {
        if (trimmed.startsWith('- id:')) {
          if (currentEdge) edges.push(currentEdge);
          currentEdge = { id: trimmed.replace('- id: ', '') };
        } else if (trimmed.startsWith('from:') && currentEdge) {
          currentEdge.source = trimmed.replace('from: ', '');
        } else if (trimmed.startsWith('to:') && currentEdge) {
          currentEdge.target = trimmed.replace('to: ', '');
        }
      }
    });

    if (currentNode) nodes.push(currentNode);
    if (currentEdge) edges.push(currentEdge);

    return { nodes, edges, metadata };
  } catch (error) {
    console.error('Failed to parse YAML export:', error);
    return { nodes: [], edges: [], metadata: {} };
  }
}
