/**
 * Design system constants and configuration
 */

export const COLORS = {
  // Slate - neutral colors
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  // Cyan - primary brand
  cyan: {
    50: '#ecf9ff',
    100: '#cff1ff',
    200: '#a5e8ff',
    300: '#67daff',
    400: '#1dccff',
    500: '#00b8e6',
    600: '#0095c9',
    700: '#0074a3',
    800: '#0a5a87',
    900: '#0e4a6f',
  },
  // Amber - accent/warning
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Semantic colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const BORDER_RADIUS = {
  none: '0px',
  xs: '0.25rem',
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};

export const SHADOWS = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

export const TRANSITIONS = {
  fast: '75ms',
  base: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
};

// Node type configuration with over 25 architecture components
export const NODE_TYPES_CONFIG = {
  // ===== Frontend Layer =====
  'client': {
    label: 'Client/Browser',
    icon: 'Globe',
    iconColor: '#3b82f6',
    category: 'Frontend',
    description: 'Web or desktop client application',
  },
  'web-frontend': {
    label: 'Web Frontend',
    icon: 'Smartphone',
    iconColor: '#3b82f6',
    category: 'Frontend',
    description: 'React/Vue/Angular frontend app',
  },
  'mobile-app': {
    label: 'Mobile App',
    icon: 'Phone',
    iconColor: '#3b82f6',
    category: 'Frontend',
    description: 'iOS or Android mobile application',
  },

  // ===== API Layer =====
  'api-gateway': {
    label: 'API Gateway',
    icon: 'Network',
    iconColor: '#06b6d4',
    category: 'API',
    description: 'Central entry point for all APIs',
  },
  'rest-api': {
    label: 'REST API',
    icon: 'Server',
    iconColor: '#06b6d4',
    category: 'API',
    description: 'REST API server',
  },
  'graphql-server': {
    label: 'GraphQL Server',
    icon: 'Network',
    iconColor: '#06b6d4',
    category: 'API',
    description: 'GraphQL query server',
  },
  'grpc-server': {
    label: 'gRPC Server',
    icon: 'Zap',
    iconColor: '#06b6d4',
    category: 'API',
    description: 'High-performance RPC server',
  },
  'websocket-server': {
    label: 'WebSocket Server',
    icon: 'MessageSquare',
    iconColor: '#06b6d4',
    category: 'API',
    description: 'Real-time bidirectional communication',
  },

  // ===== Compute Layer =====
  'lambda': {
    label: 'Lambda/Serverless',
    icon: 'Cpu',
    iconColor: '#f59e0b',
    category: 'Compute',
    description: 'Serverless function',
  },
  'container': {
    label: 'Container/Docker',
    icon: 'Box',
    iconColor: '#f59e0b',
    category: 'Compute',
    description: 'Containerized service',
  },
  'vm': {
    label: 'Virtual Machine',
    icon: 'Server',
    iconColor: '#f59e0b',
    category: 'Compute',
    description: 'EC2/VM instance',
  },

  // ===== Data Layer =====
  'sql-database': {
    label: 'SQL Database',
    icon: 'Database',
    iconColor: '#8b5cf6',
    category: 'Data',
    description: 'PostgreSQL/MySQL database',
  },
  'nosql-database': {
    label: 'NoSQL Database',
    icon: 'Database',
    iconColor: '#8b5cf6',
    category: 'Data',
    description: 'MongoDB/DynamoDB/Cassandra',
  },
  'graph-database': {
    label: 'Graph Database',
    icon: 'Network',
    iconColor: '#8b5cf6',
    category: 'Data',
    description: 'Neo4j or similar',
  },
  'search-engine': {
    label: 'Search Engine',
    icon: 'Eye',
    iconColor: '#8b5cf6',
    category: 'Data',
    description: 'Elasticsearch/Solr',
  },
  'data-warehouse': {
    label: 'Data Warehouse',
    icon: 'Box',
    iconColor: '#8b5cf6',
    category: 'Data',
    description: 'Snowflake/BigQuery/Redshift',
  },

  // ===== Cache & CDN =====
  'cache': {
    label: 'Cache',
    icon: 'Zap',
    iconColor: '#10b981',
    category: 'Performance',
    description: 'Redis/Memcached',
  },
  'cdn': {
    label: 'CDN',
    icon: 'Globe',
    iconColor: '#10b981',
    category: 'Performance',
    description: 'Content Delivery Network',
  },

  // ===== Messaging =====
  'message-queue': {
    label: 'Message Queue',
    icon: 'MessageSquare',
    iconColor: '#ec4899',
    category: 'Messaging',
    description: 'RabbitMQ/SQS/Kafka',
  },
  'pub-sub': {
    label: 'Pub/Sub',
    icon: 'MessageSquare',
    iconColor: '#ec4899',
    category: 'Messaging',
    description: 'Event publishing & subscription',
  },
  'event-bus': {
    label: 'Event Bus',
    icon: 'MessageSquare',
    iconColor: '#ec4899',
    category: 'Messaging',
    description: 'Central event routing',
  },

  // ===== Infrastructure =====
  'load-balancer': {
    label: 'Load Balancer',
    icon: 'Activity',
    iconColor: '#14b8a6',
    category: 'Infrastructure',
    description: 'Distribute incoming traffic',
  },
  'reverse-proxy': {
    label: 'Reverse Proxy',
    icon: 'Shield',
    iconColor: '#14b8a6',
    category: 'Infrastructure',
    description: 'Nginx/HAProxy',
  },
  'firewall': {
    label: 'Firewall',
    icon: 'Shield',
    iconColor: '#14b8a6',
    category: 'Infrastructure',
    description: 'Security firewall',
  },
  'dns': {
    label: 'DNS',
    icon: 'Network',
    iconColor: '#14b8a6',
    category: 'Infrastructure',
    description: 'Domain name resolution',
  },
  'storage': {
    label: 'Storage',
    icon: 'HardDrive',
    iconColor: '#14b8a6',
    category: 'Infrastructure',
    description: 'S3/GCS/Azure Blob',
  },

  // ===== Observability =====
  'monitoring': {
    label: 'Monitoring',
    icon: 'BarChart3',
    iconColor: '#f87171',
    category: 'Observability',
    description: 'Prometheus/DataDog/New Relic',
  },
  'logging': {
    label: 'Logging',
    icon: 'FileText',
    iconColor: '#f87171',
    category: 'Observability',
    description: 'ELK Stack/Splunk',
  },
  'tracing': {
    label: 'Tracing/APM',
    icon: 'Activity',
    iconColor: '#f87171',
    category: 'Observability',
    description: 'Jaeger/Zipkin/APM',
  },
  'alerting': {
    label: 'Alerting',
    icon: 'AlertCircle',
    iconColor: '#f87171',
    category: 'Observability',
    description: 'Alert management',
  },

  // ===== Services =====
  'service': {
    label: 'Microservice',
    icon: 'Cpu',
    iconColor: '#62e0d5',
    category: 'Services',
    description: 'Independent business service',
  },
  'worker': {
    label: 'Worker',
    icon: 'Clock',
    iconColor: '#62e0d5',
    category: 'Services',
    description: 'Background job processor',
  },

  // ===== Legacy (for backward compatibility) =====
  'api-server': {
    label: 'API Server',
    icon: 'Server',
    iconColor: '#3b82f6',
    category: 'API',
    description: 'REST/GraphQL API endpoint',
  },
  'database': {
    label: 'Database',
    icon: 'Database',
    iconColor: '#8b5cf6',
    category: 'Data',
    description: 'Data persistence layer',
  },
};

// For backward compatibility - export emoji version
export const NODE_TYPES = Object.entries(NODE_TYPES_CONFIG).reduce(
  (acc, [key, value]) => {
    acc[key as any] = {
      label: value.label,
      icon: '🔧',
      color: value.iconColor,
      description: value.description,
    };
    return acc;
  },
  {} as Record<string, any>
);

export const EDGE_TYPES = {
  http: { label: 'HTTP/REST', color: '#3b82f6' },
  grpc: { label: 'gRPC', color: '#06b6d4' },
  'message-queue': { label: 'Message Queue', color: '#f59e0b' },
  database: { label: 'Database Query', color: '#8b5cf6' },
  event: { label: 'Event Stream', color: '#ef4444' },
};
