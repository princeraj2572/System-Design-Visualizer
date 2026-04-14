/**
 * Type definitions for the System Design Visualizer application
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
  // Cache/CDN
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
  | 'alerting'
  // Services
  | 'service'
  | 'worker'
  // Legacy (for backward compatibility)
  | 'api-server'
  | 'database';

export interface NodeData {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  parentId?: string | null;
  metadata: {
    name: string;
    description: string;
    technology: string;
    config?: Record<string, unknown>;
  };
  isCollapsed?: boolean;
}

export interface NodeGroup {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  childNodeIds: string[];
  color?: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  isCollapsed?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: 'http' | 'grpc' | 'message-queue' | 'database' | 'event';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  nodes: NodeData[];
  edges: Edge[];
  groups?: NodeGroup[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchitectureState {
  nodes: NodeData[];
  edges: Edge[];
  groups: NodeGroup[];
  selectedNode: string | null;
  expandedGroups: string[];
  history: Array<{ nodes: NodeData[]; edges: Edge[]; groups: NodeGroup[] }>;
  historyIndex: number;
  theme: 'light' | 'dark';
}
