/**
 * Validation Engine Tests
 * Comprehensive test suite for all validation functions
 */

import { validationEngine, type Architecture } from './validation-engine';

export const validationTests = {
  /**
   * Run all validation tests
   */
  runAllTests: async () => {
    const results: { [key: string]: { passed: number; failed: number; tests: any[] } } = {};

    // Architecture validation tests
    results['architecture'] = validationTests.testArchitectureValidation();

    // Node validation tests
    results['node'] = validationTests.testNodeValidation();

    // Edge validation tests
    results['edge'] = validationTests.testEdgeValidation();

    // Import validation tests
    results['import-yaml'] = validationTests.testImportYAML();
    results['import-terraform'] = validationTests.testImportTerraform();
    results['import-plantuml'] = validationTests.testImportPlantUML();
    results['import-cloudformation'] = validationTests.testImportCloudFormation();
    results['import-mermaid'] = validationTests.testImportMermaid();
    results['import-c4'] = validationTests.testImportC4();

    return results;
  },

  /**
   * Test architecture validation
   */
  testArchitectureValidation: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid simple architecture
    const arch1: Architecture = {
      nodes: [
        {
          id: 'api-1',
          type: 'api-server',
          data: { name: 'API', description: 'Test API', technology: 'Node.js' },
        },
        {
          id: 'db-1',
          type: 'database',
          data: { name: 'Database', description: 'Test DB', technology: 'PostgreSQL' },
        },
      ],
      edges: [{ id: 'e1', source: 'api-1', target: 'db-1', label: 'queries' }],
    };

    const result1 = validationEngine.validateArchitecture(arch1);
    if (result1.valid && result1.errors.length === 0) {
      passed++;
      tests.push({ name: 'Valid simple architecture', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid simple architecture', result: 'FAIL', errors: result1.errors });
    }

    // Test 2: Empty architecture
    const arch2: Architecture = { nodes: [], edges: [] };

    const result2 = validationEngine.validateArchitecture(arch2);
    if (result2.valid && result2.info.length > 0) {
      passed++;
      tests.push({ name: 'Empty architecture', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Empty architecture', result: 'FAIL' });
    }

    // Test 3: Architecture with invalid edge (target not found)
    const arch3: Architecture = {
      nodes: [
        {
          id: 'api-1',
          type: 'api-server',
          data: { name: 'API' },
        },
      ],
      edges: [{ id: 'e1', source: 'api-1', target: 'db-nonexistent', label: 'queries' }],
    };

    const result3 = validationEngine.validateArchitecture(arch3);
    if (!result3.valid && result3.errors.length > 0) {
      passed++;
      tests.push({ name: 'Invalid edge reference', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Invalid edge reference', result: 'FAIL' });
    }

    // Test 4: Detect cycles
    const arch4: Architecture = {
      nodes: [
        {
          id: 'a',
          type: 'api-server',
          data: { name: 'A' },
        },
        {
          id: 'b',
          type: 'api-server',
          data: { name: 'B' },
        },
        {
          id: 'c',
          type: 'api-server',
          data: { name: 'C' },
        },
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' },
        { id: 'e3', source: 'c', target: 'a' }, // cycle
      ],
    };

    const result4 = validationEngine.validateArchitecture(arch4);
    if (result4.warnings.some((w) => w.code === 'ARCH_CYCLE')) {
      passed++;
      tests.push({ name: 'Cycle detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Cycle detection', result: 'FAIL' });
    }

    // Test 5: Isolated nodes detection
    const arch5: Architecture = {
      nodes: [
        {
          id: 'a',
          type: 'api-server',
          data: { name: 'A' },
        },
        {
          id: 'b',
          type: 'api-server',
          data: { name: 'B' },
        },
        {
          id: 'c',
          type: 'database',
          data: { name: 'C (isolated)' },
        },
      ],
      edges: [{ id: 'e1', source: 'a', target: 'b' }],
    };

    const result5 = validationEngine.validateArchitecture(arch5);
    if (result5.info.some((i) => i.code === 'ARCH_ISOLATED_NODES')) {
      passed++;
      tests.push({ name: 'Isolated nodes detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Isolated nodes detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  /**
   * Test node validation
   */
  testNodeValidation: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid node
    const result1 = validationEngine.validateNode({
      id: 'api-1',
      type: 'api-server',
      data: { name: 'API Gateway', technology: 'Node.js' },
    });
    if (result1.valid && result1.errors.length === 0) {
      passed++;
      tests.push({ name: 'Valid node', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid node', result: 'FAIL' });
    }

    // Test 2: Missing required id
    const result2 = validationEngine.validateNode({
      id: '', // empty
      type: 'api-server',
      data: { name: 'API' },
    });
    if (!result2.valid && result2.errors.some((e) => e.code === 'NODE_MISSING_ID')) {
      passed++;
      tests.push({ name: 'Missing ID detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing ID detection', result: 'FAIL' });
    }

    // Test 3: Missing name
    const result3 = validationEngine.validateNode({
      id: 'api-1',
      type: 'api-server',
      data: { name: '' },
    });
    if (!result3.valid && result3.errors.some((e) => e.code === 'NODE_MISSING_NAME')) {
      passed++;
      tests.push({ name: 'Missing name detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing name detection', result: 'FAIL' });
    }

    // Test 4: Invalid node type
    const result4 = validationEngine.validateNode({
      id: 'invalid-1',
      type: 'invalid-type',
      data: { name: 'Invalid' },
    });
    if (!result4.valid || result4.warnings.some((w) => w.code === 'NODE_INVALID_TYPE')) {
      passed++;
      tests.push({ name: 'Invalid type detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Invalid type detection', result: 'FAIL' });
    }

    // Test 5: Long name warning
    const result5 = validationEngine.validateNode({
      id: 'api-1',
      type: 'api-server',
      data: { name: 'A'.repeat(101) },
    });
    if (result5.warnings.some((w) => w.code === 'NODE_NAME_TOO_LONG')) {
      passed++;
      tests.push({ name: 'Long name warning', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Long name warning', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  /**
   * Test edge validation
   */
  testEdgeValidation: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    const nodes = [
      { id: 'a', type: 'api-server', data: { name: 'A' } },
      { id: 'b', type: 'database', data: { name: 'B' } },
    ];

    // Test 1: Valid edge
    const result1 = validationEngine.validateEdge(
      { id: 'e1', source: 'a', target: 'b', label: 'queries' },
      nodes
    );
    if (result1.valid && result1.errors.length === 0) {
      passed++;
      tests.push({ name: 'Valid edge', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid edge', result: 'FAIL' });
    }

    // Test 2: Missing source
    const result2 = validationEngine.validateEdge(
      { id: 'e1', source: '', target: 'b' },
      nodes
    );
    if (!result2.valid && result2.errors.some((e) => e.code === 'EDGE_MISSING_SOURCE')) {
      passed++;
      tests.push({ name: 'Missing source detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing source detection', result: 'FAIL' });
    }

    // Test 3: Invalid source reference
    const result3 = validationEngine.validateEdge(
      { id: 'e1', source: 'nonexistent', target: 'b' },
      nodes
    );
    if (!result3.valid && result3.errors.some((e) => e.code === 'EDGE_SOURCE_NOT_FOUND')) {
      passed++;
      tests.push({ name: 'Invalid source reference', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Invalid source reference', result: 'FAIL' });
    }

    // Test 4: Self-loop detection
    const result4 = validationEngine.validateEdge(
      { id: 'e1', source: 'a', target: 'a' },
      nodes
    );
    if (result4.warnings.some((w) => w.code === 'EDGE_SELF_LOOP')) {
      passed++;
      tests.push({ name: 'Self-loop detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Self-loop detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  /**
   * Test import validators
   */
  testImportYAML: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid YAML
    const yaml1 = `
metadata:
  name: Test
  version: 1.0

components:
  - id: api-1
    name: API
`;
    const result1 = validationEngine.validateImportYAML(yaml1);
    if (result1.valid) {
      passed++;
      tests.push({ name: 'Valid YAML', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid YAML', result: 'FAIL' });
    }

    // Test 2: Missing sections
    const yaml2 = 'just random text';
    const result2 = validationEngine.validateImportYAML(yaml2);
    if (!result2.valid) {
      passed++;
      tests.push({ name: 'Missing sections detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing sections detection', result: 'FAIL' });
    }

    // Test 3: Undefined values
    const yaml3 = 'metadata:\n  name: undefined';
    const result3 = validationEngine.validateImportYAML(yaml3);
    if (!result3.valid && result3.errors.some((e) => e.code === 'YAML_UNDEFINED_VALUES')) {
      passed++;
      tests.push({ name: 'Undefined values detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Undefined values detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  testImportTerraform: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid Terraform
    const tf1 = `
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

resource "aws_instance" "api" {
  ami = "ami-123"
}
`;
    const result1 = validationEngine.validateImportTerraform(tf1);
    if (result1.valid) {
      passed++;
      tests.push({ name: 'Valid Terraform', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid Terraform', result: 'FAIL' });
    }

    // Test 2: Brace mismatch
    const tf2 = 'terraform { \n resource "aws_instance" "api" { }';
    const result2 = validationEngine.validateImportTerraform(tf2);
    if (!result2.valid && result2.errors.some((e) => e.code === 'TF_BRACE_MISMATCH')) {
      passed++;
      tests.push({ name: 'Brace mismatch detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Brace mismatch detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  testImportPlantUML: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid PlantUML
    const puml1 = `
@startuml
[API] --> [Database]
@enduml
`;
    const result1 = validationEngine.validateImportPlantUML(puml1);
    if (result1.valid) {
      passed++;
      tests.push({ name: 'Valid PlantUML', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid PlantUML', result: 'FAIL' });
    }

    // Test 2: Missing start
    const puml2 = '[API] --> [DB]\n@enduml';
    const result2 = validationEngine.validateImportPlantUML(puml2);
    if (!result2.valid && result2.errors.some((e) => e.code === 'PLANTUML_MISSING_START')) {
      passed++;
      tests.push({ name: 'Missing @startuml detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing @startuml detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  testImportCloudFormation: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid CloudFormation
    const cf1 = JSON.stringify({
      AWSTemplateFormatVersion: '2010-09-09',
      Resources: {
        APIInstance: {
          Type: 'AWS::EC2::Instance',
          Properties: { ImageId: 'ami-123' },
        },
      },
    });
    const result1 = validationEngine.validateImportCloudFormation(cf1);
    if (result1.valid) {
      passed++;
      tests.push({ name: 'Valid CloudFormation', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid CloudFormation', result: 'FAIL' });
    }

    // Test 2: Invalid JSON
    const cf2 = '{ invalid json }';
    const result2 = validationEngine.validateImportCloudFormation(cf2);
    if (!result2.valid && result2.errors.some((e) => e.code === 'CF_INVALID_JSON')) {
      passed++;
      tests.push({ name: 'Invalid JSON detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Invalid JSON detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  testImportMermaid: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid Mermaid
    const md1 = 'graph TB\n  A --> B';
    const result1 = validationEngine.validateImportMermaid(md1);
    if (result1.valid) {
      passed++;
      tests.push({ name: 'Valid Mermaid', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid Mermaid', result: 'FAIL' });
    }

    // Test 2: Missing graph declaration
    const md2 = 'A --> B';
    const result2 = validationEngine.validateImportMermaid(md2);
    if (!result2.valid && result2.errors.some((e) => e.code === 'MERMAID_NO_GRAPH')) {
      passed++;
      tests.push({ name: 'Missing graph detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing graph detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },

  testImportC4: () => {
    const tests: any[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Valid C4
    const c41 = '@startuml\n!include https://raw...C4_Context.puml\nSystem(A, "Test")';
    const result1 = validationEngine.validateImportC4(c41);
    if (result1.valid) {
      passed++;
      tests.push({ name: 'Valid C4', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Valid C4', result: 'FAIL' });
    }

    // Test 2: Missing start
    const c42 = 'System(A, "Test")';
    const result2 = validationEngine.validateImportC4(c42);
    if (!result2.valid && result2.errors.some((e) => e.code === 'C4_MISSING_START')) {
      passed++;
      tests.push({ name: 'Missing @startuml detection', result: 'PASS' });
    } else {
      failed++;
      tests.push({ name: 'Missing @startuml detection', result: 'FAIL' });
    }

    return { passed, failed, tests };
  },
};

/**
 * Generate test summary
 */
export function generateValidationTestSummary(results: { [key: string]: any }): string {
  let output = '# Validation Engine Test Results\n\n';
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [category, result] of Object.entries(results)) {
    totalPassed += result.passed;
    totalFailed += result.failed;

    output += `## ${category.toUpperCase()}\n`;
    output += `**Passed**: ${result.passed} | **Failed**: ${result.failed}\n\n`;

    for (const test of result.tests || []) {
      const icon = test.result === 'PASS' ? '✅' : '❌';
      output += `${icon} ${test.name}\n`;
      if (test.errors) {
        for (const error of test.errors) {
          output += `  - ${error.message}\n`;
        }
      }
    }

    output += '\n';
  }

  output += `---\n`;
  output += `**Total**: ${totalPassed} passed, ${totalFailed} failed\n`;
  output += `**Success Rate**: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%\n`;

  return output;
}
