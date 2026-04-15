/**
 * Validation Engine
 * Comprehensive validation system for import, export, and architecture consistency
 * Handles: format validation, business logic, runtime checks, error reporting
 */

import { ExportFormat } from '../exporters';

export interface ValidationError {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ArchitectureNode {
  id: string;
  type: string;
  data: {
    name: string;
    description?: string;
    technology?: string;
  };
  position?: { x: number; y: number };
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface Architecture {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
  };
}

/**
 * Core Validation Engine
 */
export class ValidationEngine {
  private validators: Map<string, (data: any, nodes?: ArchitectureNode[]) => ValidationResult>;

  constructor() {
    this.validators = new Map();
    this.registerDefaultValidators();
  }

  private registerDefaultValidators() {
    this.validators.set('architecture', this.validateArchitecture.bind(this));
    this.validators.set('node', this.validateNode.bind(this));
    this.validators.set('edge', this.validateEdge.bind(this));
    this.validators.set('import-yaml', this.validateImportYAML.bind(this));
    this.validators.set('import-terraform', this.validateImportTerraform.bind(this));
    this.validators.set('import-plantuml', this.validateImportPlantUML.bind(this));
    this.validators.set('import-cloudformation', this.validateImportCloudFormation.bind(this));
    this.validators.set('import-mermaid', this.validateImportMermaid.bind(this));
    this.validators.set('import-c4', this.validateImportC4.bind(this));
  }

  /**
   * Register custom validator
   */
  registerValidator(name: string, validator: (data: any, nodes?: ArchitectureNode[]) => ValidationResult) {
    this.validators.set(name, validator);
  }

  /**
   * Validate architecture data
   */
  validateArchitecture(arch: Architecture): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Check if architecture is empty
    if (!arch.nodes || arch.nodes.length === 0) {
      info.push({
        code: 'ARCH_EMPTY',
        severity: 'info',
        message: 'Architecture contains no nodes',
      });
    }

    // Validate each node
    if (arch.nodes) {
      for (const node of arch.nodes) {
        const nodeValidation = this.validateNode(node);
        errors.push(...nodeValidation.errors);
        warnings.push(...nodeValidation.warnings);
      }
    }

    // Validate each edge
    if (arch.edges) {
      for (const edge of arch.edges) {
        const edgeValidation = this.validateEdge(edge, arch.nodes || []);
        errors.push(...edgeValidation.errors);
        warnings.push(...edgeValidation.warnings);
      }
    }

    // Check for cycles (optional warning)
    if (arch.edges && arch.edges.length > 0) {
      const hasCycle = this.hasCycle(arch.nodes || [], arch.edges);
      if (hasCycle) {
        warnings.push({
          code: 'ARCH_CYCLE',
          severity: 'warning',
          message: 'Architecture contains circular dependencies',
          suggestion: 'Consider restructuring to remove cycles',
        });
      }
    }

    // Check for isolated nodes
    if (arch.nodes && arch.edges) {
      const connectedNodeIds = new Set<string>();
      for (const edge of arch.edges) {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      }

      const isolatedNodes = arch.nodes.filter((n) => !connectedNodeIds.has(n.id));
      if (isolatedNodes.length > 0) {
        info.push({
          code: 'ARCH_ISOLATED_NODES',
          severity: 'info',
          message: `Architecture contains ${isolatedNodes.length} isolated node(s)`,
          suggestion: 'Consider connecting isolated nodes or removing them',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate individual node
   */
  validateNode(node: ArchitectureNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Required fields
    if (!node.id) {
      errors.push({
        code: 'NODE_MISSING_ID',
        severity: 'error',
        message: 'Node is missing required id',
        field: 'id',
      });
    }

    if (!node.type) {
      errors.push({
        code: 'NODE_MISSING_TYPE',
        severity: 'error',
        message: 'Node is missing required type',
        field: 'type',
      });
    }

    if (!node.data?.name) {
      errors.push({
        code: 'NODE_MISSING_NAME',
        severity: 'error',
        message: 'Node data is missing required name',
        field: 'data.name',
      });
    }

    // Validation rules
    if (node.id && node.id.length > 100) {
      warnings.push({
        code: 'NODE_ID_TOO_LONG',
        severity: 'warning',
        message: 'Node ID is longer than 100 characters',
        field: 'id',
        suggestion: 'Use shorter IDs for better readability',
      });
    }

    if (node.data?.name && node.data.name.length > 100) {
      warnings.push({
        code: 'NODE_NAME_TOO_LONG',
        severity: 'warning',
        message: 'Node name is longer than 100 characters',
        field: 'data.name',
        suggestion: 'Use shorter names',
      });
    }

    // Valid node types
    const validTypes = ['api-server', 'database', 'cache', 'load-balancer', 'message-queue', 'storage', 'function', 'container'];
    if (node.type && !validTypes.includes(node.type)) {
      warnings.push({
        code: 'NODE_INVALID_TYPE',
        severity: 'warning',
        message: `Unknown node type: ${node.type}`,
        field: 'type',
        suggestion: `Valid types: ${validTypes.join(', ')}`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate individual edge
   */
  validateEdge(edge: ArchitectureEdge, nodes?: ArchitectureNode[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const nodesList = nodes || [];

    // Required fields
    if (!edge.id) {
      errors.push({
        code: 'EDGE_MISSING_ID',
        severity: 'error',
        message: 'Edge is missing required id',
        field: 'id',
      });
    }

    if (!edge.source) {
      errors.push({
        code: 'EDGE_MISSING_SOURCE',
        severity: 'error',
        message: 'Edge is missing required source',
        field: 'source',
      });
    }

    if (!edge.target) {
      errors.push({
        code: 'EDGE_MISSING_TARGET',
        severity: 'error',
        message: 'Edge is missing required target',
        field: 'target',
      });
    }

    // Validate references
    const nodeIds = new Set(nodesList.map((n) => n.id));

    if (edge.source && !nodeIds.has(edge.source)) {
      errors.push({
        code: 'EDGE_SOURCE_NOT_FOUND',
        severity: 'error',
        message: `Edge source node "${edge.source}" not found`,
        field: 'source',
      });
    }

    if (edge.target && !nodeIds.has(edge.target)) {
      errors.push({
        code: 'EDGE_TARGET_NOT_FOUND',
        severity: 'error',
        message: `Edge target node "${edge.target}" not found`,
        field: 'target',
      });
    }

    // Self-loop warning
    if (edge.source === edge.target) {
      warnings.push({
        code: 'EDGE_SELF_LOOP',
        severity: 'warning',
        message: 'Edge is a self-loop (node connects to itself)',
        suggestion: 'Remove self-loops or document internal processing',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info: [],
    };
  }

  /**
   * Check if architecture has cycles
   */
  private hasCycle(nodes: ArchitectureNode[], edges: ArchitectureEdge[]): boolean {
    const adjacencyList = new Map<string, Set<string>>();

    for (const node of nodes) {
      adjacencyList.set(node.id, new Set());
    }

    for (const edge of edges) {
      adjacencyList.get(edge.source)?.add(edge.target);
    }

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true;
      }
    }

    return false;
  }

  /**
   * Validate YAML import
   */
  validateImportYAML(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check for required sections
    if (!content.includes('metadata:') && !content.includes('components:')) {
      errors.push({
        code: 'YAML_MISSING_SECTIONS',
        severity: 'error',
        message: 'YAML must contain at least "metadata" or "components" sections',
      });
    }

    // Check YAML syntax (basic)
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      // Check for: undefined values
      if (line.includes(': undefined')) {
        errors.push({
          code: 'YAML_UNDEFINED_VALUES',
          severity: 'error',
          message: `Line ${i + 1}: Contains undefined value`,
          line: i + 1,
        });
      }

      // Check for unquoted special characters
      if (line.includes(': "') || line.includes(": '")) {
        // String values are quoted - good
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info: [],
    };
  }

  /**
   * Validate Terraform import
   */
  validateImportTerraform(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Check required blocks
    if (!content.includes('terraform {')) {
      warnings.push({
        code: 'TF_MISSING_TERRAFORM_BLOCK',
        severity: 'warning',
        message: 'Terraform configuration should contain terraform block',
      });
    }

    // Check HCL syntax
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        code: 'TF_BRACE_MISMATCH',
        severity: 'error',
        message: `Unmatched braces: ${openBraces} open, ${closeBraces} close`,
      });
    }

    // Check for provider requirements
    if (!content.includes('required_providers')) {
      info.push({
        code: 'TF_NO_PROVIDER_LOCK',
        severity: 'info',
        message: 'Consider specifying required_providers for reproducibility',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate PlantUML import
   */
  validateImportPlantUML(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Check for required directives
    if (!content.includes('@startuml')) {
      errors.push({
        code: 'PLANTUML_MISSING_START',
        severity: 'error',
        message: 'PlantUML diagram must start with @startuml',
      });
    }

    if (!content.includes('@enduml')) {
      errors.push({
        code: 'PLANTUML_MISSING_END',
        severity: 'error',
        message: 'PlantUML diagram must end with @enduml',
      });
    }

    // Check for diagram elements
    const hasComponents = /\[.*\]|{.*}/.test(content);
    const hasConnections = /-->|->|--\||<--/.test(content);

    if (!hasComponents && !hasConnections) {
      warnings.push({
        code: 'PLANTUML_EMPTY_DIAGRAM',
        severity: 'warning',
        message: 'PlantUML diagram appears to be empty',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate CloudFormation import
   */
  validateImportCloudFormation(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Check JSON validity
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      errors.push({
        code: 'CF_INVALID_JSON',
        severity: 'error',
        message: 'CloudFormation template must be valid JSON',
      });
      return { valid: false, errors, warnings, info };
    }

    // Check required fields
    if (!parsed.AWSTemplateFormatVersion) {
      errors.push({
        code: 'CF_MISSING_FORMAT_VERSION',
        severity: 'error',
        message: 'Missing AWSTemplateFormatVersion',
      });
    }

    if (!parsed.Resources || Object.keys(parsed.Resources).length === 0) {
      warnings.push({
        code: 'CF_NO_RESOURCES',
        severity: 'warning',
        message: 'Template contains no resources',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate Mermaid import
   */
  validateImportMermaid(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Check for graph declaration
    if (!content.includes('graph ')) {
      errors.push({
        code: 'MERMAID_NO_GRAPH',
        severity: 'error',
        message: 'Mermaid diagram must start with "graph" declaration',
      });
    }

    // Check for direction
    const validDirections = ['TB', 'BT', 'LR', 'RL'];
    const hasDirection = validDirections.some((dir) => content.includes(`graph ${dir}`));

    if (!hasDirection) {
      warnings.push({
        code: 'MERMAID_NO_DIRECTION',
        severity: 'warning',
        message: 'Mermaid diagram should specify direction (TB, BT, LR, RL)',
        suggestion: 'Use: graph TB (top-to-bottom)',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate C4 Model import
   */
  validateImportC4(content: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];

    // Check for C4 directives
    if (!content.includes('@startuml')) {
      errors.push({
        code: 'C4_MISSING_START',
        severity: 'error',
        message: 'C4 model must start with @startuml',
      });
    }

    if (!content.includes('C4_')) {
      warnings.push({
        code: 'C4_MISSING_LIBRARY',
        severity: 'warning',
        message: 'C4 model should include C4 library (!include C4_*.puml)',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate by format
   */
  validateByFormat(format: ExportFormat, content: string): ValidationResult {
    const validatorKey = `import-${format}`;
    const validator = this.validators.get(validatorKey);

    if (!validator) {
      return {
        valid: false,
        errors: [
          {
            code: 'UNKNOWN_FORMAT',
            severity: 'error',
            message: `Unknown format: ${format}`,
          },
        ],
        warnings: [],
        info: [],
      };
    }

    return validator(content);
  }

  /**
   * Get validation summary
   */
  getSummary(result: ValidationResult): string {
    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;
    const infoCount = result.info.length;

    if (result.valid) {
      return `✅ Valid${infoCount > 0 ? ` (${infoCount} info)` : ''}`;
    }

    return `❌ ${errorCount} error(s), ${warningCount} warning(s)`;
  }

  /**
   * Format validation result for display
   */
  formatResult(result: ValidationResult): string {
    let output = '';

    if (result.errors.length > 0) {
      output += '❌ ERRORS:\n';
      for (const error of result.errors) {
        output += `  - [${error.code}] ${error.message}`;
        if (error.line) output += ` (line ${error.line})`;
        if (error.suggestion) output += `\n    Suggestion: ${error.suggestion}`;
        output += '\n';
      }
    }

    if (result.warnings.length > 0) {
      output += '⚠️  WARNINGS:\n';
      for (const warning of result.warnings) {
        output += `  - [${warning.code}] ${warning.message}`;
        if (warning.suggestion) output += `\n    Suggestion: ${warning.suggestion}`;
        output += '\n';
      }
    }

    if (result.info.length > 0) {
      output += 'ℹ️  INFO:\n';
      for (const info of result.info) {
        output += `  - [${info.code}] ${info.message}\n`;
      }
    }

    return output;
  }
}

// Singleton instance
export const validationEngine = new ValidationEngine();
