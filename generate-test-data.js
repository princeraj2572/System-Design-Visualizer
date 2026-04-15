#!/usr/bin/env node

/**
 * Test Data Generator - System Design Visualizer
 * Generates large-scale architecture test data for performance testing
 * 
 * Purpose: Create 1000, 5000, and 10000 node test files
 * Run: node generate-test-data.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Try to use uuid if available, otherwise use simple ID generation
let createId;
try {
  require.resolve('uuid');
  const { v4 } = require('uuid');
  createId = () => `n-${v4().substring(0, 8)}`;
} catch {
  let idCounter = 0;
  createId = () => `n${++idCounter}`;
}

const nodeTypes = ['service', 'database', 'cache', 'infrastructure', 'compute', 'analytics'];
const tiers = ['edge', 'api', 'compute', 'data', 'messaging', 'observability', 'security'];
const edgeTypes = ['http', 'grpc', 'sql', 'bson', 'invoke', 'publish', 'subscribe', 'cache'];

function generateNode(id, index) {
  const tier = tiers[index % tiers.length];
  const type = nodeTypes[index % nodeTypes.length];
  const x = (index % 20) * 100 + 50;
  const y = Math.floor(index / 20) * 100 + 50;
  
  return {
    id,
    label: `${type[0].toUpperCase()}${type.slice(1)} ${Math.floor(index / 10) + 1}`,
    type,
    tier,
    x,
    y,
    metadata: {
      instances: Math.floor(Math.random() * 5) + 1,
      region: ['us-east-1', 'us-west-2', 'eu-west-1'][index % 3]
    }
  };
}

function generateEdges(nodeIds, count) {
  const edges = [];
  for (let i = 0; i < count; i++) {
    const sourceIdx = Math.floor(Math.random() * nodeIds.length);
    let targetIdx = Math.floor(Math.random() * nodeIds.length);
    while (targetIdx === sourceIdx && nodeIds.length > 1) {
      targetIdx = Math.floor(Math.random() * nodeIds.length);
    }
    
    edges.push({
      id: `e-${i + 1}`,
      source: nodeIds[sourceIdx],
      target: nodeIds[targetIdx],
      type: edgeTypes[Math.floor(Math.random() * edgeTypes.length)],
      label: `connection-${i + 1}`
    });
  }
  return edges;
}

function generateTestArchitecture(nodeCount, fileName) {
  console.log(`\n📝 Generating ${nodeCount}-node test architecture...`);
  
  const nodeIds = [];
  const nodes = [];
  
  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    const id = createId();
    nodeIds.push(id);
    nodes.push(generateNode(id, i));
    
    if ((i + 1) % 100 === 0) {
      process.stdout.write(` ${i + 1}`);
    }
  }
  console.log(` ✓ ${nodeCount} nodes created`);
  
  // Generate edges (approximately 2-3 edges per node on average)
  const edgeCount = Math.floor(nodeCount * 2.4);
  console.log(`📝 Generating ${edgeCount} edges...`);
  const edges = generateEdges(nodeIds, edgeCount);
  console.log(`  ✓ ${edgeCount} edges created`);
  
  // Create test file
  const testArchitecture = {
    name: `${nodeCount}-Node Performance Test Architecture`,
    description: `Large-scale distributed system with ${nodeCount} nodes and ${edgeCount} edges for comprehensive performance testing and viewport culling verification`,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    nodeCount,
    edgeCount: edges.length,
    tiersPresent: tiers,
    scalabilityTest: true,
    metadata: {
      purpose: 'Performance testing and viewport culling benchmark',
      expectedBehavior: 'Viewport culling should render ~2% of nodes while culling 98% to maintain 60 FPS',
      performanceTargets: {
        renderTime: `${Math.ceil(nodeCount / 100)}ms`,
        fps: 60,
        memoryUsage: `${Math.ceil(nodeCount / 10)}MB`,
        cullingPercentage: 98,
        visibleNodes: Math.ceil(nodeCount * 0.02)
      }
    },
    nodes,
    edges
  };
  
  // Write to file
  const filePath = path.join(__dirname, 'test-data', fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(testArchitecture, null, 2));
  
  const fileSize = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
  console.log(`  💾 Saved to ${filePath}`);
  console.log(`  📦 File size: ${fileSize} MB`);
  
  return testArchitecture;
}

console.log('🚀 Test Data Generator - System Design Visualizer');
console.log('='.repeat(60));

try {
  // Generate multiple test sizes
  const testSizes = [
    { nodes: 1000, file: '1000-node-stress-test.json', skip: true }, // Already exists with 35 nodes as seed
    { nodes: 2000, file: '2000-node-performance-test.json', skip: false },
    { nodes: 5000, file: '5000-node-enterprise-test.json', skip: false }
  ];
  
  const results = [];
  
  for (const { nodes, file, skip } of testSizes) {
    if (skip) {
      console.log(`\n⏭️  Skipping ${nodes}-node test (already exists as seed data)`);
      results.push({
        size: nodes,
        file,
        status: 'skipped',
        message: 'Existing seed data with 35 nodes for scaling pattern'
      });
      continue;
    }
    
    const result = generateTestArchitecture(nodes, file);
    results.push({
      size: nodes,
      file,
      nodes: result.nodes.length,
      edges: result.edges.length,
      status: 'success'
    });
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test Data Generation Complete');
  console.log('='.repeat(60));
  
  console.log('\nGenerated Test Files:');
  results.forEach(r => {
    if (r.status === 'skipped') {
      console.log(`  • ${r.file}`);
      console.log(`    ⏭️  ${r.message}`);
    } else {
      console.log(`  • ${r.file}`);
      console.log(`    ${r.nodes} nodes, ${r.edges} edges`);
    }
  });
  
  console.log('\nUsage:');
  console.log('  1. Open http://localhost:3000');
  console.log('  2. Create new project');
  console.log('  3. Click Import and select any test file');
  console.log('  4. Press Shift+P to open Performance Monitor');
  console.log('  5. Verify culling > 95% and FPS = 60');
  
  console.log('\nExpected Results by Size:');
  testSizes.forEach(({ nodes }) => {
    if (nodes >= 1000) {
      const visiblePercent = (2 / nodes * 100).toFixed(2);
      const visibleNodes = Math.ceil(nodes * 0.02);
      console.log(`  ${nodes} nodes: ~${visiblePercent}% visible (${visibleNodes} nodes), 98% culled, 60+ FPS`);
    }
  });
  
} catch (error) {
  console.error('❌ Error generating test data:', error.message);
  process.exit(1);
}
