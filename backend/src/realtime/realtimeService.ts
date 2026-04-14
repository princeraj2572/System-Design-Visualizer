import { Server } from 'socket.io';
import logger from '../utils/logger';

export interface RealtimeEvent {
  id: string; // Event ID for deduplication
  type: string; // e.g., 'node:add', 'edge:update', etc.
  projectId: string;
  userId: string;
  timestamp: number;
  sequence: number;
  data: any;
}

let io: Server | null = null;
const eventLog = new Map<string, RealtimeEvent[]>(); // projectId -> events
const MAX_EVENT_HISTORY = 100;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

/**
 * Broadcast an event to all users in a project room
 */
export function broadcastEvent(event: RealtimeEvent) {
  if (!io) {
    logger.warn('Socket.io not initialized for event broadcast');
    return;
  }

  const roomName = `project-${event.projectId}`;

  // Log event for conflict resolution
  if (!eventLog.has(event.projectId)) {
    eventLog.set(event.projectId, []);
  }

  const projectLog = eventLog.get(event.projectId)!;
  projectLog.push(event);

  // Keep only last N events
  if (projectLog.length > MAX_EVENT_HISTORY) {
    projectLog.shift();
  }

  logger.debug(`Broadcasting ${event.type} to room ${roomName}`, {
    eventId: event.id,
    userId: event.userId,
    sequence: event.sequence,
  });

  io.to(roomName).emit('event:change', event);
}

/**
 * Broadcast multiple events (batch)
 */
export function broadcastEvents(events: RealtimeEvent[]) {
  events.forEach(event => broadcastEvent(event));
}

/**
 * Get event history for a project (for reconnections)
 */
export function getEventHistory(projectId: string, fromSequence?: number): RealtimeEvent[] {
  const log = eventLog.get(projectId) || [];

  if (fromSequence === undefined) {
    return log;
  }

  // Return only events after the specified sequence number
  return log.filter(event => event.sequence > fromSequence);
}

/**
 * Clear event history for a project
 */
export function clearEventHistory(projectId: string) {
  eventLog.delete(projectId);
}

/**
 * Get the latest sequence number for a project
 */
export function getLatestSequence(projectId: string): number {
  const log = eventLog.get(projectId) || [];
  if (log.length === 0) return 0;
  return log[log.length - 1].sequence;
}

/**
 * Create a standard change event
 */
export function createChangeEvent(
  type: string,
  projectId: string,
  userId: string,
  sequence: number,
  data: any,
  eventId?: string
): RealtimeEvent {
  return {
    id: eventId || `${Date.now()}-${Math.random()}`,
    type,
    projectId,
    userId,
    timestamp: Date.now(),
    sequence,
    data,
  };
}

export const RealtimeEventTypes = {
  // Node events
  NODE_ADD: 'node:add',
  NODE_UPDATE: 'node:update',
  NODE_DELETE: 'node:delete',

  // Edge events
  EDGE_ADD: 'edge:add',
  EDGE_UPDATE: 'edge:update',
  EDGE_DELETE: 'edge:delete',

  // Group events
  GROUP_ADD: 'group:add',
  GROUP_UPDATE: 'group:update',
  GROUP_DELETE: 'group:delete',
  NODE_MOVE_TO_GROUP: 'node:moveToGroup',

  // Project events
  PROJECT_UPDATE: 'project:update',

  // Sync events
  SYNC_REQUEST: 'sync:request',
  SYNC_RESPONSE: 'sync:response',
};
