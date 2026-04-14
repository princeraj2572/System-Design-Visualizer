/**
 * Export Service - Generate various export formats
 */

import { Project } from '@/types/architecture';

export interface ExportOptions {
  format: 'json' | 'yaml';
  includeMetadata?: boolean;
  includeHierarchy?: boolean;
}

/**
 * Export project as JSON
 */
export function exportAsJSON(project: Project, pretty = true): string {
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      description: project.description || '',
      nodes: project.nodes,
      edges: project.edges,
      groups: project.groups || [],
      metadata: {
        nodeCount: project.nodes.length,
        edgeCount: project.edges.length,
        groupCount: (project.groups || []).length,
      },
    },
  };

  return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
}

/**
 * Export project as YAML
 */
export function exportAsYAML(project: Project): string {
  const lines: string[] = [];

  // Header
  lines.push('version: "1.0.0"');
  lines.push(`exportedAt: "${new Date().toISOString()}"`);
  lines.push('');

  // Project metadata
  lines.push('project:');
  lines.push(`  id: "${project.id}"`);
  lines.push(`  name: "${project.name}"`);
  lines.push(`  description: "${project.description || ''}"`);
  lines.push('');

  // Nodes
  lines.push('  nodes:');
  project.nodes.forEach((node) => {
    lines.push(`    - id: "${node.id}"`);
    lines.push(`      type: "${node.type}"`);
    lines.push(`      position:`);
    lines.push(`        x: ${node.position.x}`);
    lines.push(`        y: ${node.position.y}`);
    if (node.parentId) {
      lines.push(`      parentId: "${node.parentId}"`);
    }
    lines.push(`      metadata:`);
    lines.push(`        name: "${node.metadata.name}"`);
    lines.push(`        description: "${node.metadata.description}"`);
    lines.push(`        technology: "${node.metadata.technology}"`);
  });
  lines.push('');

  // Edges
  lines.push('  edges:');
  project.edges.forEach((edge) => {
    lines.push(`    - id: "${edge.id}"`);
    lines.push(`      source: "${edge.source}"`);
    lines.push(`      target: "${edge.target}"`);
    lines.push(`      label: "${edge.label}"`);
    if (edge.type) {
      lines.push(`      type: "${edge.type}"`);
    }
  });
  lines.push('');

  // Groups
  if (project.groups && project.groups.length > 0) {
    lines.push('  groups:');
    project.groups.forEach((group) => {
      lines.push(`    - id: "${group.id}"`);
      lines.push(`      name: "${group.name}"`);
      lines.push(`      description: "${group.description || ''}"`);
      lines.push(`      childNodeIds: [${group.childNodeIds.map((id) => `"${id}"`).join(', ')}]`);
    });
  }

  return lines.join('\n');
}

/**
 * Generate download link for export
 */
export function downloadExport(content: string, filename: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Export as Markdown documentation
 */
export function exportAsMarkdown(project: Project): string {
  const lines: string[] = [];

  lines.push(`# ${project.name}`);
  lines.push('');
  if (project.description) {
    lines.push(`${project.description}`);
    lines.push('');
  }

  // Project Stats
  lines.push('## Architecture Overview');
  lines.push('');
  lines.push(`- **Total Components**: ${project.nodes.length}`);
  lines.push(`- **Total Connections**: ${project.edges.length}`);
  lines.push(`- **Component Groups**: ${(project.groups || []).length}`);
  lines.push('');

  // Nodes by type
  const nodesByType: Record<string, number> = {};
  project.nodes.forEach((node) => {
    nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
  });

  lines.push('## Components by Type');
  lines.push('');
  Object.entries(nodesByType).forEach(([type, count]) => {
    lines.push(`- **${type}**: ${count}`);
  });
  lines.push('');

  // Components detail
  lines.push('## Components');
  lines.push('');
  project.nodes.forEach((node) => {
    lines.push(`### ${node.metadata.name}`);
    lines.push(`- **Type**: ${node.type}`);
    lines.push(`- **Technology**: ${node.metadata.technology}`);
    if (node.metadata.description) {
      lines.push(`- **Description**: ${node.metadata.description}`);
    }

    // Connections
    const incoming = project.edges.filter((e) => e.target === node.id);
    const outgoing = project.edges.filter((e) => e.source === node.id);

    if (outgoing.length > 0) {
      lines.push(`- **Connects To**:`);
      outgoing.forEach((edge) => {
        const targetNode = project.nodes.find((n) => n.id === edge.target);
        lines.push(`  - ${targetNode?.metadata.name} (${edge.label})`);
      });
    }

    if (incoming.length > 0) {
      lines.push(`- **Connected From**:`);
      incoming.forEach((edge) => {
        const sourceNode = project.nodes.find((n) => n.id === edge.source);
        lines.push(`  - ${sourceNode?.metadata.name} (${edge.label})`);
      });
    }

    lines.push('');
  });

  return lines.join('\n');
}
