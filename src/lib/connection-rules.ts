/**
 * Connection Rules System for Architecture Visualization
 * Defines which node types can connect to which others based on logical architecture patterns
 */

export type NodeType = 
  // Frontend
  | 'client'
  | 'web-frontend'
  | 'mobile-app'
  // API
  | 'api-gateway'
  | 'rest-api'
  | 'graphql-server'
  | 'grpc-server'
  | 'websocket-server'
  // Compute
  | 'lambda'
  | 'container'
  | 'vm'
  // Data
  | 'sql-database'
  | 'nosql-database'
  | 'graph-database'
  | 'search-engine'
  | 'data-warehouse'
  // Cache & CDN
  | 'cache'
  | 'cdn'
  // Messaging
  | 'message-queue'
  | 'pub-sub'
  | 'event-bus'
  // Infrastructure
  | 'load-balancer'
  | 'reverse-proxy'
  | 'firewall'
  | 'dns'
  | 'storage'
  // Observability
  | 'monitoring'
  | 'logging'
  | 'tracing'
  | 'alerting';

/**
 * Comprehensive connection rules mapping source node types to their allowed targets
 * Follows logical architecture patterns and best practices
 */
export const CONNECTION_RULES: Record<NodeType, NodeType[]> = {
  // Frontend Layer - clients and frontends
  client: [
    'api-gateway',
    'rest-api',
    'cdn',
    'reverse-proxy',
    'load-balancer',
    'websocket-server',
  ],
  'web-frontend': [
    'api-gateway',
    'rest-api',
    'graphql-server',
    'cdn',
    'reverse-proxy',
    'load-balancer',
    'websocket-server',
  ],
  'mobile-app': [
    'api-gateway',
    'rest-api',
    'graphql-server',
    'grpc-server',
    'websocket-server',
  ],

  // API Layer - entry points and protocol servers
  'api-gateway': [
    'rest-api',
    'graphql-server',
    'grpc-server',
    'websocket-server',
    'load-balancer',
    'reverse-proxy',
    'message-queue',
    'lambda',
    'container',
  ],
  'rest-api': [
    'sql-database',
    'nosql-database',
    'graph-database',
    'cache',
    'message-queue',
    'search-engine',
    'lambda',
    'container',
    'event-bus',
    'logging',
    'monitoring',
  ],
  'graphql-server': [
    'sql-database',
    'nosql-database',
    'graph-database',
    'cache',
    'message-queue',
    'search-engine',
    'lambda',
    'container',
    'logging',
    'monitoring',
  ],
  'grpc-server': [
    'sql-database',
    'nosql-database',
    'graph-database',
    'cache',
    'message-queue',
    'lambda',
    'container',
    'logging',
    'monitoring',
  ],
  'websocket-server': [
    'sql-database',
    'nosql-database',
    'cache',
    'message-queue',
    'pub-sub',
    'event-bus',
    'logging',
    'monitoring',
  ],

  // Compute Layer - processing units
  lambda: [
    'sql-database',
    'nosql-database',
    'graph-database',
    'cache',
    'message-queue',
    'event-bus',
    'pub-sub',
    'storage',
    'search-engine',
    'logging',
    'monitoring',
  ],
  container: [
    'sql-database',
    'nosql-database',
    'graph-database',
    'cache',
    'message-queue',
    'event-bus',
    'pub-sub',
    'storage',
    'search-engine',
    'logging',
    'monitoring',
  ],
  vm: [
    'sql-database',
    'nosql-database',
    'graph-database',
    'cache',
    'message-queue',
    'event-bus',
    'pub-sub',
    'storage',
    'search-engine',
    'logging',
    'monitoring',
  ],

  // Data Layer - storage and retrieval
  'sql-database': [
    'cache',
    'search-engine',
    'data-warehouse',
    'logging',
    'monitoring',
  ],
  'nosql-database': [
    'cache',
    'search-engine',
    'data-warehouse',
    'logging',
    'monitoring',
  ],
  'graph-database': [
    'cache',
    'search-engine',
    'data-warehouse',
    'logging',
    'monitoring',
  ],
  'search-engine': [
    'data-warehouse',
    'logging',
    'monitoring',
  ],
  'data-warehouse': [
    'logging',
    'monitoring',
  ],

  // Cache & CDN
  cache: [
    'logging',
    'monitoring',
  ],
  cdn: [
    'client',
    'web-frontend',
    'storage',
    'logging',
    'monitoring',
  ],

  // Messaging Layer
  'message-queue': [
    'lambda',
    'container',
    'vm',
    'logging',
    'monitoring',
  ],
  'pub-sub': [
    'lambda',
    'container',
    'vm',
    'event-bus',
    'logging',
    'monitoring',
  ],
  'event-bus': [
    'lambda',
    'container',
    'vm',
    'pub-sub',
    'message-queue',
    'logging',
    'monitoring',
  ],

  // Infrastructure Layer
  'load-balancer': [
    'api-gateway',
    'rest-api',
    'websocket-server',
    'reverse-proxy',
    'logging',
    'monitoring',
  ],
  'reverse-proxy': [
    'api-gateway',
    'rest-api',
    'websocket-server',
    'load-balancer',
    'logging',
    'monitoring',
  ],
  firewall: [
    'load-balancer',
    'reverse-proxy',
    'api-gateway',
    'logging',
    'monitoring',
  ],
  dns: [
    'load-balancer',
    'reverse-proxy',
    'api-gateway',
    'cdn',
    'logging',
    'monitoring',
  ],
  storage: [
    'lambda',
    'container',
    'vm',
    'logging',
    'monitoring',
  ],

  // Observability Layer - observes all, usually one-way only
  monitoring: [],
  logging: [],
  tracing: [],
  alerting: [],
};

/**
 * Determines if a connection from sourceType to targetType is allowed
 * @param sourceType The node type initiating the connection
 * @param targetType The node type receiving the connection
 * @returns true if the connection is allowed, false otherwise
 */
export function canConnect(sourceType: string, targetType: string): boolean {
  const normalized = sourceType.toLowerCase();
  const normalizedTarget = targetType.toLowerCase();

  if (!(normalized in CONNECTION_RULES)) {
    return false;
  }

  const allowedTargets = CONNECTION_RULES[normalized as NodeType];
  return allowedTargets.some(t => t.toLowerCase() === normalizedTarget);
}

/**
 * Gets all allowed connection targets for a given node type
 * @param nodeType The node type to get allowed connections for
 * @returns Array of allowed target node types
 */
export function getAllowedConnections(nodeType: string): NodeType[] {
  const normalized = nodeType.toLowerCase();

  if (!(normalized in CONNECTION_RULES)) {
    return [];
  }

  return CONNECTION_RULES[normalized as NodeType];
}

/**
 * Get all node types that can connect TO a given type (reverse connections)
 * @param targetType The target node type
 * @returns Array of NodeTypes that can connect to this type
 */
export function getIncomingConnections(targetType: string): NodeType[] {
  const normalized = targetType.toLowerCase();
  const incoming: NodeType[] = [];

  for (const [sourceType, targets] of Object.entries(CONNECTION_RULES)) {
    if (targets.some(t => t.toLowerCase() === normalized)) {
      incoming.push(sourceType as NodeType);
    }
  }

  return incoming;
}

/**
 * Get a user-friendly reason why two types can/cannot connect
 * @param sourceType The source node type
 * @param targetType The target node type
 * @returns Explanation message
 */
export function getConnectionReason(sourceType: string, targetType: string): string {
  if (canConnect(sourceType, targetType)) {
    return `${sourceType} can send data to ${targetType}`;
  }
  return `${sourceType} cannot directly connect to ${targetType}`;
}
