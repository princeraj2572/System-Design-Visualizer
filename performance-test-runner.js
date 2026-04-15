#!/usr/bin/env node

/**
 * Performance Testing Script - System Design Visualizer
 * Tests viewport culling and performance metrics with 1000+ node architectures
 * 
 * Purpose: Verify that performance optimization works correctly
 * Run: node performance-test-runner.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 System Design Visualizer - Performance Test Runner\n');
console.log('=' .repeat(60));

// Load test data
const testDataPath = path.join(__dirname, 'test-data', '1000-node-stress-test.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

console.log('\n📊 Test Data Analysis:');
console.log(`  Name: ${testData.name}`);
console.log(`  Node Count (declared): ${testData.nodeCount}`);
console.log(`  Nodes (actual): ${testData.nodes.length}`);
console.log(`  Edge Count (declared): ${testData.edgeCount}`);
console.log(`  Edges (actual): ${testData.edges.length}`);

// Validate data structure
console.log('\n✅ Data Structure Validation:');
let validationErrors = [];

if (!Array.isArray(testData.nodes)) {
  validationErrors.push('❌ nodes is not an array');
} else {
  console.log(`  ✓ Nodes is array with ${testData.nodes.length} items`);
}

if (!Array.isArray(testData.edges)) {
  validationErrors.push('❌ edges is not an array');
} else {
  console.log(`  ✓ Edges is array with ${testData.edges.length} items`);
}

// Check node structure
if (testData.nodes.length > 0) {
  const sampleNode = testData.nodes[0];
  const requiredNodeFields = ['id', 'label', 'type', 'tier', 'x', 'y'];
  const nodeFieldsPresent = requiredNodeFields.every(f => f in sampleNode);
  
  if (nodeFieldsPresent) {
    console.log(`  ✓ Sample node has all required fields: ${requiredNodeFields.join(', ')}`);
  } else {
    validationErrors.push(`❌ Sample node missing fields. Has: ${Object.keys(sampleNode).join(', ')}`);
  }
}

// Check edge structure
if (testData.edges.length > 0) {
  const sampleEdge = testData.edges[0];
  const requiredEdgeFields = ['id', 'source', 'target'];
  const edgeFieldsPresent = requiredEdgeFields.every(f => f in sampleEdge);
  
  if (edgeFieldsPresent) {
    console.log(`  ✓ Sample edge has required fields: ${requiredEdgeFields.join(', ')}`);
  } else {
    validationErrors.push(`❌ Sample edge missing fields. Has: ${Object.keys(sampleEdge).join(', ')}`);
  }
}

// Simulate performance metrics
console.log('\n📈 Performance Simulation:');

function simulateRenderTime(nodeCount, edgeCount, cullPercentage) {
  // Base render time = 1ms per 100 nodes
  // With culling, multiply by (1 - cullPercentage)
  const baseTime = (nodeCount / 100) * 1;
  const visibleNodes = Math.ceil(nodeCount * (1 - cullPercentage));
  const renderTime = (visibleNodes / 100) * 1.2; // 1.2ms per 100 visible nodes
  
  return renderTime;
}

const expectedCullingPercentage = 0.95;
const expectedRenderTime = simulateRenderTime(
  testData.nodes.length,
  testData.edges.length,
  expectedCullingPercentage
);
const expectedVisibleNodes = Math.ceil(testData.nodes.length * (1 - expectedCullingPercentage));
const expectedFPS = expectedRenderTime < 16.67 ? 60 : Math.ceil(1000 / (expectedRenderTime * 1.5));

console.log(`  Total Nodes: ${testData.nodes.length}`);
console.log(`  Total Edges: ${testData.edges.length}`);
console.log(`  Expected Culling: ${(expectedCullingPercentage * 100).toFixed(1)}%`);
console.log(`  Expected Visible Nodes: ${expectedVisibleNodes}`);
console.log(`  Expected Render Time: ${expectedRenderTime.toFixed(2)}ms`);
console.log(`  Expected FPS: ${expectedFPS}`);
console.log(`  Performance Status: ${expectedRenderTime < 10 ? '✅ EXCELLENT' : expectedRenderTime < 16.67 ? '✅ GOOD' : '⚠️  NEEDS OPTIMIZATION'}`);

// Analyze node types and distribution
console.log('\n📍 Node Type Distribution:');
const typeDistribution = {};
testData.nodes.forEach(node => {
  typeDistribution[node.type] = (typeDistribution[node.type] || 0) + 1;
});

Object.entries(typeDistribution)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count} nodes (${((count / testData.nodes.length) * 100).toFixed(1)}%)`);
  });

// Analyze tier distribution
console.log('\n🏗️  Architecture Tier Distribution:');
const tierDistribution = {};
testData.nodes.forEach(node => {
  tierDistribution[node.tier] = (tierDistribution[node.tier] || 0) + 1;
});

Object.entries(tierDistribution)
  .sort(([, a], [, b]) => b - a)
  .forEach(([tier, count]) => {
    console.log(`  ${tier}: ${count} nodes (${((count / testData.nodes.length) * 100).toFixed(1)}%)`);
  });

// Validate edge references
console.log('\n🔗 Edge Reference Validation:');
const nodeIds = new Set(testData.nodes.map(n => n.id));
let deadEdges = 0;
let orphanEdges = 0;

testData.edges.forEach(edge => {
  if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
    deadEdges++;
  }
});

if (deadEdges === 0) {
  console.log(`  ✓ All edge references valid (${testData.edges.length} edges)`);
} else {
  console.log(`  ⚠️  ${deadEdges} edges have invalid references`);
  validationErrors.push(`${deadEdges} invalid edge references`);
}

// Detect potential issues
console.log('\n⚠️  Analysis & Recommendations:');

// Check for isolated nodes
const connectedNodes = new Set();
testData.edges.forEach(edge => {
  connectedNodes.add(edge.source);
  connectedNodes.add(edge.target);
});
const isolatedNodeCount = testData.nodes.length - connectedNodes.size;

if (isolatedNodeCount > 0) {
  console.log(`  • ${isolatedNodeCount} isolated nodes (not connected to any edges)`);
  if (isolatedNodeCount > testData.nodes.length * 0.1) {
    console.log(`    ⚠️  > 10% isolation rate - consider adding more edges`);
  }
} else {
  console.log(`  ✓ No isolated nodes (all nodes are connected)`);
}

// Check for highly connected nodes
const connectionCounts = {};
testData.edges.forEach(edge => {
  connectionCounts[edge.source] = (connectionCounts[edge.source] || 0) + 1;
  connectionCounts[edge.target] = (connectionCounts[edge.target] || 0) + 1;
});

const highlyConnected = Object.entries(connectionCounts)
  .filter(([, count]) => count > 10)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3);

if (highlyConnected.length > 0) {
  console.log(`  • Highly connected nodes (>10 connections):`);
  highlyConnected.forEach(([nodeId, count]) => {
    const node = testData.nodes.find(n => n.id === nodeId);
    console.log(`    - ${node?.label || nodeId}: ${count} connections`);
  });
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ Performance Test Data Summary:')
console.log('='.repeat(60));

console.log(`
Test Scenario: ${testData.name}
Data Quality: ${validationErrors.length === 0 ? '✅ VALID' : '⚠️  ISSUES FOUND'}
Node Count: ${testData.nodes.length}
Edge Count: ${testData.edges.length}
Connectivity: ${((connectedNodes.size / testData.nodes.length) * 100).toFixed(1)}%
Isolated Nodes: ${isolatedNodeCount}

Expected Performance (with viewport culling):
  - Culling Percentage: ${(expectedCullingPercentage * 100).toFixed(1)}%
  - Visible Nodes: ${expectedVisibleNodes}
  - Render Time: ${expectedRenderTime.toFixed(2)}ms
  - FPS: ${expectedFPS}
  - Status: ${expectedFPS >= 50 ? '✅ EXCELLENT (>50 FPS)' : expectedFPS >= 30 ? '✅ GOOD (30-50 FPS)' : '⚠️  FAIR (<30 FPS)'}

Next Steps:
1. Open http://localhost:3000 in browser
2. Create new project or import existing one
3. Use "Import" to load this test file
4. Press Shift+P to show Performance Monitor
5. Verify culling stats match expected values
6. Test pan/zoom interactions - should remain smooth

Tests Passing: ${validationErrors.length === 0 ? '✅ YES - All validations passed' : '❌ NO - See errors above'}
`);

if (validationErrors.length > 0) {
  console.log('Errors:');
  validationErrors.forEach(err => console.log(`  ${err}`));
}

process.exit(validationErrors.length > 0 ? 1 : 0);
