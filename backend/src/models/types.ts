/**
 * Database Models/Schema
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  nodes: Node[];
  edges: Edge[];
  version: string;
  created_at: Date;
  updated_at: Date;
  is_public: boolean;
}

export interface Node {
  id: string;
  type: 'api-server' | 'database' | 'cache' | 'load-balancer' | 
         'message-queue' | 'worker' | 'storage' | 'service';
  position: { x: number; y: number };
  metadata: {
    name: string;
    description: string;
    technology: string;
    config?: Record<string, any>;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: 'http' | 'grpc' | 'message-queue' | 'database' | 'event';
}

export interface ProjectShare {
  id: string;
  project_id: string;
  shared_with_user_id: string;
  permission_level: 'view' | 'edit' | 'admin';
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  created_at: Date;
}
