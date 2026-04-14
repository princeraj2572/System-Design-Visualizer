/**
 * Type definitions for the System Design Visualizer application
 */

export type NodeType = 
  | 'api-server'
  | 'database'
  | 'cache'
  | 'load-balancer'
  | 'message-queue'
  | 'worker'
  | 'storage'
  | 'service';

export interface NodeData {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  metadata: {
    name: string;
    description: string;
    technology: string;
    config?: Record<string, unknown>;
  };
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchitectureState {
  nodes: NodeData[];
  edges: Edge[];
  selectedNode: string | null;
  history: Array<{ nodes: NodeData[]; edges: Edge[] }>;
  historyIndex: number;
  theme: 'light' | 'dark';
}
