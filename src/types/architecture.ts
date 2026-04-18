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
    // Performance metrics
    latency?: number; // ms
    throughput?: number; // requests per second
    // Deployment info
    replicas?: number; // number of instances
    region?: string; // geographic region
    tier?: 'critical' | 'high' | 'medium' | 'low';
    tags?: string[];
    // Custom config
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
  // Enhanced edge metadata
  protocol?: 'http' | 'https' | 'grpc' | 'websocket' | 'tcp' | 'udp' | 'amqp' | 'mqtt' | 'kafka' | string;
  latency?: number; // ms
  bandwidth?: number; // Mbps
  syncType?: 'sync' | 'async';
  retryPolicy?: {
    maxRetries?: number;
    backoffMs?: number;
  };
  authentication?: 'none' | 'mTLS' | 'oauth' | 'api-key';
  documentation?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// SPEC-ALIGNED TYPES (extends existing structure for new UI/components)
// ─────────────────────────────────────────────────────────────────────────────

export type NodeShape = 'rectangle' | 'cylinder' | 'hexagon' | 'parallelogram' | 'pill' | 'diamond' | 'cloud' | 'group';
export type NodeCategory = 'compute' | 'storage' | 'messaging' | 'network' | 'client' | 'infrastructure';
export type EditorViewMode = 'document' | 'both' | 'canvas';
export type RightPanelTab = 'properties' | 'connections' | 'documentation';
export type NodeColorKey = 'blue' | 'green' | 'amber' | 'purple' | 'coral' | 'teal' | 'gray';

export type EdgeProtocol = 'REST' | 'gRPC' | 'GraphQL' | 'WebSocket' | 'AMQP' | 'Kafka' | 'SQL' | 'TCP' | 'UDP' | 'HTTPS' | 'custom';
export type EdgeStyle = 'solid' | 'dashed' | 'dotted';

/** Extended editor state for spec-based UI */
export interface EditorState {
  projectId: string;
  projectName: string;
  viewMode: EditorViewMode;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  rightPanelTab: RightPanelTab;
  isGridVisible: boolean;
  isMinimapVisible: boolean;
  sidebarSearchQuery: string;
  isSidebarCollapsed: boolean;
}

/** Extended node data for spec-based rendering */
export interface NodeDataExtended extends NodeData {
  data?: {
    label: string;
    sublabel: string;
    category: NodeCategory;
    shape: NodeShape;
    icon: string;
    description: string;
    notes: string;
    tags: string[];
    targetRps?: string;
    sla?: string;
    replicas?: number;
    region?: string;
    tier?: 'critical' | 'high' | 'medium' | 'low';
    color: NodeColorKey;
    isLocked: boolean;
    isCollapsed: boolean;
  };
}

/** Extended edge data for spec-based rendering */
export interface EdgeDataExtended extends Edge {
  data?: {
    protocol: EdgeProtocol;
    label?: string;
    latency?: string;
    bandwidth?: string;
    syncType: 'sync' | 'async';
    deliveryGuarantee?: 'at-most-once' | 'at-least-once' | 'exactly-once';
    animated: boolean;
    style: EdgeStyle;
    color: string;
  };
}

/** Component library definition */
export interface ComponentDefinition {
  id: string;
  label: string;
  sublabel: string;
  category: NodeCategory;
  shape: NodeShape;
  icon: string;
  defaultColor: NodeColorKey;
  defaultData: Partial<NodeDataExtended>;
  suggestedTargets: string[];
  suggestedSources: string[];
}

/** Connection suggestion for right panel */
export interface ConnectionSuggestion {
  componentId: string;
  label: string;
  icon: string;
  reason: string;
  direction: 'add-target' | 'add-source';
}

