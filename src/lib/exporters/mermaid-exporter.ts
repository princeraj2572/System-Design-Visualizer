/**
 * Mermaid Export Format
 * Exports architecture as Mermaid diagram syntax - lightweight and embeddable
 */

import { escapeMermaid, getNodeLabel, getConnectionTypeLabel } from './export-utils';

export interface MermaidExportOptions {
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  includeDescriptions: boolean;
}

export interface MermaidExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
}

/**
 * Export architecture to Mermaid format
 */
export function exportMermaid(
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options: Partial<MermaidExportOptions> = {}
): MermaidExportResult {
  const opts: MermaidExportOptions = {
    direction: 'TB',
    includeDescriptions: true,
    ...options,
  };

  const mermaidLines: string[] = [];

  // Header
  mermaidLines.push(`graph ${opts.direction}`);
  mermaidLines.push('');

  // Nodes section
  const nodeMap: Record<string, string> = {};

  nodes.forEach((node) => {
    const nodeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
    nodeMap[node.id] = nodeId;

    const label = escapeMermaid(node.metadata?.name || node.name || getNodeLabel(node.type));
    const tech = node.metadata?.technology ? `<br/>[${escapeMermaid(node.metadata.technology)}]` : '';

    mermaidLines.push(`    ${nodeId}["${label}${tech}"]`);
  });

  mermaidLines.push('');

  // Connections section
  edges.forEach((edge) => {
    const fromId = nodeMap[edge.source] || edge.source.replace(/[^a-zA-Z0-9_]/g, '_');
    const toId = nodeMap[edge.target] || edge.target.replace(/[^a-zA-Z0-9_]/g, '_');
    const label = escapeMermaid(edge.label || getConnectionTypeLabel(edge.type));

    mermaidLines.push(`    ${fromId} -->|${label}| ${toId}`);
  });

  // Style section
  if (nodes.length > 0) {
    mermaidLines.push('');
    mermaidLines.push('    style default fill:#f9f9f9,stroke:#333,stroke-width:2px');

    // Add category-based styling
    const frontendNodes = nodes.filter((n: any) =>
      ['client', 'web-frontend', 'mobile-app'].includes(n.type)
    );
    const apiNodes = nodes.filter((n: any) =>
      ['api-gateway', 'rest-api', 'graphql-server', 'grpc-server', 'websocket-server'].includes(n.type)
    );
    const dataNodes = nodes.filter((n: any) =>
      ['sql-database', 'nosql-database', 'cache', 'search-engine'].includes(n.type)
    );

    frontendNodes.forEach((node: any) => {
      const nodeId = nodeMap[node.id];
      mermaidLines.push(`    style ${nodeId} fill:#dbeafe,stroke:#0284c7,stroke-width:2px`);
    });

    apiNodes.forEach((node: any) => {
      const nodeId = nodeMap[node.id];
      mermaidLines.push(`    style ${nodeId} fill:#dbeafe,stroke:#0284c7,stroke-width:2px`);
    });

    dataNodes.forEach((node: any) => {
      const nodeId = nodeMap[node.id];
      mermaidLines.push(`    style ${nodeId} fill:#e0e7ff,stroke:#6366f1,stroke-width:2px`);
    });
  }

  const content = mermaidLines.join('\n');

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.mmd`,
    mimeType: 'text/plain',
    description: 'Mermaid diagram format - lightweight, embeddable in Markdown and documentation',
  };
}
