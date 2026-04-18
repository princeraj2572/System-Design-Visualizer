# Test Data & Performance Stress Testing Guide

This guide explains how to use the test data generators to stress-test the System Visualizer with large datasets.

## Overview

The test data system provides 6 different scenarios ranging from 100 to 2,000 nodes:

| Scenario | Nodes | Edges | Complexity | Use Case |
|----------|-------|-------|-----------|----------|
| Small | 100 | ~250 | Simple | Quick validation |
| Medium | 500 | ~1,250 | Medium | Standard testing |
| Large | 1,000 | ~2,500 | Complex | Stress testing |
| X-Large | 2,000 | ~5,000 | Extreme | Extreme stress test |
| E-Commerce | 150 | ~400 | Medium | Realistic pattern |
| Microservices | 200 | ~600 | Complex | Realistic pattern |

## Quick Start

### Option 1: Use in the Browser Console

1. Open the application at `http://localhost:3000`
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run:

```javascript
// Import test scenarios
import { loadTestScenario } from '@/lib/test-scenarios';

// Load a scenario
const project = loadTestScenario('medium');

// Or try other scenarios:
// 'small' - 100 nodes
// 'large' - 1,000 nodes  
// 'xlarge' - 2,000 nodes
// 'ecommerce' - realistic e-commerce
// 'microservices' - realistic microservices

// Export as JSON
console.log(JSON.stringify(project, null, 2));
```

### Option 2: Import into Your Project

```typescript
import { 
  loadTestScenario, 
  generatePerformanceStats,
  displayPerformanceStats,
  TEST_SCENARIOS 
} from '@/lib/test-scenarios';

// Load a scenario
const project = loadTestScenario('large');

// Generate statistics
const stats = generatePerformanceStats(project);

// Display in console
displayPerformanceStats(stats);
```

### Option 3: Use in a React Component

```typescript
import { useEffect, useState } from 'react';
import { loadTestScenario } from '@/lib/test-scenarios';
import { Project } from '@/types/architecture';

export function TestDataLoader() {
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Load medium test data
    const data = loadTestScenario('medium');
    if (data) {
      setProject(data);
      // Then generate stats if needed
    }
  }, []);

  return (
    <div>
      {project && (
        <div>
          <h2>{project.name}</h2>
          <p>Nodes: {project.nodes.length}</p>
          <p>Edges: {project.edges.length}</p>
        </div>
      )}
    </div>
  );
}
```

## Available Generators

All generators are in `src/lib/test-data.ts`:

```typescript
// Generate specific size
generateSmallTestData()        // 100 nodes
generateMediumTestData()       // 500 nodes
generateLargeTestData(1000)    // 1000 nodes
generateXLargeTestData()       // 2000 nodes

// Generate realistic patterns
generateECommerceArchitecture()       // 150 nodes - e-commerce
generateMicroservicesArchitecture()   // 200 nodes - microservices
```

## Exporting Test Data

```typescript
import { 
  loadTestScenario,
  exportTestDataAsJSON,
  exportNodesToCSV,
  exportEdgesToCSV 
} from '@/lib/test-scenarios';

const project = loadTestScenario('large');

// Export as JSON
const json = exportTestDataAsJSON(project);
console.log(json);

// Export nodes as CSV
const nodesCsv = exportNodesToCSV(project);
console.log(nodesCsv);

// Export edges as CSV
const edgesCsv = exportEdgesToCSV(project);
console.log(edgesCsv);
```

## Performance Testing

### Quick Benchmark

```typescript
import { runQuickBench } from '@/lib/test-scenarios';

// Run benchmark on all scenarios
runQuickBench();
```

Output:
```
🚀 Running Test Data Benchmark...

📊 Small (100 nodes)
   Generated in 2.34ms
   Nodes: 100, Edges: 250
   Avg Connections: 5
   Est. Render Time: < 100ms

📊 Medium (500 nodes)
   Generated in 8.92ms
   Nodes: 500, Edges: 1250
   Avg Connections: 5
   Est. Render Time: 100-300ms

... more scenarios ...

✅ Benchmark Complete!
```

### Generate Performance Stats

```typescript
import { 
  loadTestScenario,
  generatePerformanceStats,
  displayPerformanceStats 
} from '@/lib/test-scenarios';

const project = loadTestScenario('large');
const stats = generatePerformanceStats(project);
displayPerformanceStats(stats);
```

Output:
```
=== Performance Statistics ===
Total Nodes: 1000
Total Edges: 2500
Avg Connections/Node: 5
Estimated Render Time: 300-800ms

Node Type Distribution:
  container: 200 (20%)
  rest-api: 150 (15%)
  sql-database: 100 (10%)
  ... more types ...

Edge Type Distribution:
  http: 1563 (62.5%)
  grpc: 625 (25%)
  event: 312 (12.5%)

Technologies Used (20): React, Next.js, Node.js, Python, Java, Go, ...
```

## Browser Testing Workflow

1. **Start dev server**: `npm run dev`
2. **Open browser**: `http://localhost:3000`
3. **Open DevTools**: F12 → Console
4. **Load test data**:
   ```javascript
   import { loadTestScenario } from '@/lib/test-scenarios';
   const project = loadTestScenario('medium');
   ```
5. **Observe canvas rendering** - Watch performance
6. **Test interactions** - Pan, zoom, select nodes
7. **Monitor performance** - Check DevTools Performance tab

## Performance Monitoring

### In Browser DevTools

1. Open DevTools → Performance tab
2. Click Record
3. Load test data via console
4. Interact with canvas (pan, zoom, select)
5. Click Stop
6. Analyze the flame graph

### Key Metrics to Monitor

- **FCP (First Contentful Paint)**: Time to render
- **LCP (Largest Contentful Paint)**: Time to render largest element
- **FID (First Input Delay)**: Responsiveness to interactions
- **CLS (Cumulative Layout Shift)**: Visual stability
- **Frame Rate**: Should stay near 60 FPS

## Realistic Architecture Patterns

### E-Commerce Pattern (150 nodes)

Includes:
- 5 Web frontends + 4 mobile apps
- API Gateway + 5 REST services  
- 50 Microservices
- 15 SQL databases + 10 NoSQL databases
- 15 Redis cache instances
- 10 RabbitMQ queues
- 10 Infrastructure nodes (load balancers, monitors)

Demonstrates:
- Multi-layer architecture
- Database per service pattern
- Distributed caching
- Event-driven communication

### Microservices Pattern (200 nodes)

Includes:
- 8 Frontend instances
- 1 API Gateway
- 96 Microservices across 8 domains (user, product, order, payment, inventory, notification, analytics, auth)
- 8 Message queues (Kafka)
- 10 PostgreSQL databases
- Inter-service communication

Demonstrates:
- Domain-driven design
- Service discovery patterns
- Event streaming
- Database per service
- Real-world complexity

## Tips for Testing

### Load Small First
```javascript
loadTestScenario('small')  // Start here
// Then progress to medium, large, xlarge
```

### Monitor Memory Usage
- Small: ~2-3 MB
- Medium: ~8-12 MB
- Large: ~18-25 MB
- X-Large: ~40-60 MB

### Test Interactions
- Panning: Should be smooth (60 FPS)
- Zooming: Should be responsive
- Node selection: Should update instantly
- Searching: Should complete in < 200ms
- Filtering: Should complete in < 200ms

### Viewport Culling Performance
With viewport culling enabled (Phase 9 optimization):
- Small dataset: 6-8x faster
- Medium dataset: 4-6x faster  
- Large dataset: 3-4x faster
- X-Large dataset: 2-3x faster

## Customizing Test Data

### Generate Custom Size
```typescript
import { generateLargeTestData } from '@/lib/test-data';

// Generate 500 nodes
const data = generateLargeTestData(500);

// Generate 10,000 nodes (extreme test)
const extremeData = generateLargeTestData(10000);
```

### Generate with Custom Pattern
Create a new function in `src/lib/test-data.ts`:

```typescript
export function generateCustomArchitecture(): Project {
  const nodes: NodeData[] = [
    // Your custom nodes
  ];
  
  const edges: Edge[] = [
    // Your custom edges
  ];
  
  return {
    id: 'custom-arch',
    name: 'My Custom Architecture',
    description: 'Custom test architecture',
    nodes,
    edges,
  };
}
```

Then add it to `TEST_SCENARIOS` in `test-scenarios.ts`.

## Troubleshooting

### "Module not found" error
- Ensure `test-data.ts` and `test-scenarios.ts` exist
- Check import paths match your project structure
- Restart dev server

### Slow rendering on large datasets
- Enable DevTools Performance monitoring to identify bottlenecks
- Check if viewport culling is enabled
- Try smaller scenario first
- Monitor GPU usage

### Browser crashes with X-Large dataset
- This is expected behavior for 2000+ nodes
- Use Medium or Large for stability
- Consider implementing virtual scrolling
- Monitor available RAM

## Next Steps

1. **Automated Benchmarking**: Create CI/CD pipeline to track performance metrics
2. **Comparative Analysis**: Compare performance across different datasets
3. **Regression Testing**: Track performance over time as code changes
4. **Load Testing**: Simulate real-world load with concurrent operations
5. **Dataset Variations**: Create more realistic patterns based on actual use cases

## References

- [Phase 9: Performance Optimization](../TESTING_AND_PERFORMANCE.md)
- [Performance Monitoring](./performance-monitor.ts)
- [Layout Engine](./layout-engine.ts)
- [React Flow Documentation](https://reactflow.dev/)
