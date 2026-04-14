/**
 * C4 Model Export Format
 * Exports architecture using C4 model notation for enterprise architecture documentation
 */

import { escapePlantUML, getNodeLabel, createCommentHeader } from './export-utils';

export interface C4ExportOptions {
  includeRelationships: boolean;
  includeDescriptions: boolean;
  includeTechnology: boolean;
}

export interface C4ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
}

/**
 * Export architecture to C4 Model format
 */
export function exportC4(
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options: Partial<C4ExportOptions> = {}
): C4ExportResult {
  const opts: C4ExportOptions = {
    includeRelationships: true,
    includeDescriptions: true,
    includeTechnology: true,
    ...options,
  };

  const c4Lines: string[] = [];

  // Header and configuration
  c4Lines.push(createCommentHeader('c4', projectName));
  c4Lines.push('!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml');
  c4Lines.push('');
  c4Lines.push('title System Context - ' + projectName);
  c4Lines.push('');

  // Map node types to C4 components
  const componentMap: Record<string, string> = {
    'web-frontend': 'Component',
    'mobile-app': 'Component',
    'api-gateway': 'Container',
    'rest-api': 'Container',
    'graphql-server': 'Container',
    'grpc-server': 'Container',
    'websocket-server': 'Container',
    'lambda': 'Component',
    'container': 'Component',
    'vm': 'Container',
    'sql-database': 'ComponentDb',
    'nosql-database': 'ComponentDb',
    'cache': 'ComponentDb',
    'message-queue': 'Component',
    'storage': 'ComponentDb',
    'monitoring': 'Component',
    'logging': 'Component',
  };

  // Components section
  const componentIds: Record<string, string> = {};

  nodes.forEach((node) => {
    const componentId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
    componentIds[node.id] = componentId;

    const c4Type = componentMap[node.type] || 'Component';
    const label = escapePlantUML(node.metadata?.name || node.name || getNodeLabel(node.type));
    const description = opts.includeDescriptions && node.metadata?.description
      ? escapePlantUML(node.metadata.description.substring(0, 80))
      : '';
    const technology = opts.includeTechnology && node.metadata?.technology
      ? escapePlantUML(node.metadata.technology)
      : '';

    if (description && technology) {
      c4Lines.push(`${c4Type}(${componentId}, "${label}", "${technology}", "${description}")`);
    } else if (technology) {
      c4Lines.push(`${c4Type}(${componentId}, "${label}", "${technology}")`);
    } else if (description) {
      c4Lines.push(`${c4Type}(${componentId}, "${label}", "", "${description}")`);
    } else {
      c4Lines.push(`${c4Type}(${componentId}, "${label}")`);
    }
  });

  c4Lines.push('');

  // Relationships section
  if (opts.includeRelationships && edges.length > 0) {
    edges.forEach((edge) => {
      const fromId = componentIds[edge.source] || edge.source.replace(/[^a-zA-Z0-9_]/g, '_');
      const toId = componentIds[edge.target] || edge.target.replace(/[^a-zA-Z0-9_]/g, '_');
      const label = escapePlantUML(edge.label || edge.type || 'communicates');

      c4Lines.push(`Rel(${fromId}, ${toId}, "${label}")`);
    });

    c4Lines.push('');
  }

  const content = c4Lines.join('\n');

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.c4`,
    mimeType: 'text/plain',
    description: 'C4 Model architecture notation - professional enterprise architecture documentation',
  };
}

/**
 * Generate C4 PlantUML rendering instructions
 */
export function getC4RenderingInstructions(): string {
  return `
# C4 Model Export Instructions

1. Copy the generated C4 content
2. Visit: https://www.plantuml.com/plantuml/uml/
3. Paste the content into the editor
4. The diagram will render automatically

## Alternative: Local Rendering

Install PlantUML locally:
\`\`\`bash
# macOS
brew install plantuml

# Ubuntu/Debian
sudo apt-get install plantuml

# Windows (with Chocolatey)
choco install plantuml
\`\`\`

Render to PNG:
\`\`\`bash
plantuml -Tpng architecture.c4 -o architecture.png
\`\`\`
  `.trim();
}
