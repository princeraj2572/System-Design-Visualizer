/**
 * Export Testing Utilities
 * Comprehensive testing suite for all export formats
 * Tests include: valid output, edge cases, performance, error handling
 */

import {
  exportArchitecture,
  getSupportedFormats,
  ExportFormat,
} from './index';

/**
 * Test data generators
 */
export const testDataGenerators = {
  /**
   * Simple 3-node architecture
   */
  simple: () => ({
    nodes: [
      {
        id: 'api-1',
        type: 'api-server',
        data: { name: 'API Gateway', description: 'Entry point', technology: 'Node.js' },
        position: { x: 100, y: 100 },
      },
      {
        id: 'db-1',
        type: 'database',
        data: { name: 'PostgreSQL', description: 'Main database', technology: 'PostgreSQL' },
        position: { x: 100, y: 300 },
      },
      {
        id: 'cache-1',
        type: 'cache',
        data: { name: 'Redis Cache', description: 'Session cache', technology: 'Redis' },
        position: { x: 300, y: 300 },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'api-1',
        target: 'db-1',
        label: 'HTTP/REST',
        type: 'http',
      },
      {
        id: 'edge-2',
        source: 'api-1',
        target: 'cache-1',
        label: 'Message Queue',
        type: 'message-queue',
      },
    ],
  }),

  /**
   * Complex microservices architecture
   */
  complex: () => ({
    nodes: [
      {
        id: 'lb-1',
        type: 'load-balancer',
        data: { name: 'Load Balancer', description: 'Distributes traffic', technology: 'NGINX' },
        position: { x: 50, y: 50 },
      },
      {
        id: 'api-1',
        type: 'api-server',
        data: { name: 'Auth Service', description: 'User authentication', technology: 'Go' },
        position: { x: 200, y: 150 },
      },
      {
        id: 'api-2',
        type: 'api-server',
        data: { name: 'Order Service', description: 'Order processing', technology: 'Python' },
        position: { x: 400, y: 150 },
      },
      {
        id: 'api-3',
        type: 'api-server',
        data: { name: 'Payment Service', description: 'Payment processing', technology: 'Java' },
        position: { x: 600, y: 150 },
      },
      {
        id: 'db-1',
        type: 'database',
        data: { name: 'Auth DB', description: 'User credentials', technology: 'PostgreSQL' },
        position: { x: 200, y: 350 },
      },
      {
        id: 'db-2',
        type: 'database',
        data: { name: 'Order DB', description: 'Order data', technology: 'MongoDB' },
        position: { x: 400, y: 350 },
      },
      {
        id: 'cache-1',
        type: 'cache',
        data: { name: 'Redis', description: 'Distributed cache', technology: 'Redis' },
        position: { x: 600, y: 350 },
      },
      {
        id: 'queue-1',
        type: 'message-queue',
        data: { name: 'RabbitMQ', description: 'Message broker', technology: 'RabbitMQ' },
        position: { x: 300, y: 500 },
      },
    ],
    edges: [
      { id: 'e1', source: 'lb-1', target: 'api-1', label: 'HTTP', type: 'http' },
      { id: 'e2', source: 'lb-1', target: 'api-2', label: 'HTTP', type: 'http' },
      { id: 'e3', source: 'lb-1', target: 'api-3', label: 'HTTP', type: 'http' },
      { id: 'e4', source: 'api-1', target: 'db-1', label: 'SQL', type: 'database' },
      { id: 'e5', source: 'api-2', target: 'db-2', label: 'Query', type: 'database' },
      { id: 'e6', source: 'api-2', target: 'cache-1', label: 'Cache', type: 'http' },
      { id: 'e7', source: 'api-2', target: 'queue-1', label: 'Enqueue', type: 'message-queue' },
      { id: 'e8', source: 'api-3', target: 'cache-1', label: 'Lookup', type: 'http' },
    ],
  }),

  /**
   * Empty architecture
   */
  empty: () => ({
    nodes: [],
    edges: [],
  }),

  /**
   * Single node
   */
  single: () => ({
    nodes: [
      {
        id: 'app-1',
        type: 'microservice',
        data: { name: 'Single App', description: 'Standalone app', technology: 'Node.js' },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  }),

  /**
   * Architecture with special characters
   */
  specialCharacters: () => ({
    nodes: [
      {
        id: 'api-special',
        type: 'api-server',
        data: {
          name: 'API "Gateway" & Load Balancer',
          description: 'Service with <tags> and "quotes" & special chars',
          technology: 'Node.js 18.x (LTS)',
        },
        position: { x: 100, y: 100 },
      },
      {
        id: 'db-special',
        type: 'database',
        data: {
          name: "Database (PG 14)",
          description: 'Primary RDBMS: SQL & JSON support',
          technology: 'PostgreSQL 14.x',
        },
        position: { x: 100, y: 300 },
      },
    ],
    edges: [
      {
        id: 'edge-special',
        source: 'api-special',
        target: 'db-special',
        label: 'SQL (Read/Write) & Cache Hits',
        type: 'database',
      },
    ],
  }),
};

/**
 * Validation functions for each format
 */
export const exportValidators = {
  /**
   * Validate YAML output
   */
  yaml: (content: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check basic structure
    if (!content.includes('metadata:')) {
      errors.push('Missing metadata section');
    }
    if (!content.includes('components:')) {
      errors.push('Missing components section');
    }

    // Check for valid YAML structure
    if (content.includes(': undefined')) {
      errors.push('Contains undefined values');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate Terraform output
   */
  terraform: (content: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check basic Terraform structure
    if (!content.includes('terraform {')) {
      errors.push('Missing terraform block');
    }
    if (!content.includes('required_providers')) {
      errors.push('Missing provider requirements');
    }

    // Check for valid HCL syntax
    const braceCount = (content.match(/{/g) || []).length;
    const closeCount = (content.match(/}/g) || []).length;
    if (braceCount !== closeCount) {
      errors.push('Unmatched braces in HCL syntax');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate PlantUML output
   */
  plantuml: (content: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check PlantUML format
    if (!content.includes('@startuml')) {
      errors.push('Missing @startuml directive');
    }
    if (!content.includes('@enduml')) {
      errors.push('Missing @enduml directive');
    }

    // Check for matching start/end
    const startCount = (content.match(/@startuml/g) || []).length;
    const endCount = (content.match(/@enduml/g) || []).length;
    if (startCount !== endCount) {
      errors.push('Mismatched @startuml/@enduml');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate CloudFormation output
   */
  cloudformation: (content: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    try {
      const json = JSON.parse(content);

      if (!json.AWSTemplateFormatVersion) {
        errors.push('Missing AWSTemplateFormatVersion');
      }
      if (!json.Resources || typeof json.Resources !== 'object') {
        errors.push('Invalid or missing Resources section');
      }
    } catch (e) {
      errors.push(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate Mermaid output
   */
  mermaid: (content: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check Mermaid diagram format
    if (!content.includes('graph')) {
      errors.push('Missing graph declaration');
    }

    // Basic syntax check
    if (content.match(/--|--/) && !content.match(/(TB|LR|BT|RL)/)) {
      errors.push('No direction specified');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate C4 output
   */
  c4: (content: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check C4 format
    if (!content.includes('@startuml')) {
      errors.push('Missing @startuml in C4 diagram');
    }
    if (!content.includes('!include')) {
      errors.push('Missing C4 library include');
    }

    return { valid: errors.length === 0, errors };
  },
};

/**
 * Main test runner
 */
export async function runExportTests() {
  const results: Record<string, any> = {};

  console.log('🧪 Starting Export Format Tests...\n');

  // Test each format with each data generator
  const formats = getSupportedFormats();
  const generators = Object.entries(testDataGenerators);

  for (const [generatorName, generator] of generators) {
    results[generatorName] = {};
    const testData = generator();

    console.log(`\n📊 Testing with dataset: ${generatorName}`);
    console.log(`   Nodes: ${testData.nodes.length}, Edges: ${testData.edges.length}`);

    for (const format of formats) {
      try {
        const startTime = performance.now();
        const result = exportArchitecture(format.id as ExportFormat, testData.nodes, testData.edges, 'TestProject');
        const endTime = performance.now();

        const validator = exportValidators[format.id as keyof typeof exportValidators];
        const validation = validator
          ? validator(result.content)
          : { valid: true, errors: [] };

        results[generatorName][format.id] = {
          success: true,
          valid: validation.valid,
          errors: validation.errors,
          contentLength: result.content.length,
          executionTime: `${(endTime - startTime).toFixed(2)}ms`,
        };

        const status = validation.valid ? '✅' : '⚠️';
        console.log(`   ${status} ${format.name}: ${result.content.length} chars in ${(endTime - startTime).toFixed(2)}ms`);

        if (validation.errors.length > 0) {
          console.log(`      Warnings: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        results[generatorName][format.id] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        console.log(`   ❌ ${format.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  console.log('\n📋 Test Summary:');
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const [, formatResults] of Object.entries(results)) {
    for (const [, result] of Object.entries(formatResults as Record<string, any>)) {
      if ((result as any).success === false) {
        failCount++;
      } else if (!(result as any).valid) {
        warnCount++;
      } else {
        passCount++;
      }
    }
  }

  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ⚠️  Warnings: ${warnCount}`);
  console.log(`   ❌ Failed: ${failCount}`);

  return results;
}

/**
 * Export results summary
 */
export function exportTestResults(results: Record<string, any>): string {
  let summary = '# Export Format Test Results\n\n';

  for (const [, formatResults] of Object.entries(results)) {
    summary += `## Dataset: ${Object.keys(formatResults)[0]}\n\n`;
    summary += '| Format | Result | Issues |\n';
    summary += '|--------|--------|--------|\n';

    for (const [format, result] of Object.entries(formatResults as Record<string, any>)) {
      const resultData = result as any;
      if (!resultData.success) {
        summary += `| ${format} | ❌ Failed | ${resultData.error} |\n`;
      } else {
        const status = resultData.valid ? '✅ Valid' : '⚠️ Warnings';
        const issues = resultData.errors.length > 0 ? resultData.errors.join('; ') : 'None';
        summary += `| ${format} | ${status} | ${issues} |\n`;
      }
    }

    summary += '\n';
  }

  return summary;
}
