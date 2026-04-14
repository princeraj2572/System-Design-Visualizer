/**
 * Real-time Collaboration Types
 */

export interface RealtimeUser {
  userId: string;
  username: string;
  cursor?: { x: number; y: number };
  selectedNodeId?: string;
  color: string;
}

export interface PresenceUpdate {
  users: RealtimeUser[];
  totalUsers: number;
}

export interface CursorUpdate {
  socketId: string;
  username: string;
  cursor: { x: number; y: number };
  color: string;
}

export interface NodeSelectionUpdate {
  socketId: string;
  username: string;
  nodeId?: string;
  color: string;
}

export interface RealtimeEvent {
  id: string;
  type: string;
  projectId: string;
  userId: string;
  timestamp: number;
  sequence: number;
  data: any;
}

export interface SyncResponse {
  success: boolean;
  events: RealtimeEvent[];
  latestSequence: number;
  timestamp: number;
}

export const RealtimeEventTypes = {
  NODE_ADD: 'node:add',
  NODE_UPDATE: 'node:update',
  NODE_DELETE: 'node:delete',
  EDGE_ADD: 'edge:add',
  EDGE_UPDATE: 'edge:update',
  EDGE_DELETE: 'edge:delete',
  GROUP_ADD: 'group:add',
  GROUP_UPDATE: 'group:update',
  GROUP_DELETE: 'group:delete',
  NODE_MOVE_TO_GROUP: 'node:moveToGroup',
  PROJECT_UPDATE: 'project:update',
};
