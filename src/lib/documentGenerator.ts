/**
 * Document Generator - converts architecture diagram to markdown
 */

import { Node, Edge } from '@xyflow/react';
import { NodeDataExtended, EdgeDataExtended } from '@/types/architecture';

/**
 * Generate markdown document from nodes and edges
 */
export function generateMarkdownDocument(
  nodes: Node<NodeDataExtended>[],
  edges: Edge<EdgeDataExtended>[],
  projectName: string
): string {
  const lines: string[] = [
    `# ${projectName}`,
    '',
    `*Generated architecture diagram. ${nodes.length} components, ${edges.length} connections.*`,
    '',
  ];

  // Group nodes by category
  const grouped: Record<string, Node<NodeDataExtended>[]> = {};
  for (const node of nodes) {
    const cat = node.data?.category ?? 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(node);
  }

  const categoryLabels: Record<string, string> = {
    compute: 'Compute',
    storage: 'Storage',
    messaging: 'Messaging',
    network: 'Network',
    client: 'Client',
    infrastructure: 'Infrastructure',
  };

  // Generate markdown per category
  for (const [category, categoryNodes] of Object.entries(grouped)) {
    lines.push(`## ${categoryLabels[category] ?? capitalize(category)}`);
    lines.push('');

    for (const node of categoryNodes) {
      const d = node.data;
      if (!d) continue;

      lines.push(`### ${d.icon ?? '◯'} ${d.label}`);
      if (d.sublabel) lines.push(`*${d.sublabel}*`);
      lines.push('');

      if (d.description) {
        lines.push(d.description);
        lines.push('');
      }

      if (d.notes) {
        lines.push(d.notes);
        lines.push('');
      }

      // Capacity section
      if (d.targetRps || d.sla || d.replicas) {
        lines.push('**Capacity:**');
        if (d.targetRps) lines.push(`- Target RPS: ${d.targetRps}`);
        if (d.sla) lines.push(`- SLA: ${d.sla}`);
        if (d.replicas) lines.push(`- Replicas: ${d.replicas}`);
        if (d.region) lines.push(`- Region: ${d.region}`);
        lines.push('');
      }

      // Tags
      if (d.tags?.length ?? 0 > 0) {
        lines.push(`**Tags:** ${d.tags?.map(t => `\`${t}\``).join(', ')}`);
        lines.push('');
      }

      // Connections from this node
      const outgoing = edges.filter(e => e.source === node.id);
      if (outgoing.length > 0) {
        lines.push('**Connects to:**');
        for (const edge of outgoing) {
          const target = nodes.find(n => n.id === edge.target);
          if (target?.data) {
            const ed = edge.data;
            const proto = ed?.protocol ?? 'unknown';
            const syncMode = ed?.syncType ?? 'sync';
            lines.push(`- ${target.data.icon ?? '◯'} **${target.data.label}** via ${proto} (${syncMode})`);
          }
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Export as JSON
 */
export function exportAsJSON(
  nodes: Node<NodeDataExtended>[],
  edges: Edge<EdgeDataExtended>[],
  projectName: string
): string {
  return JSON.stringify(
    {
      projectName,
      timestamp: new Date().toISOString(),
      nodes,
      edges,
    },
    null,
    2
  );
}

/**
 * Capitalize first letter
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
