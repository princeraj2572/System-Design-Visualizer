/**
 * Component Library - Pre-built component definitions for drag-and-drop
 * Organized by category: compute, storage, messaging, network, client, infrastructure
 */

import { ComponentDefinition, NodeCategory, NodeColorKey } from '@/types/architecture';

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // COMPUTE (7 components)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'api-gateway',
    label: 'API Gateway',
    sublabel: 'Entry point',
    category: 'compute',
    shape: 'rectangle',
    icon: '🌐',
    defaultColor: 'blue',
    defaultData: {
      description: 'Routes incoming requests, handles auth, rate limiting, SSL termination.',
      tags: ['entry-point', 'routing'],
    },
    suggestedTargets: ['load-balancer', 'microservice'],
    suggestedSources: ['browser', 'mobile-app'],
  },
  {
    id: 'load-balancer',
    label: 'Load Balancer',
    sublabel: 'Distribute traffic',
    category: 'compute',
    shape: 'diamond',
    icon: '⚖️',
    defaultColor: 'blue',
    defaultData: {
      description: 'Distributes requests across instances using round-robin or least-conn.',
      tags: ['ha', 'scaling'],
    },
    suggestedTargets: ['microservice', 'web-server'],
    suggestedSources: ['api-gateway', 'cdn'],
  },
  {
    id: 'microservice',
    label: 'Microservice',
    sublabel: 'Backend logic',
    category: 'compute',
    shape: 'rectangle',
    icon: '⚙️',
    defaultColor: 'purple',
    defaultData: {
      description: 'Encapsulates a bounded domain. Communicates via REST, gRPC, or message bus.',
      tags: ['stateless'],
    },
    suggestedTargets: ['sql-database', 'cache-redis', 'message-queue'],
    suggestedSources: ['api-gateway', 'load-balancer', 'message-queue'],
  },
  {
    id: 'serverless-function',
    label: 'Serverless Fn',
    sublabel: 'Event-triggered',
    category: 'compute',
    shape: 'rectangle',
    icon: '⚡',
    defaultColor: 'amber',
    defaultData: {
      description: 'Stateless function invoked by events. Cold-start latency applies.',
      tags: ['event-driven', 'stateless'],
    },
    suggestedTargets: ['sql-database', 'nosql-database'],
    suggestedSources: ['message-queue', 'pub-sub'],
  },
  {
    id: 'cdn',
    label: 'CDN',
    sublabel: 'Edge delivery',
    category: 'compute',
    shape: 'cloud',
    icon: '🌍',
    defaultColor: 'teal',
    defaultData: {
      description: 'Caches static assets at PoPs close to user. Reduces origin load.',
      tags: ['caching', 'edge'],
    },
    suggestedTargets: ['load-balancer', 'api-gateway'],
    suggestedSources: ['browser', 'mobile-app'],
  },
  {
    id: 'web-server',
    label: 'Web Server',
    sublabel: 'HTTP / static',
    category: 'compute',
    shape: 'rectangle',
    icon: '🖥️',
    defaultColor: 'blue',
    defaultData: {
      description: 'Serves HTTP responses. Nginx, Apache, Caddy.',
    },
    suggestedTargets: ['sql-database', 'cache-redis'],
    suggestedSources: ['load-balancer'],
  },
  {
    id: 'service-mesh',
    label: 'Service Mesh',
    sublabel: 'Istio / Linkerd',
    category: 'compute',
    shape: 'rectangle',
    icon: '🕸️',
    defaultColor: 'purple',
    defaultData: {
      description: 'mTLS, observability, circuit breaking between services.',
    },
    suggestedTargets: ['microservice'],
    suggestedSources: ['microservice'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // STORAGE (5 components)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'sql-database',
    label: 'SQL Database',
    sublabel: 'Relational',
    category: 'storage',
    shape: 'cylinder',
    icon: '🗄️',
    defaultColor: 'green',
    defaultData: {
      description: 'ACID-compliant relational store. PostgreSQL, MySQL, SQLite.',
      tags: ['acid', 'relational'],
    },
    suggestedTargets: [],
    suggestedSources: ['microservice', 'web-server'],
  },
  {
    id: 'nosql-database',
    label: 'NoSQL DB',
    sublabel: 'Document / KV',
    category: 'storage',
    shape: 'cylinder',
    icon: '📄',
    defaultColor: 'green',
    defaultData: {
      description: 'Schema-flexible store. MongoDB, DynamoDB, Cassandra.',
      tags: ['flexible-schema'],
    },
    suggestedTargets: [],
    suggestedSources: ['microservice', 'serverless-function'],
  },
  {
    id: 'cache-redis',
    label: 'Cache',
    sublabel: 'In-memory',
    category: 'storage',
    shape: 'hexagon',
    icon: '⚡',
    defaultColor: 'amber',
    defaultData: {
      description: 'In-memory data structure store. Sub-millisecond reads. Redis / Memcached.',
      tags: ['low-latency', 'volatile'],
    },
    suggestedTargets: [],
    suggestedSources: ['microservice', 'api-gateway'],
  },
  {
    id: 'object-storage',
    label: 'Object Storage',
    sublabel: 'S3-compatible',
    category: 'storage',
    shape: 'cylinder',
    icon: '🪣',
    defaultColor: 'gray',
    defaultData: {
      description: 'Blob / file storage. S3, GCS, Azure Blob.',
      tags: ['durable', 'cheap'],
    },
    suggestedTargets: [],
    suggestedSources: ['microservice', 'serverless-function'],
  },
  {
    id: 'data-warehouse',
    label: 'Data Warehouse',
    sublabel: 'Analytics',
    category: 'storage',
    shape: 'cylinder',
    icon: '🏭',
    defaultColor: 'purple',
    defaultData: {
      description: 'Column-oriented store for analytics. Snowflake, BigQuery, Redshift.',
      tags: ['olap', 'analytics'],
    },
    suggestedTargets: [],
    suggestedSources: ['kafka-topic', 'message-queue'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MESSAGING (4 components)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'message-queue',
    label: 'Message Queue',
    sublabel: 'Async delivery',
    category: 'messaging',
    shape: 'parallelogram',
    icon: '📨',
    defaultColor: 'amber',
    defaultData: {
      description: 'Durable async message delivery. Decouples producers from consumers. RabbitMQ, SQS.',
      tags: ['async', 'decoupling'],
    },
    suggestedTargets: ['microservice', 'serverless-function'],
    suggestedSources: ['microservice', 'api-gateway'],
  },
  {
    id: 'pub-sub',
    label: 'Pub / Sub',
    sublabel: 'Fan-out events',
    category: 'messaging',
    shape: 'parallelogram',
    icon: '📢',
    defaultColor: 'amber',
    defaultData: {
      description: 'One producer, many consumers. Google Pub/Sub, SNS.',
      tags: ['fan-out', 'event-driven'],
    },
    suggestedTargets: ['microservice', 'serverless-function'],
    suggestedSources: ['microservice'],
  },
  {
    id: 'kafka-topic',
    label: 'Kafka Topic',
    sublabel: 'Event stream',
    category: 'messaging',
    shape: 'parallelogram',
    icon: '🌊',
    defaultColor: 'coral',
    defaultData: {
      description: 'Append-only ordered log. Replayed by consumers. Apache Kafka.',
      tags: ['ordered', 'replayable'],
    },
    suggestedTargets: ['microservice', 'data-warehouse'],
    suggestedSources: ['microservice'],
  },
  {
    id: 'websocket-server',
    label: 'WebSocket Server',
    sublabel: 'Real-time',
    category: 'messaging',
    shape: 'rectangle',
    icon: '🔌',
    defaultColor: 'teal',
    defaultData: {
      description: 'Persistent bidirectional connection. Chat, live feeds.',
      tags: ['real-time', 'stateful'],
    },
    suggestedTargets: ['cache-redis', 'message-queue'],
    suggestedSources: ['browser', 'mobile-app'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // NETWORK (4 components)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'reverse-proxy',
    label: 'Reverse Proxy',
    sublabel: 'Nginx / HAProxy',
    category: 'network',
    shape: 'rectangle',
    icon: '🔀',
    defaultColor: 'gray',
    defaultData: {
      description: 'Terminates SSL, forwards to upstream. Nginx, HAProxy.',
    },
    suggestedTargets: ['load-balancer', 'web-server', 'api-gateway'],
    suggestedSources: ['browser', 'cdn'],
  },
  {
    id: 'firewall',
    label: 'Firewall',
    sublabel: 'WAF / ACL',
    category: 'network',
    shape: 'rectangle',
    icon: '🔒',
    defaultColor: 'coral',
    defaultData: {
      description: 'Filters traffic by IP, port, rules. WAF blocks OWASP threats.',
    },
    suggestedTargets: ['api-gateway', 'load-balancer'],
    suggestedSources: ['browser', 'mobile-app'],
  },
  {
    id: 'dns',
    label: 'DNS',
    sublabel: 'Routing',
    category: 'network',
    shape: 'cloud',
    icon: '🌍',
    defaultColor: 'gray',
    defaultData: {
      description: 'Resolves domain names. Route53, Cloudflare DNS.',
    },
    suggestedTargets: ['cdn', 'load-balancer', 'api-gateway'],
    suggestedSources: ['browser', 'mobile-app'],
  },
  {
    id: 'api-security',
    label: 'API Security',
    sublabel: 'Authentication',
    category: 'network',
    shape: 'rectangle',
    icon: '🔐',
    defaultColor: 'coral',
    defaultData: {
      description: 'OAuth2, JWT, mTLS, API key management.',
    },
    suggestedTargets: ['api-gateway', 'microservice'],
    suggestedSources: ['api-gateway'],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CLIENT (4 components)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'browser',
    label: 'Browser',
    sublabel: 'Web client',
    category: 'client',
    shape: 'pill',
    icon: '💻',
    defaultColor: 'gray',
    defaultData: {
      description: 'Web browser. Initiates HTTPS requests. Renders React/HTML.',
    },
    suggestedTargets: ['cdn', 'api-gateway', 'reverse-proxy', 'dns'],
    suggestedSources: [],
  },
  {
    id: 'mobile-app',
    label: 'Mobile App',
    sublabel: 'iOS / Android',
    category: 'client',
    shape: 'pill',
    icon: '📱',
    defaultColor: 'gray',
    defaultData: {
      description: 'Native or cross-platform mobile app. React Native, Flutter.',
    },
    suggestedTargets: ['api-gateway', 'cdn'],
    suggestedSources: [],
  },
  {
    id: 'third-party-api',
    label: 'Third-party API',
    sublabel: 'External service',
    category: 'client',
    shape: 'cloud',
    icon: '🤝',
    defaultColor: 'gray',
    defaultData: {
      description: 'External vendor API. Stripe, Twilio, SendGrid, Auth0.',
    },
    suggestedTargets: [],
    suggestedSources: ['microservice', 'serverless-function'],
  },
  {
    id: 'iot-device',
    label: 'IoT Device',
    sublabel: 'Edge hardware',
    category: 'client',
    shape: 'pill',
    icon: '📡',
    defaultColor: 'teal',
    defaultData: {
      description: 'Embedded sensor or actuator. MQTT, HTTP.',
    },
    suggestedTargets: ['api-gateway', 'message-queue'],
    suggestedSources: [],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // INFRASTRUCTURE (3 components)
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'docker-container',
    label: 'Container',
    sublabel: 'Docker',
    category: 'infrastructure',
    shape: 'rectangle',
    icon: '🐳',
    defaultColor: 'blue',
    defaultData: {
      description: 'Docker container. Isolated runtime with CPU/memory limits.',
    },
    suggestedTargets: [],
    suggestedSources: [],
  },
  {
    id: 'k8s-pod',
    label: 'K8s Pod',
    sublabel: 'Kubernetes',
    category: 'infrastructure',
    shape: 'rectangle',
    icon: '☸️',
    defaultColor: 'blue',
    defaultData: {
      description: 'Kubernetes pod. One or more containers sharing network namespace.',
    },
    suggestedTargets: [],
    suggestedSources: [],
  },
  {
    id: 'zone-group',
    label: 'Zone / Region',
    sublabel: 'Boundary',
    category: 'infrastructure',
    shape: 'group',
    icon: '🗂️',
    defaultColor: 'gray',
    defaultData: {
      description: 'Logical grouping boundary. VPC, AZ, data center region.',
    },
    suggestedTargets: [],
    suggestedSources: [],
  },
];

/**
 * Get a component definition by ID
 */
export function getComponentDefinition(id: string): ComponentDefinition | undefined {
  return COMPONENT_LIBRARY.find(c => c.id === id);
}

/**
 * Get all components grouped by category
 */
export function getComponentsByCategory(): Record<NodeCategory, ComponentDefinition[]> {
  const grouped: Record<string, ComponentDefinition[]> = {};
  for (const comp of COMPONENT_LIBRARY) {
    if (!grouped[comp.category]) grouped[comp.category] = [];
    grouped[comp.category].push(comp);
  }
  return grouped as Record<NodeCategory, ComponentDefinition[]>;
}

/**
 * Search components by name, sublabel, category, or tags
 */
export function searchComponents(query: string): ComponentDefinition[] {
  const q = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(
    c =>
      c.label.toLowerCase().includes(q) ||
      c.sublabel.toLowerCase().includes(q) ||
      c.category.includes(q) ||
      c.defaultData.tags?.some(t => t.includes(q))
  );
}

/**
 * Get category label for UI display
 */
export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  compute: 'Compute',
  storage: 'Storage',
  messaging: 'Messaging',
  network: 'Network',
  client: 'Client',
  infrastructure: 'Infrastructure',
};

/**
 * Standard category order for sidebar
 */
export const CATEGORY_ORDER: NodeCategory[] = [
  'compute',
  'storage',
  'messaging',
  'network',
  'client',
  'infrastructure',
];
