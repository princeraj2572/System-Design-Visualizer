import type { Node, Edge } from 'reactflow';

export type NodeType =
  | 'user'
  | 'cdn'
  | 'loadBalancer'
  | 'apiGateway'
  | 'apiServer'
  | 'microservice'
  | 'worker'
  | 'database'
  | 'cache'
  | 'messageQueue'
  | 'storage';

export interface NodeData {
  nodeType: NodeType;
  name: string;
  description: string;
  technology: string;
  config: string;
}

export type ArchNode = Node<NodeData>;
export type ArchEdge = Edge;

export interface Project {
  id: string;
  name: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  severity: 'warning' | 'error';
  message: string;
  nodeId?: string;
}

export interface NodeTypeConfig {
  label: string;
  icon: string;
  accent: string;
  category: 'infrastructure' | 'services' | 'data';
  defaultTechnology: string;
  defaultName: string;
}
