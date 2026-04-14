/**
 * Node Type Definitions and Metadata Schemas
 * Defines the structure and available properties for each node type
 */

import { NodeType } from './architecture';

export interface NodeTypeConfig {
  id: NodeType;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color
  category: 'frontend' | 'api' | 'compute' | 'data' | 'cache' | 'messaging' | 'storage' | 'other';
  description: string;
  propertiesSchema: Record<string, PropertyField>;
}

export interface PropertyField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface NodeTypeMetadata {
  // Base metadata (all types)
  name: string;
  description: string;
  technology: string;

  // Type-specific metadata (optional, depends on node type)
  
  // API/Service metadata
  protocol?: 'http' | 'grpc' | 'websocket' | 'custom';
  port?: number;
  version?: string;
  authentication?: 'none' | 'jwt' | 'oauth' | 'api-key' | 'mutual-tls';

  // Database metadata
  dbType?: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'dynamodb' | 'firestore';
  connectionString?: string;
  replication?: boolean;
  sharding?: boolean;

  // Compute metadata
  runtime?: string; // e.g., 'Node.js 18', 'Python 3.11'
  memory?: number; // MB
  timeout?: number; // Seconds
  scalable?: boolean;
  language?: string;

  // Cache metadata
  ttl?: number; // Seconds
  evictionPolicy?: 'lru' | 'lfu' | 'fifo' | 'random';

  // Messaging metadata
  messageFormat?: 'json' | 'protobuf' | 'avro' | 'binary';
  topics?: string[];
  partitions?: number;

  // Storage metadata
  storageType?: 's3' | 'gcs' | 'azure-blob' | 'ftp' | 'sftp';
  encryption?: boolean;
  versioning?: boolean;

  // General metadata
  config?: Record<string, unknown>;
  tags?: string[];
  tier?: 'critical' | 'high' | 'medium' | 'low';
}

// Node Type Configurations
export const NODE_TYPES_CONFIG: Record<NodeType, NodeTypeConfig> = {
  // Frontend types
  'client': {
    id: 'client',
    name: 'Client',
    icon: 'Smartphone',
    color: '#6366F1',
    category: 'frontend',
    description: 'Web or mobile client application',
    propertiesSchema: {
      platform: {
        name: 'platform',
        type: 'select',
        label: 'Platform',
        options: [
          { value: 'web', label: 'Web' },
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' },
          { value: 'desktop', label: 'Desktop' },
        ],
      },
      framework: {
        name: 'framework',
        type: 'text',
        label: 'Framework',
        placeholder: 'e.g., React, SwiftUI, Flutter',
      },
    },
  },
  'web-frontend': {
    id: 'web-frontend',
    name: 'Web Frontend',
    icon: 'Globe',
    color: '#6366F1',
    category: 'frontend',
    description: 'Web application frontend',
    propertiesSchema: {
      framework: {
        name: 'framework',
        type: 'select',
        label: 'Framework',
        options: [
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'angular', label: 'Angular' },
          { value: 'next', label: 'Next.js' },
          { value: 'svelte', label: 'Svelte' },
        ],
      },
      deployment: {
        name: 'deployment',
        type: 'text',
        label: 'Deployment Target',
        placeholder: 'e.g., Vercel, Netlify, AWS S3',
      },
    },
  },
  'mobile-app': {
    id: 'mobile-app',
    name: 'Mobile App',
    icon: 'Smartphone',
    color: '#8B5CF6',
    category: 'frontend',
    description: 'Mobile application',
    propertiesSchema: {
      platform: {
        name: 'platform',
        type: 'select',
        label: 'Platform',
        options: [
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' },
          { value: 'cross-platform', label: 'Cross-Platform' },
        ],
      },
      framework: {
        name: 'framework',
        type: 'text',
        label: 'Framework',
        placeholder: 'e.g., React Native, Flutter, Swift',
      },
    },
  },

  // API types
  'api-gateway': {
    id: 'api-gateway',
    name: 'API Gateway',
    icon: 'Network',
    color: '#F59E0B',
    category: 'api',
    description: 'API Gateway for routing and authentication',
    propertiesSchema: {
      protocol: {
        name: 'protocol',
        type: 'select',
        label: 'Protocol',
        options: [
          { value: 'http', label: 'HTTP/HTTPS' },
          { value: 'grpc', label: 'gRPC' },
          { value: 'websocket', label: 'WebSocket' },
        ],
      },
      port: {
        name: 'port',
        type: 'number',
        label: 'Port',
        placeholder: '80, 443, etc.',
      },
      authentication: {
        name: 'authentication',
        type: 'select',
        label: 'Authentication',
        options: [
          { value: 'none', label: 'None' },
          { value: 'jwt', label: 'JWT' },
          { value: 'oauth', label: 'OAuth2' },
          { value: 'api-key', label: 'API Key' },
        ],
      },
      version: {
        name: 'version',
        type: 'text',
        label: 'Version',
        placeholder: 'v1, v2.0, etc.',
      },
    },
  },
  'rest-api': {
    id: 'rest-api',
    name: 'REST API',
    icon: 'Code',
    color: '#3B82F6',
    category: 'api',
    description: 'REST API endpoint',
    propertiesSchema: {
      port: {
        name: 'port',
        type: 'number',
        label: 'Port',
        placeholder: '3000, 8000, etc.',
      },
      authentication: {
        name: 'authentication',
        type: 'select',
        label: 'Authentication',
        options: [
          { value: 'none', label: 'None' },
          { value: 'jwt', label: 'JWT' },
          { value: 'api-key', label: 'API Key' },
        ],
      },
      version: {
        name: 'version',
        type: 'text',
        label: 'API Version',
        placeholder: 'v1, v2, etc.',
      },
    },
  },
  'graphql-server': {
    id: 'graphql-server',
    name: 'GraphQL Server',
    icon: 'GitGraph',
    color: '#EC4899',
    category: 'api',
    description: 'GraphQL API server',
    propertiesSchema: {
      port: {
        name: 'port',
        type: 'number',
        label: 'Port',
      },
      playground: {
        name: 'playground',
        type: 'boolean',
        label: 'Enable GraphQL Playground',
      },
    },
  },
  'grpc-server': {
    id: 'grpc-server',
    name: 'gRPC Server',
    icon: 'Zap',
    color: '#10B981',
    category: 'api',
    description: 'gRPC service',
    propertiesSchema: {
      port: {
        name: 'port',
        type: 'number',
        label: 'Port',
      },
    },
  },
  'websocket-server': {
    id: 'websocket-server',
    name: 'WebSocket Server',
    icon: 'Radio',
    color: '#06B6D4',
    category: 'api',
    description: 'WebSocket real-time server',
    propertiesSchema: {
      port: {
        name: 'port',
        type: 'number',
        label: 'Port',
      },
    },
  },

  // Compute types
  'lambda': {
    id: 'lambda',
    name: 'Lambda Function',
    icon: 'Zap',
    color: '#FF9900',
    category: 'compute',
    description: 'Serverless function',
    propertiesSchema: {
      runtime: {
        name: 'runtime',
        type: 'select',
        label: 'Runtime',
        options: [
          { value: 'nodejs18', label: 'Node.js 18' },
          { value: 'nodejs20', label: 'Node.js 20' },
          { value: 'python311', label: 'Python 3.11' },
          { value: 'java17', label: 'Java 17' },
          { value: 'go121', label: 'Go 1.21' },
        ],
      },
      memory: {
        name: 'memory',
        type: 'number',
        label: 'Memory (MB)',
        validation: { min: 128, max: 10240 },
      },
      timeout: {
        name: 'timeout',
        type: 'number',
        label: 'Timeout (Seconds)',
        validation: { min: 1, max: 900 },
      },
    },
  },
  'container': {
    id: 'container',
    name: 'Container',
    icon: 'Box',
    color: '#0EA5E9',
    category: 'compute',
    description: 'Docker container or pod',
    propertiesSchema: {
      image: {
        name: 'image',
        type: 'text',
        label: 'Docker Image',
        placeholder: 'my-app:latest',
      },
      port: {
        name: 'port',
        type: 'number',
        label: 'Container Port',
      },
    },
  },
  'vm': {
    id: 'vm',
    name: 'Virtual Machine',
    icon: 'Server',
    color: '#6366F1',
    category: 'compute',
    description: 'Virtual machine instance',
    propertiesSchema: {
      instanceType: {
        name: 'instanceType',
        type: 'text',
        label: 'Instance Type',
        placeholder: 't3.medium, m5.large, etc.',
      },
      os: {
        name: 'os',
        type: 'select',
        label: 'Operating System',
        options: [
          { value: 'ubuntu', label: 'Ubuntu Linux' },
          { value: 'centos', label: 'CentOS' },
          { value: 'windows', label: 'Windows' },
          { value: 'amazonlinux', label: 'Amazon Linux' },
        ],
      },
    },
  },

  // Data types
  'sql-database': {
    id: 'sql-database',
    name: 'SQL Database',
    icon: 'Database',
    color: '#059669',
    category: 'data',
    description: 'SQL database',
    propertiesSchema: {
      dbType: {
        name: 'dbType',
        type: 'select',
        label: 'Database Type',
        options: [
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'mariadb', label: 'MariaDB' },
          { value: 'oracle', label: 'Oracle' },
          { value: 'mssql', label: 'SQL Server' },
        ],
      },
      version: {
        name: 'version',
        type: 'text',
        label: 'Version',
        placeholder: '14.0, 8.0, etc.',
      },
      replication: {
        name: 'replication',
        type: 'boolean',
        label: 'Enable Replication',
      },
    },
  },
  'nosql-database': {
    id: 'nosql-database',
    name: 'NoSQL Database',
    icon: 'Database',
    color: '#0891B2',
    category: 'data',
    description: 'NoSQL database',
    propertiesSchema: {
      dbType: {
        name: 'dbType',
        type: 'select',
        label: 'Database Type',
        options: [
          { value: 'mongodb', label: 'MongoDB' },
          { value: 'dynamodb', label: 'DynamoDB' },
          { value: 'firestore', label: 'Firestore' },
          { value: 'cassandra', label: 'Cassandra' },
          { value: 'couchdb', label: 'CouchDB' },
        ],
      },
      sharding: {
        name: 'sharding',
        type: 'boolean',
        label: 'Enable Sharding',
      },
    },
  },
  'graph-database': {
    id: 'graph-database',
    name: 'Graph Database',
    icon: 'GitGraph',
    color: '#7C3AED',
    category: 'data',
    description: 'Graph database',
    propertiesSchema: {
      dbType: {
        name: 'dbType',
        type: 'select',
        label: 'Database Type',
        options: [
          { value: 'neo4j', label: 'Neo4j' },
          { value: 'arangodb', label: 'ArangoDB' },
          { value: 'tigergraph', label: 'TigerGraph' },
        ],
      },
    },
  },
  'search-engine': {
    id: 'search-engine',
    name: 'Search Engine',
    icon: 'Search',
    color: '#D946EF',
    category: 'data',
    description: 'Full-text search engine',
    propertiesSchema: {
      engineType: {
        name: 'engineType',
        type: 'select',
        label: 'Search Engine',
        options: [
          { value: 'elasticsearch', label: 'Elasticsearch' },
          { value: 'opensearch', label: 'OpenSearch' },
          { value: 'solr', label: 'Apache Solr' },
          { value: 'meilisearch', label: 'Meilisearch' },
        ],
      },
      version: {
        name: 'version',
        type: 'text',
        label: 'Version',
      },
    },
  },
  'data-warehouse': {
    id: 'data-warehouse',
    name: 'Data Warehouse',
    icon: 'BarChart3',
    color: '#F59E0B',
    category: 'data',
    description: 'Data warehouse',
    propertiesSchema: {
      warehouseType: {
        name: 'warehouseType',
        type: 'select',
        label: 'Warehouse Type',
        options: [
          { value: 'bigquery', label: 'Google BigQuery' },
          { value: 'redshift', label: 'Amazon Redshift' },
          { value: 'snowflake', label: 'Snowflake' },
          { value: 'databricks', label: 'Databricks' },
        ],
      },
    },
  },

  // Cache type
  'cache': {
    id: 'cache',
    name: 'Cache',
    icon: 'Zap',
    color: '#EF4444',
    category: 'cache',
    description: 'Distributed cache',
    propertiesSchema: {
      cacheType: {
        name: 'cacheType',
        type: 'select',
        label: 'Cache Type',
        options: [
          { value: 'redis', label: 'Redis' },
          { value: 'memcached', label: 'Memcached' },
          { value: 'elasticache', label: 'ElastiCache' },
        ],
      },
      ttl: {
        name: 'ttl',
        type: 'number',
        label: 'Default TTL (Seconds)',
      },
    },
  },
  'cdn': {
    id: 'cdn',
    name: 'CDN',
    icon: 'Globe',
    color: '#06B6D4',
    category: 'cache',
    description: 'Content Delivery Network',
    propertiesSchema: {
      provider: {
        name: 'provider',
        type: 'select',
        label: 'Provider',
        options: [
          { value: 'cloudflare', label: 'Cloudflare' },
          { value: 'cloudfront', label: 'CloudFront' },
          { value: 'fastly', label: 'Fastly' },
          { value: 'akamai', label: 'Akamai' },
        ],
      },
    },
  },

  // Messaging types
  'message-queue': {
    id: 'message-queue',
    name: 'Message Queue',
    icon: 'MessageQueue',
    color: '#8B5CF6',
    category: 'messaging',
    description: 'Message queue',
    propertiesSchema: {
      queueType: {
        name: 'queueType',
        type: 'select',
        label: 'Queue Type',
        options: [
          { value: 'rabbitmq', label: 'RabbitMQ' },
          { value: 'kafka', label: 'Kafka' },
          { value: 'sqs', label: 'AWS SQS' },
          { value: 'pubsub', label: 'Google Pub/Sub' },
          { value: 'nats', label: 'NATS' },
        ],
      },
      topics: {
        name: 'topics',
        type: 'multiselect',
        label: 'Topics/Queues',
        placeholder: 'Add topics',
      },
    },
  },

  // Additional messaging types
  'pub-sub': {
    id: 'pub-sub',
    name: 'Pub/Sub',
    icon: 'Radio',
    color: '#8B5CF6',
    category: 'messaging',
    description: 'Publish/Subscribe system',
    propertiesSchema: {},
  },
  'event-bus': {
    id: 'event-bus',
    name: 'Event Bus',
    icon: 'Radio',
    color: '#A78BFA',
    category: 'messaging',
    description: 'Event bus',
    propertiesSchema: {},
  },

  // Additional infrastructure types
  'load-balancer': {
    id: 'load-balancer',
    name: 'Load Balancer',
    icon: 'Network',
    color: '#F59E0B',
    category: 'api',
    description: 'Load balancer',
    propertiesSchema: {},
  },
  'reverse-proxy': {
    id: 'reverse-proxy',
    name: 'Reverse Proxy',
    icon: 'Zap',
    color: '#F59E0B',
    category: 'api',
    description: 'Reverse proxy',
    propertiesSchema: {},
  },
  'firewall': {
    id: 'firewall',
    name: 'Firewall',
    icon: 'Shield',
    color: '#EF4444',
    category: 'other',
    description: 'Firewall',
    propertiesSchema: {},
  },
  'dns': {
    id: 'dns',
    name: 'DNS',
    icon: 'Globe',
    color: '#3B82F6',
    category: 'other',
    description: 'DNS resolver',
    propertiesSchema: {},
  },

  // Observability types
  'monitoring': {
    id: 'monitoring',
    name: 'Monitoring',
    icon: 'Activity',
    color: '#10B981',
    category: 'other',
    description: 'Monitoring service',
    propertiesSchema: {},
  },
  'logging': {
    id: 'logging',
    name: 'Logging',
    icon: 'FileText',
    color: '#06B6D4',
    category: 'other',
    description: 'Centralized logging',
    propertiesSchema: {},
  },
  'tracing': {
    id: 'tracing',
    name: 'Tracing',
    icon: 'Zap',
    color: '#06B6D4',
    category: 'other',
    description: 'Distributed tracing',
    propertiesSchema: {},
  },
  'alerting': {
    id: 'alerting',
    name: 'Alerting',
    icon: 'AlertCircle',
    color: '#F59E0B',
    category: 'other',
    description: 'Alert management',
    propertiesSchema: {},
  },

  // Services types
  'service': {
    id: 'service',
    name: 'Service',
    icon: 'Box',
    color: '#3B82F6',
    category: 'compute',
    description: 'Generic service',
    propertiesSchema: {},
  },
  'worker': {
    id: 'worker',
    name: 'Worker',
    icon: 'Cpu',
    color: '#8B5CF6',
    category: 'compute',
    description: 'Background worker',
    propertiesSchema: {},
  },

  // Legacy types
  'api-server': {
    id: 'api-server',
    name: 'API Server',
    icon: 'Server',
    color: '#3B82F6',
    category: 'api',
    description: 'API server',
    propertiesSchema: {},
  },
  'database': {
    id: 'database',
    name: 'Database',
    icon: 'Database',
    color: '#059669',
    category: 'data',
    description: 'Generic database',
    propertiesSchema: {},
  },

  // Storage types
  'storage': {
    id: 'storage',
    name: 'Storage',
    icon: 'HardDrive',
    color: '#14B8A6',
    category: 'storage',
    description: 'Object/File storage',
    propertiesSchema: {
      storageType: {
        name: 'storageType',
        type: 'select',
        label: 'Storage Type',
        options: [
          { value: 's3', label: 'AWS S3' },
          { value: 'gcs', label: 'Google Cloud Storage' },
          { value: 'azure-blob', label: 'Azure Blob Storage' },
        ],
      },
      encryption: {
        name: 'encryption',
        type: 'boolean',
        label: 'Enable Encryption',
      },
    },
  },
};

/**
 * Get configuration for a node type
 */
export function getNodeTypeConfig(type: NodeType): NodeTypeConfig {
  return NODE_TYPES_CONFIG[type] || NODE_TYPES_CONFIG['service'];
}

/**
 * Get all node types grouped by category
 */
export function getNodeTypesByCategory() {
  const grouped: Record<string, NodeTypeConfig[]> = {};

  Object.values(NODE_TYPES_CONFIG).forEach((config) => {
    if (!grouped[config.category]) {
      grouped[config.category] = [];
    }
    grouped[config.category].push(config);
  });

  return grouped;
}
