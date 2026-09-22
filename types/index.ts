import type { Node, Edge } from 'reactflow';
import type { LucideIcon } from 'lucide-react';

export type NodeType =
  | 'user'
  | 'cdn'
  | 'dns'
  | 'waf'
  | 'loadBalancer'
  | 'apiGateway'
  | 'apiServer'
  | 'microservice'
  | 'worker'
  | 'authService'
  | 'cronJob'
  | 'serverlessFunction'
  | 'thirdPartyApi'
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
  Icon: LucideIcon;
  accent: string;
  category: 'infrastructure' | 'services' | 'data';
  defaultTechnology: string;
  defaultName: string;
  description: string;
  allowedTargets: NodeType[];
}
