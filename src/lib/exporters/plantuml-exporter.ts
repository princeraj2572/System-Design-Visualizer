/**
 * PlantUML Export Format
 * Exports architecture as PlantUML diagram source code
 * Can be rendered to PNG/SVG using PlantUML online or locally
 */

import { escapePlantUML, getNodeLabel, createCommentHeader, getConnectionTypeLabel } from './export-utils';

export interface PlantUMLExportOptions {
  theme: 'default' | 'dark';
  layout: 'TB' | 'LR' | 'BT' | 'RL';
  includeDescriptions: boolean;
}

export interface PlantUMLExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
}

/**
 * Export architecture to PlantUML format
 */
export function exportPlantUML(
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options: Partial<PlantUMLExportOptions> = {}
): PlantUMLExportResult {
  const opts: PlantUMLExportOptions = {
    theme: 'default',
    layout: 'TB',
    includeDescriptions: true,
    ...options,
  };

  const pumlLines: string[] = [];

  // Header
  pumlLines.push('@startuml');
  pumlLines.push(`!define TITLE ${escapePlantUML(projectName)}`);

  if (opts.theme === 'dark') {
    pumlLines.push('!theme dark');
  }

  pumlLines.push(`!direction ${opts.layout}`);
  pumlLines.push('');

  // Title
  pumlLines.push(`title ${escapePlantUML(projectName)} Architecture`);
  pumlLines.push('');

  // Define node macros
  const nodeTypeMap: Record<string, string> = {
    'client': 'USER',
    'web-frontend': 'PACKAGE',
    'mobile-app': 'PACKAGE',
    'api-gateway': 'INTERFACE',
    'rest-api': 'INTERFACE',
    'graphql-server': 'INTERFACE',
    'grpc-server': 'INTERFACE',
    'websocket-server': 'INTERFACE',
    'lambda': 'ARTIFACT',
    'container': 'ARTIFACT',
    'vm': 'ARTIFACT',
    'sql-database': 'DATABASE',
    'nosql-database': 'DATABASE',
    'graph-database': 'DATABASE',
    'search-engine': 'DATABASE',
    'data-warehouse': 'DATABASE',
    'cache': 'DATABASE',
    'cdn': 'CLOUD',
    'message-queue': 'QUEUE',
    'pub-sub': 'CLOUD',
    'event-bus': 'CLOUD',
    'load-balancer': 'CIRCLE',
    'reverse-proxy': 'CIRCLE',
    'firewall': 'SECURITY',
    'dns': 'CARD',
    'storage': 'STORAGE',
    'monitoring': 'MONITORING',
    'logging': 'CARD',
    'tracing': 'CARD',
    'alerting': 'WARNING',
  };

  // Nodes section
  pumlLines.push('' + ' Component Definitions');
  nodes.forEach((node) => {
    const idSafe = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const label = escapePlantUML(node.metadata?.name || node.name || getNodeLabel(node.type));
    const tech = node.metadata?.technology || '';
    const desc = node.metadata?.description || '';

    let nodeDecl = `${idSafe}`;

    if (opts.includeDescriptions && desc) {
      nodeDecl += ` : ${escapePlantUML(desc.substring(0, 50))}`;
    } else if (tech) {
      nodeDecl += ` : [${tech}]`;
    }

    pumlLines.push(`component "${label}" as ${idSafe} ${nodeDecl}`);
  });

  pumlLines.push('');

  // Connections section
  pumlLines.push(''" + ' Connections');
  edges.forEach((edge) => {
    const fromSafe = edge.source.replace(/[^a-zA-Z0-9_]/g, '_');
    const toSafe = edge.target.replace(/[^a-zA-Z0-9_]/g, '_');
    const label = escapePlantUML(edge.label || getConnectionTypeLabel(edge.type));

    pumlLines.push(`${fromSafe} --> ${toSafe} : ${label}`);
  });

  pumlLines.push('');

  // Footer
  pumlLines.push('@enduml');

  const content = pumlLines.join('\n');

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.puml`,
    mimeType: 'text/plain',
    description: 'PlantUML diagram source - renders to PNG/SVG using PlantUML tools (plantuml.com)',
  };
}

/**
 * Generate a PlantUML rendering URL for online visualization
 */
export function getPlantUMLRenderUrl(pumlContent: string): string {
  const encoded = Buffer.from(pumlContent).toString('base64');
  return `https://www.plantuml.com/plantuml/img/${encoded}`;
}

/**
 * Generate a PlantUML online editor URL
 */
export function getPlantUMLEditorUrl(pumlContent: string): string {
  const encoded = Buffer.from(pumlContent).toString('base64');
  return `https://www.plantuml.com/plantuml/uml/${encoded}`;
}
