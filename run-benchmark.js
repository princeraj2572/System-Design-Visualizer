#!/usr/bin/env node

/**
 * Benchmark Runner - Execute performance benchmarks and generate results
 */

// Import benchmark functions
const {
  runBenchmarkSuite,
  generateBenchmarkReport,
  comparePerformance,
  generateTestArchitecture,
  calculateCullingEffectiveness,
  simulateRenderTime
} = require('./src/lib/performance-benchmark.ts');

console.log('🚀 Starting Performance Benchmark Suite...\n');

try {
  // Run comprehensive benchmark
  console.log('📊 Running comprehensive benchmark suite...');
  const suite = runBenchmarkSuite();
  
  console.log(`✅ Benchmark complete (${suite.totalTime.toFixed(2)}ms)\n`);
  
  // Generate report
  console.log('📄 Generating performance report...');
  const report = generateBenchmarkReport(suite);
  
  // Performance comparison
  console.log('⚖️  Comparing performance with/without culling...');
  const comparison = comparePerformance();
  
  console.log('\n' + '='.repeat(60));
  console.log('BENCHMARK RESULTS');
  console.log('='.repeat(60) + '\n');
  
  console.log(report);
  
  console.log('\n' + '='.repeat(60));
  console.log('PERFORMANCE COMPARISON (1000-node architecture)');
  console.log('='.repeat(60) + '\n');
  
  console.log(`Without Culling:`);
  console.log(`  - Render Time: ${comparison.withoutCulling.renderTime.toFixed(2)}ms`);
  console.log(`  - FPS: ${comparison.withoutCulling.fps}`);
  console.log(`  - Memory: ${comparison.withoutCulling.memoryUsed.toFixed(2)}MB\n`);
  
  console.log(`With Culling:`);
  console.log(`  - Render Time: ${comparison.withCulling.renderTime.toFixed(2)}ms`);
  console.log(`  - FPS: ${comparison.withCulling.fps}`);
  console.log(`  - Memory: ${comparison.withCulling.memoryUsed.toFixed(2)}MB`);
  console.log(`  - Node Culling: ${comparison.withCulling.culledNodePercentage}%`);
  console.log(`  - Edge Culling: ${comparison.withCulling.culledEdgePercentage}%\n`);
  
  console.log(`🎯 Performance Improvement:`);
  console.log(`  - Render Time: ${comparison.improvement.renderTime.toFixed(2)}ms faster (${((comparison.improvement.renderTime / comparison.withoutCulling.renderTime) * 100).toFixed(0)}% improvement)`);
  console.log(`  - FPS: +${comparison.improvement.fps} FPS`);
  
  console.log('\n✅ Benchmark complete!\n');
  
} catch (error) {
  console.error('❌ Benchmark failed:', error.message);
  process.exit(1);
}
