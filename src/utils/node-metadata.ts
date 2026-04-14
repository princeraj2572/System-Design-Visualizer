/**
 * Node Type Metadata
 * Provides detailed information about each architecture component type
 * Including descriptions, capabilities, API endpoints, database interactions, and connection rules
 */

import { getAllowedConnections, getIncomingConnections, NodeType } from '@/lib/connection-rules';

export interface NodeMetadata {
  name: string;
  description: string;
  category: 'Frontend' | 'API' | 'Compute' | 'Data' | 'Infrastructure' | 'Observability' | 'Messaging' | 'Content';
  role: string;
  example: string;
  apiEndpoints: string[];
  dbTables: string[];
  canConnectTo: NodeType[];
  canBeConnectedFrom: NodeType[];
}

export type NodeMetadataMap = Record<NodeType, NodeMetadata>;

/**
 * Complete metadata for all 30+ node types
 * Used by UI to display tooltips, info panels, and connection validation
 */
export const NODE_METADATA: NodeMetadataMap = {
  // ===== Frontend Layer =====
  client: {
    name: 'Client/Browser',
    category: 'Frontend',
    description: 'Web or desktop client application that users interact with',
    role: 'User-facing interface for consuming services',
    example: 'React SPA, Vue.js app, or Electron desktop app',
    apiEndpoints: [],
    dbTables: [],
    canConnectTo: getAllowedConnections('client'),
    canBeConnectedFrom: getIncomingConnections('client'),
  },
  'web-frontend': {
    name: 'Web Frontend',
    category: 'Frontend',
    description: 'Modern web application built with React, Vue, or Angular',
    role: 'Primary user interface layer',
    example: 'React app with Next.js, accessing GraphQL or REST APIs',
    apiEndpoints: [],
    dbTables: [],
    canConnectTo: getAllowedConnections('web-frontend'),
    canBeConnectedFrom: getIncomingConnections('web-frontend'),
  },
  'mobile-app': {
    name: 'Mobile App',
    category: 'Frontend',
    description: 'iOS or Android native mobile application',
    role: 'Mobile interface for service consumption',
    example: 'Swift iOS app or Kotlin Android app',
    apiEndpoints: [],
    dbTables: [],
    canConnectTo: getAllowedConnections('mobile-app'),
    canBeConnectedFrom: getIncomingConnections('mobile-app'),
  },

  // ===== API Layer =====
  'api-gateway': {
    name: 'API Gateway',
    category: 'API',
    description: 'Central entry point that routes and manages all API requests',
    role: 'Request routing, rate limiting, authentication gateway',
    example: 'Kong, AWS API Gateway, or Nginx',
    apiEndpoints: ['/api/v1/*', '/graphql', '/rest'],
    dbTables: ['api_routes', 'rate_limits', 'api_keys'],
    canConnectTo: getAllowedConnections('api-gateway'),
    canBeConnectedFrom: getIncomingConnections('api-gateway'),
  },
  'rest-api': {
    name: 'REST API Server',
    category: 'API',
    description: 'RESTful API service handling HTTP requests and responses',
    role: 'Business logic execution and data transformation',
    example: 'Express.js, Flask, or Django REST server',
    apiEndpoints: ['/api/users', '/api/projects', '/api/data'],
    dbTables: ['users', 'projects', 'data_records'],
    canConnectTo: getAllowedConnections('rest-api'),
    canBeConnectedFrom: getIncomingConnections('rest-api'),
  },
  'graphql-server': {
    name: 'GraphQL Server',
    category: 'API',
    description: 'GraphQL endpoint for flexible query execution',
    role: 'Query resolution and data fetching',
    example: 'Apollo Server, Hasura, or GraphQL.js',
    apiEndpoints: ['/graphql', '/graphql/playground'],
    dbTables: ['users', 'posts', 'comments'],
    canConnectTo: getAllowedConnections('graphql-server'),
    canBeConnectedFrom: getIncomingConnections('graphql-server'),
  },
  'grpc-server': {
    name: 'gRPC Server',
    category: 'API',
    description: 'High-performance RPC service using Protocol Buffers',
    role: 'Fast service-to-service communication',
    example: 'gRPC service in Go, Node.js, or Python',
    apiEndpoints: [':50051/ServiceName', 'grpc.reflection.v1alpha.ServerReflection'],
    dbTables: ['proto_messages', 'service_events'],
    canConnectTo: getAllowedConnections('grpc-server'),
    canBeConnectedFrom: getIncomingConnections('grpc-server'),
  },
  'websocket-server': {
    name: 'WebSocket Server',
    category: 'API',
    description: 'Real-time bidirectional communication server',
    role: 'Live data streaming and instant notifications',
    example: 'Socket.io, ws library, or SignalR',
    apiEndpoints: ['/ws', '/socket.io'],
    dbTables: ['active_connections', 'message_queue'],
    canConnectTo: getAllowedConnections('websocket-server'),
    canBeConnectedFrom: getIncomingConnections('websocket-server'),
  },

  // ===== Compute Layer =====
  lambda: {
    name: 'Lambda/Serverless',
    category: 'Compute',
    description: 'Serverless functions that run on-demand without managing servers',
    role: 'Event-driven computation and scheduled tasks',
    example: 'AWS Lambda, Google Cloud Functions, or Azure Functions',
    apiEndpoints: ['/invoke', '/trigger'],
    dbTables: ['function_logs', 'execution_history'],
    canConnectTo: getAllowedConnections('lambda'),
    canBeConnectedFrom: getIncomingConnections('lambda'),
  },
  container: {
    name: 'Container/Docker',
    category: 'Compute',
    description: 'Containerized microservice running in Docker or Kubernetes',
    role: 'Isolated service execution and deployment',
    example: 'Docker container in Kubernetes or Docker Swarm',
    apiEndpoints: [':8080/health', ':8080/metrics'],
    dbTables: [],
    canConnectTo: getAllowedConnections('container'),
    canBeConnectedFrom: getIncomingConnections('container'),
  },
  vm: {
    name: 'Virtual Machine',
    category: 'Compute',
    description: 'Virtual machine instance for running applications',
    role: 'Full OS environment for services',
    example: 'EC2 instance, GCP Compute Engine, or Azure VM',
    apiEndpoints: [':80', ':443'],
    dbTables: [],
    canConnectTo: getAllowedConnections('vm'),
    canBeConnectedFrom: getIncomingConnections('vm'),
  },

  // ===== Data Layer =====
  'sql-database': {
    name: 'SQL Database',
    category: 'Data',
    description: 'Relational database using SQL (PostgreSQL, MySQL)',
    role: 'Structured data storage with ACID guarantees',
    example: 'PostgreSQL 15, MySQL 8.0, or Oracle DB',
    apiEndpoints: [':5432/database', ':3306/database'],
    dbTables: ['users', 'orders', 'products', 'transactions', 'audit_logs'],
    canConnectTo: getAllowedConnections('sql-database'),
    canBeConnectedFrom: getIncomingConnections('sql-database'),
  },
  'nosql-database': {
    name: 'NoSQL Database',
    category: 'Data',
    description: 'Non-relational database (MongoDB, DynamoDB, Cassandra)',
    role: 'Flexible schema data storage with horizontal scaling',
    example: 'MongoDB 6.0, AWS DynamoDB, or Cassandra',
    apiEndpoints: [':27017/mongodb', ':8081/admin'],
    dbTables: ['documents', 'collections', 'sessions', 'user_profiles'],
    canConnectTo: getAllowedConnections('nosql-database'),
    canBeConnectedFrom: getIncomingConnections('nosql-database'),
  },
  'graph-database': {
    name: 'Graph Database',
    category: 'Data',
    description: 'Graph-optimized database for relationship queries (Neo4j)',
    role: 'Efficient storage and querying of interconnected data',
    example: 'Neo4j 5.x, Amazon Neptune, or JanusGraph',
    apiEndpoints: [':7474/browser', ':7687/bolt'],
    dbTables: ['nodes', 'relationships', 'properties'],
    canConnectTo: getAllowedConnections('graph-database'),
    canBeConnectedFrom: getIncomingConnections('graph-database'),
  },
  'search-engine': {
    name: 'Search Engine',
    category: 'Data',
    description: 'Full-text search and analytics engine (Elasticsearch)',
    role: 'Fast searching and real-time analytics',
    example: 'Elasticsearch 8.x, OpenSearch, or Solr',
    apiEndpoints: [':9200/_search', ':9200/_bulk'],
    dbTables: ['indices', 'documents', 'shards'],
    canConnectTo: getAllowedConnections('search-engine'),
    canBeConnectedFrom: getIncomingConnections('search-engine'),
  },
  'data-warehouse': {
    name: 'Data Warehouse',
    category: 'Data',
    description: 'Large-scale data warehouse for analytics (Snowflake, BigQuery)',
    role: 'OLAP queries and business intelligence',
    example: 'Snowflake, Google BigQuery, or Amazon Redshift',
    apiEndpoints: [':443/warehouse', '/api/v2/sql/'],
    dbTables: ['fact_tables', 'dimension_tables', 'aggregates'],
    canConnectTo: getAllowedConnections('data-warehouse'),
    canBeConnectedFrom: getIncomingConnections('data-warehouse'),
  },

  // ===== Cache & CDN =====
  cache: {
    name: 'Cache',
    category: 'Infrastructure',
    description: 'In-memory data cache for fast data access (Redis, Memcached)',
    role: 'Performance optimization through caching',
    example: 'Redis 7.x, Memcached, or AWS ElastiCache',
    apiEndpoints: [':6379', ':11211'],
    dbTables: ['cache_entries', 'ttl_index'],
    canConnectTo: getAllowedConnections('cache'),
    canBeConnectedFrom: getIncomingConnections('cache'),
  },
  cdn: {
    name: 'CDN',
    category: 'Content',
    description: 'Content Delivery Network for geographically distributed content',
    role: 'Low-latency content delivery worldwide',
    example: 'Cloudflare, AWS CloudFront, or Akamai',
    apiEndpoints: ['/api/cache-purge'],
    dbTables: ['edge_locations', 'cache_manifest'],
    canConnectTo: getAllowedConnections('cdn'),
    canBeConnectedFrom: getIncomingConnections('cdn'),
  },

  // ===== Messaging Layer =====
  'message-queue': {
    name: 'Message Queue',
    category: 'Messaging',
    description: 'Asynchronous message broker (RabbitMQ, SQS, Kafka)',
    role: 'Decoupled async communication between services',
    example: 'RabbitMQ, AWS SQS, or Apache Kafka',
    apiEndpoints: [':5672/rabbitmq', ':443/sqs'],
    dbTables: ['messages', 'queues', 'consumers'],
    canConnectTo: getAllowedConnections('message-queue'),
    canBeConnectedFrom: getIncomingConnections('message-queue'),
  },
  'pub-sub': {
    name: 'Pub/Sub',
    category: 'Messaging',
    description: 'Publish-Subscribe messaging (Google Pub/Sub, AWS SNS)',
    role: 'One-to-many event distribution',
    example: 'Google Cloud Pub/Sub, AWS SNS, or Redis Pub/Sub',
    apiEndpoints: ['/v1/projects/*/topics', '/v1/projects/*/subscriptions'],
    dbTables: ['topics', 'subscriptions', 'messages'],
    canConnectTo: getAllowedConnections('pub-sub'),
    canBeConnectedFrom: getIncomingConnections('pub-sub'),
  },
  'event-bus': {
    name: 'Event Bus',
    category: 'Messaging',
    description: 'Central event routing and publishing system',
    role: 'Event-driven architecture coordination',
    example: 'AWS EventBridge, Kafka, or Temporal',
    apiEndpoints: ['/events/publish', '/events/subscribe'],
    dbTables: ['events', 'event_handlers', 'event_log'],
    canConnectTo: getAllowedConnections('event-bus'),
    canBeConnectedFrom: getIncomingConnections('event-bus'),
  },

  // ===== Infrastructure Layer =====
  'load-balancer': {
    name: 'Load Balancer',
    category: 'Infrastructure',
    description: 'Distributes incoming traffic across multiple servers',
    role: 'High availability and traffic distribution',
    example: 'AWS ELB, Nginx, or HAProxy',
    apiEndpoints: [':80', ':443'],
    dbTables: ['target_groups', 'health_checks'],
    canConnectTo: getAllowedConnections('load-balancer'),
    canBeConnectedFrom: getIncomingConnections('load-balancer'),
  },
  'reverse-proxy': {
    name: 'Reverse Proxy',
    category: 'Infrastructure',
    description: 'Server that forwards client requests to backend servers',
    role: 'Request routing, SSL termination, and caching',
    example: 'Nginx, HAProxy, or Traefik',
    apiEndpoints: [':80', ':443'],
    dbTables: ['upstream_servers', 'routes'],
    canConnectTo: getAllowedConnections('reverse-proxy'),
    canBeConnectedFrom: getIncomingConnections('reverse-proxy'),
  },
  firewall: {
    name: 'Firewall',
    category: 'Infrastructure',
    description: 'Network security firewall controlling traffic',
    role: 'Security and traffic filtering',
    example: 'AWS WAF, Palo Alto Networks, or iptables',
    apiEndpoints: [],
    dbTables: ['firewall_rules', 'blocked_ips'],
    canConnectTo: getAllowedConnections('firewall'),
    canBeConnectedFrom: getIncomingConnections('firewall'),
  },
  dns: {
    name: 'DNS',
    category: 'Infrastructure',
    description: 'Domain name resolution service',
    role: 'Name resolution and service discovery',
    example: 'Route 53, CloudFlare DNS, or Consul',
    apiEndpoints: [':53', ':8600'],
    dbTables: ['dns_records', 'zones'],
    canConnectTo: getAllowedConnections('dns'),
    canBeConnectedFrom: getIncomingConnections('dns'),
  },
  storage: {
    name: 'Object Storage',
    category: 'Infrastructure',
    description: 'Scalable object storage (S3, GCS, Blob Storage)',
    role: 'Reliable file and object storage',
    example: 'AWS S3, Google Cloud Storage, or Azure Blob Storage',
    apiEndpoints: [':443/mybucket', '/storage/v1/b'],
    dbTables: ['objects', 'buckets', 'metadata'],
    canConnectTo: getAllowedConnections('storage'),
    canBeConnectedFrom: getIncomingConnections('storage'),
  },

  // ===== Observability Layer =====
  monitoring: {
    name: 'Monitoring',
    category: 'Observability',
    description: 'System monitoring and metrics collection (Prometheus, DataDog)',
    role: 'Performance and health observation',
    example: 'Prometheus, Datadog, New Relic, or Grafana',
    apiEndpoints: [':9090/metrics', '/api/v1/series'],
    dbTables: ['metrics', 'time_series', 'alerts'],
    canConnectTo: getAllowedConnections('monitoring'),
    canBeConnectedFrom: getIncomingConnections('monitoring'),
  },
  logging: {
    name: 'Logging',
    category: 'Observability',
    description: 'Centralized log collection and storage (ELK, Loki)',
    role: 'Log aggregation and searching',
    example: 'ELK Stack, Loki, Splunk, or CloudWatch Logs',
    apiEndpoints: [':9200/_search', '/loki/api/v1/push'],
    dbTables: ['logs', 'log_streams', 'indices'],
    canConnectTo: getAllowedConnections('logging'),
    canBeConnectedFrom: getIncomingConnections('logging'),
  },
  tracing: {
    name: 'Distributed Tracing',
    category: 'Observability',
    description: 'Distributed request tracing (Jaeger, Zipkin)',
    role: 'Request flow tracking across services',
    example: 'Jaeger, Zipkin, or Tempo',
    apiEndpoints: [':6831/udp', ':14268/traces'],
    dbTables: ['traces', 'spans', 'service_map'],
    canConnectTo: getAllowedConnections('tracing'),
    canBeConnectedFrom: getIncomingConnections('tracing'),
  },
  alerting: {
    name: 'Alerting',
    category: 'Observability',
    description: 'Alert management and notification system',
    role: 'Incident notification and escalation',
    example: 'Alertmanager, PagerDuty, or Opsgenie',
    apiEndpoints: [':9093/api/v1/alerts'],
    dbTables: ['alerts', 'alert_rules', 'silences'],
    canConnectTo: getAllowedConnections('alerting'),
    canBeConnectedFrom: getIncomingConnections('alerting'),
  },
};

/**
 * Helper function to get metadata for a node type
 * @param nodeType The node type to get metadata for
 * @returns NodeMetadata or undefined if not found
 */
export function getNodeMetadata(nodeType: string): NodeMetadata | undefined {
  return NODE_METADATA[nodeType.toLowerCase() as NodeType];
}

/**
 * Get a formatted string of allowed outgoing connections
 * @param nodeType The node type
 * @returns User-friendly list of allowed connections
 */
export function getFormattedConnections(nodeType: string): string {
  const metadata = getNodeMetadata(nodeType);
  if (!metadata || metadata.canConnectTo.length === 0) {
    return 'No outgoing connections';
  }
  return metadata.canConnectTo.map(t => NODE_METADATA[t]?.name || t).join(', ');
}

/**
 * Get a formatted string of incoming connections (what can connect TO this type)
 * @param nodeType The node type
 * @returns User-friendly list of incoming connections
 */
export function getFormattedIncomingConnections(nodeType: string): string {
  const metadata = getNodeMetadata(nodeType);
  if (!metadata || metadata.canBeConnectedFrom.length === 0) {
    return 'Cannot receive connections';
  }
  return metadata.canBeConnectedFrom.map(t => NODE_METADATA[t]?.name || t).join(', ');
}
