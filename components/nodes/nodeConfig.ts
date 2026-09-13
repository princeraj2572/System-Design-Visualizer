import type { NodeType, NodeTypeConfig } from '@/types';

export const NODE_CONFIG: Record<NodeType, NodeTypeConfig> = {
  user: {
    label: 'User / Client',
    icon: '👤',
    accent: '#3b82f6',
    category: 'infrastructure',
    defaultTechnology: 'Browser / Mobile',
    defaultName: 'Client',
  },
  cdn: {
    label: 'CDN',
    icon: '🌐',
    accent: '#8b5cf6',
    category: 'infrastructure',
    defaultTechnology: 'CloudFront / Cloudflare',
    defaultName: 'CDN',
  },
  loadBalancer: {
    label: 'Load Balancer',
    icon: '⚖️',
    accent: '#f97316',
    category: 'infrastructure',
    defaultTechnology: 'Nginx / HAProxy',
    defaultName: 'Load Balancer',
  },
  apiGateway: {
    label: 'API Gateway',
    icon: '🚪',
    accent: '#14b8a6',
    category: 'infrastructure',
    defaultTechnology: 'Kong / AWS API Gateway',
    defaultName: 'API Gateway',
  },
  apiServer: {
    label: 'API Server',
    icon: '🖥️',
    accent: '#22c55e',
    category: 'services',
    defaultTechnology: 'Node.js / Go',
    defaultName: 'API Server',
  },
  microservice: {
    label: 'Microservice',
    icon: '⚙️',
    accent: '#10b981',
    category: 'services',
    defaultTechnology: 'Docker / Kubernetes',
    defaultName: 'Service',
  },
  worker: {
    label: 'Worker',
    icon: '🔧',
    accent: '#eab308',
    category: 'services',
    defaultTechnology: 'Celery / BullMQ',
    defaultName: 'Worker',
  },
  database: {
    label: 'Database',
    icon: '🗄️',
    accent: '#6366f1',
    category: 'data',
    defaultTechnology: 'PostgreSQL / MySQL',
    defaultName: 'Database',
  },
  cache: {
    label: 'Cache',
    icon: '⚡',
    accent: '#ef4444',
    category: 'data',
    defaultTechnology: 'Redis / Memcached',
    defaultName: 'Cache',
  },
  messageQueue: {
    label: 'Message Queue',
    icon: '📬',
    accent: '#f59e0b',
    category: 'data',
    defaultTechnology: 'RabbitMQ / Kafka',
    defaultName: 'Message Queue',
  },
  storage: {
    label: 'Object Storage',
    icon: '💾',
    accent: '#6b7280',
    category: 'data',
    defaultTechnology: 'S3 / GCS',
    defaultName: 'Storage',
  },
};

export const NODE_CATEGORIES: {
  id: 'infrastructure' | 'services' | 'data';
  label: string;
  types: NodeType[];
}[] = [
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    types: ['user', 'cdn', 'loadBalancer', 'apiGateway'],
  },
  {
    id: 'services',
    label: 'Services',
    types: ['apiServer', 'microservice', 'worker'],
  },
  {
    id: 'data',
    label: 'Data',
    types: ['database', 'cache', 'messageQueue', 'storage'],
  },
];
