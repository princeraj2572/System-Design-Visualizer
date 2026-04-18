/**
 * Test Scenarios
 * Provides easy access to various test data scenarios for performance testing
 */

import {
  generateSmallTestData,
  generateMediumTestData,
  generateLargeTestData,
  generateXLargeTestData,
  generateECommerceArchitecture,
  generateMicroservicesArchitecture,
} from './test-data';
import { Project } from '@/types/architecture';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  nodeCount: string;
  edgeCount?: string;
  complexity: 'simple' | 'medium' | 'complex' | 'extreme';
  generator: () => Project;
}

/**
 * All available test scenarios
 */
export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'small',
    name: 'Small (100 nodes)',
    description: 'Quick validation test with 100 nodes. Good for initial testing.',
    nodeCount: '100',
    complexity: 'simple',
    generator: () => generateSmallTestData(),
  },
  {
    id: 'medium',
    name: 'Medium (500 nodes)',
    description: 'Standard performance test with 500 nodes and ~1,250 edges.',
    nodeCount: '500',
    edgeCount: '~1,250',
    complexity: 'medium',
    generator: () => generateMediumTestData(),
  },
  {
    id: 'large',
    name: 'Large (1,000 nodes)',
    description: 'Large-scale stress test with 1,000 nodes and ~2,500 edges.',
    nodeCount: '1,000',
    edgeCount: '~2,500',
    complexity: 'complex',
    generator: () => generateLargeTestData(1000),
  },
  {
    id: 'xlarge',
    name: 'X-Large (2,000 nodes)',
    description: 'Extreme stress test with 2,000 nodes and ~5,000 edges.',
    nodeCount: '2,000',
    edgeCount: '~5,000',
    complexity: 'extreme',
    generator: () => generateXLargeTestData(),
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Pattern (150 nodes)',
    description: 'Realistic e-commerce architecture with 150 nodes following common patterns.',
    nodeCount: '150',
    edgeCount: '~400',
    complexity: 'medium',
    generator: () => generateECommerceArchitecture(),
  },
  {
    id: 'microservices',
    name: 'Microservices Pattern (200 nodes)',
    description: 'Distributed microservices architecture with 200 nodes across 8 domains.',
    nodeCount: '200',
    edgeCount: '~600',
    complexity: 'complex',
    generator: () => generateMicroservicesArchitecture(),
  },
];

/**
 * Get test scenario by ID
 */
export function getTestScenario(id: string): TestScenario | undefined {
  return TEST_SCENARIOS.find(s => s.id === id);
}

/**
 * Get all scenarios for a complexity level
 */
export function getScenariosByComplexity(complexity: 'simple' | 'medium' | 'complex' | 'extreme'): TestScenario[] {
  return TEST_SCENARIOS.filter(s => s.complexity === complexity);
}

/**
 * Load a test scenario
 */
export function loadTestScenario(id: string): Project | null {
  const scenario = getTestScenario(id);
  if (!scenario) {
    console.warn(`Test scenario '${id}' not found`);
    return null;
  }
  
  console.log(`Loading test scenario: ${scenario.name}`);
  const startTime = performance.now();
  
  const data = scenario.generator();
  
  const endTime = performance.now();
  console.log(`✓ Loaded ${data.nodes.length} nodes and ${data.edges.length} edges in ${(endTime - startTime).toFixed(2)}ms`);
  
  return data;
}

/**
 * Export test data to JSON file
 */
export function exportTestDataAsJSON(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Create CSV representation of nodes
 */
export function exportNodesToCSV(project: Project): string {
  const headers = ['ID', 'Type', 'Name', 'Technology', 'Description', 'X', 'Y'];
  const rows = project.nodes.map(node => [
    node.id,
    node.type,
    node.metadata.name,
    node.metadata.technology,
    node.metadata.description,
    node.position.x,
    node.position.y,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

/**
 * Create CSV representation of edges
 */
export function exportEdgesToCSV(project: Project): string {
  const headers = ['ID', 'Source', 'Target', 'Type', 'Label'];
  const rows = project.edges.map(edge => [
    edge.id,
    edge.source,
    edge.target,
    edge.type || 'http',
    edge.label,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

/**
 * Generate performance report for a project
 */
export interface PerformanceStats {
  totalNodes: number;
  totalEdges: number;
  averageConnectionsPerNode: number;
  nodeTypeDistribution: Record<string, number>;
  edgeTypeDistribution: Record<string, number>;
  technologiesUsed: string[];
  estimatedRenderTime: string;
}

export function generatePerformanceStats(project: Project): PerformanceStats {
  const nodeTypeDistribution: Record<string, number> = {};
  const edgeTypeDistribution: Record<string, number> = {};
  const technologiesSet = new Set<string>();

  // Analyze nodes
  for (const node of project.nodes) {
    nodeTypeDistribution[node.type] = (nodeTypeDistribution[node.type] || 0) + 1;
    technologiesSet.add(node.metadata.technology);
  }

  // Analyze edges
  for (const edge of project.edges) {
    const edgeType = edge.type || 'http';
    edgeTypeDistribution[edgeType] = (edgeTypeDistribution[edgeType] || 0) + 1;
  }

  // Estimate render time based on complexity (very rough estimate)
  const complexity = project.nodes.length + project.edges.length;
  let estimatedRenderTime = '< 100ms';
  if (complexity > 1000) estimatedRenderTime = '100-300ms';
  if (complexity > 2500) estimatedRenderTime = '300-800ms';
  if (complexity > 5000) estimatedRenderTime = '800ms-2s';

  return {
    totalNodes: project.nodes.length,
    totalEdges: project.edges.length,
    averageConnectionsPerNode: Math.round((project.edges.length * 2) / project.nodes.length * 10) / 10,
    nodeTypeDistribution,
    edgeTypeDistribution,
    technologiesUsed: Array.from(technologiesSet),
    estimatedRenderTime,
  };
}

/**
 * Format stats for console display
 */
export function displayPerformanceStats(stats: PerformanceStats): void {
  console.log('\n=== Performance Statistics ===');
  console.log(`Total Nodes: ${stats.totalNodes}`);
  console.log(`Total Edges: ${stats.totalEdges}`);
  console.log(`Avg Connections/Node: ${stats.averageConnectionsPerNode}`);
  console.log(`Estimated Render Time: ${stats.estimatedRenderTime}`);
  
  console.log('\nNode Type Distribution:');
  Object.entries(stats.nodeTypeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      const percentage = Math.round((count / stats.totalNodes) * 100);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });

  console.log('\nEdge Type Distribution:');
  Object.entries(stats.edgeTypeDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = Math.round((count / stats.totalEdges) * 100);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });

  console.log(`\nTechnologies Used (${stats.technologiesUsed.length}):`, stats.technologiesUsed.join(', '));
}

/**
 * Quick test: Generate all scenarios and report
 */
export function runQuickBench(): void {
  console.log('🚀 Running Test Data Benchmark...\n');

  TEST_SCENARIOS.forEach(scenario => {
    const startTime = performance.now();
    const project = scenario.generator();
    const endTime = performance.now();

    const stats = generatePerformanceStats(project);
    const duration = (endTime - startTime).toFixed(2);

    console.log(`\n📊 ${scenario.name}`);
    console.log(`   Generated in ${duration}ms`);
    console.log(`   Nodes: ${stats.totalNodes}, Edges: ${stats.totalEdges}`);
    console.log(`   Avg Connections: ${stats.averageConnectionsPerNode}`);
    console.log(`   Est. Render Time: ${stats.estimatedRenderTime}`);
  });

  console.log('\n✅ Benchmark Complete!\n');
}
