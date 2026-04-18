/**
 * Test Data Generator
 * Generates large-scale test data (1000+ nodes) for performance stress testing
 */

import { NodeData, Edge, Project, NodeType } from '@/types/architecture';

// Node types available
const NODE_TYPES: NodeType[] = [
  'web-frontend',
  'mobile-app',
  'api-gateway',
  'rest-api',
  'graphql-server',
  'lambda',
  'container',
  'sql-database',
  'nosql-database',
  'cache',
  'cdn',
  'message-queue',
  'pub-sub',
  'event-bus',
  'load-balancer',
  'monitoring',
  'service',
  'worker',
];

// Technology stacks
const TECHNOLOGIES = [
  'React', 'Vue', 'Angular', 'Next.js', 'Nuxt',
  'Node.js', 'Python', 'Java', 'Go', 'Rust', 'C#',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'RabbitMQ', 'Kafka', 'AWS Lambda', 'Docker', 'Kubernetes',
];

// Connection types
const CONNECTION_TYPES: Array<'http' | 'grpc' | 'message-queue' | 'database' | 'event'> = [
  'http', 'grpc', 'message-queue', 'database', 'event'
];

/**
 * Generate random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random item from array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a single test node
 */
function generateNode(id: number, gridSize: number = 50): NodeData {
  const row = Math.floor(id / gridSize);
  const col = id % gridSize;
  
  return {
    id: `test-node-${id}`,
    type: randomItem(NODE_TYPES),
    position: {
      x: col * 200 + randomBetween(-50, 50),
      y: row * 150 + randomBetween(-30, 30),
    },
    metadata: {
      name: `Service ${id}`,
      description: `Test service #${id} for performance testing`,
      technology: randomItem(TECHNOLOGIES),
      config: {
        instances: randomBetween(1, 10),
        memory: `${randomBetween(256, 4096)}MB`,
        cpu: `${randomBetween(1, 8)} cores`,
        replicas: randomBetween(1, 5),
      },
    },
  };
}

/**
 * Generate edges between nodes with realistic connectivity patterns
 */
function generateEdges(nodeCount: number): Edge[] {
  const edges: Edge[] = [];
  let edgeId = 0;

  for (let i = 0; i < nodeCount; i++) {
    // Each node connects to 2-5 other nodes (realistic DAG pattern)
    const connectionCount = randomBetween(2, 5);
    
    for (let j = 0; j < connectionCount; j++) {
      const targetNode = randomBetween(0, nodeCount - 1);
      
      // Avoid self-loops and prefer downstream connections
      if (targetNode !== i && targetNode > i) {
        edges.push({
          id: `test-edge-${edgeId}`,
          source: `test-node-${i}`,
          target: `test-node-${targetNode}`,
          label: randomItem(['REST', 'gRPC', 'Queue', 'Event', 'DB']),
          type: randomItem(CONNECTION_TYPES),
        });
        edgeId++;
      }
    }
  }

  return edges;
}

/**
 * Generate large test dataset with 1000+ nodes
 */
export function generateLargeTestData(nodeCount: number = 1000): Project {
  const nodes: NodeData[] = [];
  
  // Generate all nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(generateNode(i));
  }

  // Generate edges
  const edges = generateEdges(nodeCount);

  return {
    id: 'test-project-large',
    name: `Large Test Project (${nodeCount} nodes)`,
    description: `Auto-generated test project with ${nodeCount} nodes and ${edges.length} edges for performance testing`,
    nodes,
    edges,
  };
}

/**
 * Generate medium test dataset (500 nodes)
 */
export function generateMediumTestData(): Project {
  return generateLargeTestData(500);
}

/**
 * Generate small test dataset (100 nodes) - quick validation
 */
export function generateSmallTestData(): Project {
  return generateLargeTestData(100);
}

/**
 * Generate xlarge test dataset (2000 nodes) - extreme stress test
 */
export function generateXLargeTestData(): Project {
  return generateLargeTestData(2000);
}

/**
 * Generate realistic e-commerce architecture (150 nodes)
 */
export function generateECommerceArchitecture(): Project {
  const nodes: NodeData[] = [
    // Frontend Layer (20 nodes)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `ecom-frontend-${i}`,
      type: 'web-frontend' as NodeType,
      position: { x: i * 150, y: 0 },
      metadata: {
        name: `Frontend Instance ${i + 1}`,
        description: 'E-commerce web interface',
        technology: 'Next.js',
      },
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `ecom-mobile-${i}`,
      type: 'mobile-app' as NodeType,
      position: { x: i * 150, y: 100 },
      metadata: {
        name: `Mobile App ${i + 1}`,
        description: 'Native mobile application',
        technology: 'React Native',
      },
    })),

    // API Layer (20 nodes)
    {
      id: 'ecom-api-gateway',
      type: 'api-gateway' as NodeType,
      position: { x: 400, y: 0 },
      metadata: {
        name: 'API Gateway',
        description: 'Central API entry point',
        technology: 'Kong',
      },
    },
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `ecom-service-${i}`,
      type: 'rest-api' as NodeType,
      position: { x: 300 + i * 120, y: 200 },
      metadata: {
        name: `Service ${i + 1}`,
        description: 'REST API service',
        technology: 'Node.js',
      },
    })),

    // Microservices (50 nodes)
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `ecom-microservice-${i}`,
      type: 'container' as NodeType,
      position: { x: randomBetween(0, 2000), y: randomBetween(400, 800) },
      metadata: {
        name: `Microservice ${i + 1}`,
        description: `Business service ${i + 1}`,
        technology: randomItem(['Node.js', 'Python', 'Java', 'Go']),
      },
    })),

    // Data Layer (25 nodes)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `ecom-sql-db-${i}`,
      type: 'sql-database' as NodeType,
      position: { x: 100 + i * 80, y: 1200 },
      metadata: {
        name: `PostgreSQL ${i + 1}`,
        description: 'Relational database',
        technology: 'PostgreSQL',
      },
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `ecom-nosql-db-${i}`,
      type: 'nosql-database' as NodeType,
      position: { x: 1500 + i * 80, y: 1200 },
      metadata: {
        name: `MongoDB ${i + 1}`,
        description: 'Document database',
        technology: 'MongoDB',
      },
    })),

    // Cache Layer (15 nodes)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `ecom-cache-${i}`,
      type: 'cache' as NodeType,
      position: { x: i * 100, y: 1400 },
      metadata: {
        name: `Redis ${i + 1}`,
        description: 'Distributed cache',
        technology: 'Redis',
      },
    })),

    // Messaging (10 nodes)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `ecom-queue-${i}`,
      type: 'message-queue' as NodeType,
      position: { x: 1500 + i * 100, y: 1400 },
      metadata: {
        name: `RabbitMQ ${i + 1}`,
        description: 'Message queue',
        technology: 'RabbitMQ',
      },
    })),

    // Infrastructure (10 nodes)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `ecom-lb-${i}`,
      type: 'load-balancer' as NodeType,
      position: { x: i * 150, y: 1600 },
      metadata: {
        name: `Load Balancer ${i + 1}`,
        description: 'Traffic distribution',
        technology: 'NGINX',
      },
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `ecom-monitor-${i}`,
      type: 'monitoring' as NodeType,
      position: { x: 800 + i * 150, y: 1600 },
      metadata: {
        name: `Monitor ${i + 1}`,
        description: 'System monitoring',
        technology: 'Prometheus',
      },
    })),
  ];

  // Generate edges for e-commerce architecture
  const edges: Edge[] = [];
  let edgeId = 0;

  // Frontend to API Gateway
  for (let i = 0; i < 5; i++) {
    edges.push({
      id: `ecom-edge-${edgeId++}`,
      source: `ecom-frontend-${i}`,
      target: 'ecom-api-gateway',
      label: 'REST',
      type: 'http',
    });
  }

  // Mobile to API Gateway
  for (let i = 0; i < 4; i++) {
    edges.push({
      id: `ecom-edge-${edgeId++}`,
      source: `ecom-mobile-${i}`,
      target: 'ecom-api-gateway',
      label: 'REST',
      type: 'http',
    });
  }

  // API Gateway to Services
  for (let i = 0; i < 5; i++) {
    edges.push({
      id: `ecom-edge-${edgeId++}`,
      source: 'ecom-api-gateway',
      target: `ecom-service-${i}`,
      label: 'REST',
      type: 'http',
    });
  }

  // Services to Microservices (each service connects to multiple microservices)
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 10; j++) {
      edges.push({
        id: `ecom-edge-${edgeId++}`,
        source: `ecom-service-${i}`,
        target: `ecom-microservice-${i * 10 + j}`,
        label: 'RPC',
        type: 'grpc',
      });
    }
  }

  // Microservices to Databases
  for (let i = 0; i < 50; i++) {
    const dbIndex = Math.floor(i / 4);
    edges.push({
      id: `ecom-edge-${edgeId++}`,
      source: `ecom-microservice-${i}`,
      target: `ecom-sql-db-${dbIndex % 15}`,
      label: 'SQL',
      type: 'database',
    });
  }

  // Microservices to Cache
  for (let i = 0; i < 50; i++) {
    const cacheIndex = i % 15;
    edges.push({
      id: `ecom-edge-${edgeId++}`,
      source: `ecom-microservice-${i}`,
      target: `ecom-cache-${cacheIndex}`,
      label: 'Cache',
      type: 'http',
    });
  }

  // Microservices to Message Queues
  for (let i = 0; i < 50; i++) {
    const queueIndex = i % 10;
    edges.push({
      id: `ecom-edge-${edgeId++}`,
      source: `ecom-microservice-${i}`,
      target: `ecom-queue-${queueIndex}`,
      label: 'Event',
      type: 'event',
    });
  }

  return {
    id: 'ecom-architecture',
    name: 'E-Commerce Architecture Cluster',
    description: 'Realistic e-commerce system with 150+ nodes implementing common patterns',
    nodes,
    edges,
  };
}

/**
 * Generate realistic microservices architecture (200 nodes)
 */
export function generateMicroservicesArchitecture(): Project {
  const nodes: NodeData[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;
  let edgeId = 0;

  // Frontend layer
  const frontendCount = 8;
  for (let i = 0; i < frontendCount; i++) {
    nodes.push({
      id: `ms-frontend-${i}`,
      type: 'web-frontend',
      position: { x: i * 200, y: 0 },
      metadata: {
        name: `Web Frontend ${i + 1}`,
        description: 'User interface',
        technology: 'Next.js',
      },
    });
  }

  // API layer
  nodes.push({
    id: 'ms-api-gateway',
    type: 'api-gateway',
    position: { x: 800, y: 0 },
    metadata: {
      name: 'API Gateway',
      description: 'Main API entry',
      technology: 'Kong',
    },
  });

  // Connect frontends to API gateway
  for (let i = 0; i < frontendCount; i++) {
    edges.push({
      id: `ms-edge-${edgeId++}`,
      source: `ms-frontend-${i}`,
      target: 'ms-api-gateway',
      label: 'REST',
      type: 'http',
    });
  }

  // Microservices (organized by domain)
  const domains = ['user', 'product', 'order', 'payment', 'inventory', 'notification', 'analytics', 'auth'];
  const servicesPerDomain = 12;

  domains.forEach((domain, domainIdx) => {
    for (let i = 0; i < servicesPerDomain; i++) {
      const nodeIdStr = `ms-${domain}-${i}`;
      nodes.push({
        id: nodeIdStr,
        type: 'container',
        position: {
          x: domainIdx * 300 + randomBetween(-50, 50),
          y: 250 + randomBetween(-50, 50),
        },
        metadata: {
          name: `${domain.toUpperCase()} Service ${i + 1}`,
          description: `${domain} domain microservice`,
          technology: randomItem(['Node.js', 'Python', 'Java']),
        },
      });

      // Connect to API Gateway
      edges.push({
        id: `ms-edge-${edgeId++}`,
        source: 'ms-api-gateway',
        target: nodeIdStr,
        label: 'RPC',
        type: 'grpc',
      });

      // Inter-service communication (some services call others)
      if (Math.random() > 0.7) {
        const targetDomain = domains[Math.floor(Math.random() * domains.length)];
        const targetService = Math.floor(Math.random() * servicesPerDomain);
        edges.push({
          id: `ms-edge-${edgeId++}`,
          source: nodeIdStr,
          target: `ms-${targetDomain}-${targetService}`,
          label: 'Event',
          type: 'event',
        });
      }
    }
  });

  // Message queues
  const queueCount = 8;
  for (let i = 0; i < queueCount; i++) {
    nodes.push({
      id: `ms-queue-${i}`,
      type: 'message-queue',
      position: { x: i * 300, y: 700 },
      metadata: {
        name: `Message Queue ${i + 1}`,
        description: 'Event streaming',
        technology: 'Kafka',
      },
    });
  }

  // Databases
  const dbCount = 10;
  for (let i = 0; i < dbCount; i++) {
    nodes.push({
      id: `ms-db-${i}`,
      type: 'sql-database',
      position: { x: i * 250, y: 1000 },
      metadata: {
        name: `Database ${i + 1}`,
        description: 'Main database',
        technology: 'PostgreSQL',
      },
    });
  }

  // Connect microservices to queues and databases
  for (const domain of domains) {
    for (let i = 0; i < servicesPerDomain; i++) {
      const queueIdx = Math.floor(Math.random() * queueCount);
      const dbIdx = Math.floor(Math.random() * dbCount);

      edges.push({
        id: `ms-edge-${edgeId++}`,
        source: `ms-${domain}-${i}`,
        target: `ms-queue-${queueIdx}`,
        label: 'Publish',
        type: 'event',
      });

      edges.push({
        id: `ms-edge-${edgeId++}`,
        source: `ms-${domain}-${i}`,
        target: `ms-db-${dbIdx}`,
        label: 'Query',
        type: 'database',
      });
    }
  }

  return {
    id: 'ms-architecture',
    name: 'Distributed Microservices Architecture',
    description: `Realistic microservices with ${nodes.length} nodes and ${edges.length} edges`,
    nodes,
    edges,
  };
}

// Default export: medium-sized test data
export const testDataDefault = generateMediumTestData();
