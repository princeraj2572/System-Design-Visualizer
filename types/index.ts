import type { Node, Edge } from 'reactflow';
import type { CSSProperties, ReactNode } from 'react';

export type NodeType =
  // Generic, vendor-neutral
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
  | 'nosqlDatabase'
  | 'cache'
  | 'messageQueue'
  | 'storage'
  | 'searchEngine'
  | 'notificationService'
  | 'monitoring'
  | 'dataWarehouse'
  // AWS
  | 'aws-cloudfront'
  | 'aws-route53'
  | 'aws-waf'
  | 'aws-elb'
  | 'aws-api-gateway'
  | 'aws-cloudwatch'
  | 'aws-ec2'
  | 'aws-ecs'
  | 'aws-lambda'
  | 'aws-cognito'
  | 'aws-eventbridge'
  | 'aws-rds'
  | 'aws-dynamodb'
  | 'aws-elasticache'
  | 'aws-sqs'
  | 'aws-s3'
  | 'aws-opensearch'
  | 'aws-redshift'
  | 'aws-sns'
  // Azure
  | 'azure-cdn'
  | 'azure-dns'
  | 'azure-waf'
  | 'azure-load-balancer'
  | 'azure-api-management'
  | 'azure-monitor'
  | 'azure-vm'
  | 'azure-aks'
  | 'azure-functions'
  | 'azure-entra'
  | 'azure-scheduler'
  | 'azure-sql-database'
  | 'azure-cosmos-db'
  | 'azure-cache-redis'
  | 'azure-service-bus'
  | 'azure-blob-storage'
  | 'azure-cognitive-search'
  | 'azure-synapse'
  | 'azure-notification-hubs'
  // GCP
  | 'gcp-cloud-cdn'
  | 'gcp-cloud-dns'
  | 'gcp-cloud-armor'
  | 'gcp-load-balancing'
  | 'gcp-api-gateway'
  | 'gcp-monitoring'
  | 'gcp-compute-engine'
  | 'gcp-gke'
  | 'gcp-cloud-functions'
  | 'gcp-identity-platform'
  | 'gcp-cloud-scheduler'
  | 'gcp-cloud-sql'
  | 'gcp-firestore'
  | 'gcp-memorystore'
  | 'gcp-pubsub'
  | 'gcp-cloud-storage'
  | 'gcp-bigquery';

export type NodeProvider = 'generic' | 'aws' | 'azure' | 'gcp';

// A plain call signature (not ComponentType<...>) so real lucide-react icon
// components — which accept all of these props plus more, but carry a
// stricter `propTypes` static type that trips up structural assignability
// against ComponentType — are still assignable here. Also covers the plain
// <img>-based wrapper used for vendored cloud-provider SVGs.
export type NodeIconComponent = (props: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) => ReactNode;

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
  Icon: NodeIconComponent;
  accent: string;
  category: 'infrastructure' | 'services' | 'data';
  provider: NodeProvider;
  defaultTechnology: string;
  defaultName: string;
  description: string;
  allowedTargets: NodeType[];
}

export interface NodeCategoryGroup {
  id: 'infrastructure' | 'services' | 'data';
  label: string;
  types: NodeType[];
}
