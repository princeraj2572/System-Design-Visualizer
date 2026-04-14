/**
 * Export Coordinator
 * Central hub for all export formats
 */

import { exportYaml, YamlExportOptions } from './yaml-exporter';
import { exportPlantUML, PlantUMLExportOptions } from './plantuml-exporter';
import { exportTerraform, TerraformExportOptions } from './terraform-exporter';
import { exportCloudFormation, CloudFormationExportOptions } from './cloudformation-exporter';
import { exportMermaid, MermaidExportOptions } from './mermaid-exporter';
import { exportC4, C4ExportOptions } from './c4-exporter';

export type ExportFormat = 'yaml' | 'plantuml' | 'terraform' | 'cloudformation' | 'mermaid' | 'c4';

export interface ExportOptions {
  yaml?: Partial<YamlExportOptions>;
  plantuml?: Partial<PlantUMLExportOptions>;
  terraform?: Partial<TerraformExportOptions>;
  cloudformation?: Partial<CloudFormationExportOptions>;
  mermaid?: Partial<MermaidExportOptions>;
  c4?: Partial<C4ExportOptions>;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
  format: ExportFormat;
}

/**
 * Export architecture in the specified format
 */
export function exportArchitecture(
  format: ExportFormat,
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options?: ExportOptions
): ExportResult {
  try {
    let result: any;

    switch (format.toLowerCase()) {
      case 'yaml':
        result = exportYaml(nodes, edges, projectName, options?.yaml);
        break;

      case 'plantuml':
        result = exportPlantUML(nodes, edges, projectName, options?.plantuml);
        break;

      case 'terraform':
        result = exportTerraform(nodes, edges, projectName, options?.terraform);
        break;

      case 'cloudformation':
        result = exportCloudFormation(nodes, edges, projectName, options?.cloudformation);
        break;

      case 'mermaid':
        result = exportMermaid(nodes, edges, projectName, options?.mermaid);
        break;

      case 'c4':
        result = exportC4(nodes, edges, projectName, options?.c4);
        break;

      default:
        throw new Error(`Unknown export format: ${format}`);
    }

    return {
      ...result,
      format,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Export failed for format ${format}: ${errorMsg}`);
  }
}

/**
 * Get list of all supported export formats with descriptions
 */
export function getSupportedFormats(): Array<{
  id: ExportFormat;
  name: string;
  description: string;
  icon: string;
}> {
  return [
    {
      id: 'yaml',
      name: 'YAML',
      description: 'Structured architecture specification - great for version control and parsing',
      icon: '📋',
    },
    {
      id: 'plantuml',
      name: 'PlantUML',
      description: 'Diagram source code that renders to PNG/SVG - share with teams',
      icon: '📊',
    },
    {
      id: 'terraform',
      name: 'Terraform',
      description: 'Infrastructure-as-code for AWS/GCP/Azure deployment',
      icon: '🏗️',
    },
    {
      id: 'cloudformation',
      name: 'CloudFormation',
      description: 'AWS native Infrastructure-as-Code template',
      icon: '☁️',
    },
    {
      id: 'mermaid',
      name: 'Mermaid',
      description: 'Lightweight diagrams - embeddable in Markdown and docs',
      icon: '🦑',
    },
    {
      id: 'c4',
      name: 'C4 Model',
      description: 'Enterprise architecture notation - professional documentation',
      icon: '🏛️',
    },
  ];
}

/**
 * Get default options for a format
 */
export function getDefaultOptions(format: ExportFormat): any {
  const defaults: Record<ExportFormat, any> = {
    yaml: {
      includeMetadata: true,
      includeTags: false,
      prettyPrint: true,
    },
    plantuml: {
      theme: 'default',
      layout: 'TB',
      includeDescriptions: true,
    },
    terraform: {
      provider: 'aws',
      includeVariables: true,
      includeOutputs: true,
    },
    cloudformation: {
      format: 'yaml',
      includeParameters: true,
      includeOutputs: true,
    },
    mermaid: {
      direction: 'TB',
      includeDescriptions: true,
    },
    c4: {
      includeRelationships: true,
      includeDescriptions: true,
      includeTechnology: true,
    },
  };

  return defaults[format] || {};
}
