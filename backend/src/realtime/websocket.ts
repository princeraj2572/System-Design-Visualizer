import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { setSocketIO, getEventHistory, getLatestSequence } from './realtimeService';

// Types for real-time events
export interface RealtimeUser {
  userId: string;
  username: string;
  cursor?: { x: number; y: number };
  selectedNodeId?: string;
  color: string;
}

export interface ProjectRoom {
  projectId: string;
  users: Map<string, RealtimeUser>;
  eventSequence: number;
}

// Store active project rooms
const activeRooms = new Map<string, ProjectRoom>();

// User color palette for presence
const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
let colorIndex = 0;

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Initialize realtime service with Socket.io instance
  setSocketIO(io);

  // Middleware: Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication failed: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      socket.data.userId = decoded.id;
      socket.data.username = decoded.username || 'Anonymous';
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    logger.info(`User ${socket.data.userId} connected with socket ${socket.id}`);

    // Join project room
    socket.on('project:join', (projectId: string) => {
      const roomName = `project-${projectId}`;
      socket.join(roomName);

      // Initialize or get project room
      if (!activeRooms.has(projectId)) {
        activeRooms.set(projectId, {
          projectId,
          users: new Map(),
          eventSequence: 0,
        });
      }

      const room = activeRooms.get(projectId)!;
      const userColor = userColors[colorIndex++ % userColors.length];

      // Add user to room
      const user: RealtimeUser = {
        userId: socket.data.userId,
        username: socket.data.username,
        color: userColor,
      };
      room.users.set(socket.id, user);

      logger.info(`User ${socket.data.username} joined project ${projectId}. Active users: ${room.users.size}`);

      // Broadcast presence update
      io.to(roomName).emit('presence:update', {
        users: Array.from(room.users.values()),
        totalUsers: room.users.size,
      });
    });

    // Leave project room
    socket.on('project:leave', (projectId: string) => {
      const roomName = `project-${projectId}`;
      const room = activeRooms.get(projectId);

      if (room) {
        room.users.delete(socket.id);
        logger.info(`User ${socket.data.username} left project ${projectId}. Active users: ${room.users.size}`);

        if (room.users.size === 0) {
          activeRooms.delete(projectId);
        } else {
          // Broadcast updated presence
          io.to(roomName).emit('presence:update', {
            users: Array.from(room.users.values()),
            totalUsers: room.users.size,
          });
        }
      }

      socket.leave(roomName);
    });

    // Cursor position tracking
    socket.on('cursor:move', (data: { projectId: string; x: number; y: number }) => {
      const roomName = `project-${data.projectId}`;
      const room = activeRooms.get(data.projectId);

      if (room) {
        const user = room.users.get(socket.id);
        if (user) {
          user.cursor = { x: data.x, y: data.y };
          socket.to(roomName).emit('cursor:update', {
            socketId: socket.id,
            username: user.username,
            cursor: user.cursor,
            color: user.color,
          });
        }
      }
    });

    // Node selection tracking
    socket.on('node:selected', (data: { projectId: string; nodeId?: string }) => {
      const roomName = `project-${data.projectId}`;
      const room = activeRooms.get(data.projectId);

      if (room) {
        const user = room.users.get(socket.id);
        if (user) {
          user.selectedNodeId = data.nodeId;
          socket.to(roomName).emit('node:selected', {
            socketId: socket.id,
            username: user.username,
            nodeId: data.nodeId,
            color: user.color,
          });
        }
      }
    });

    // Sync request: Get event history for reconnection/sync
    socket.on('sync:request', (data: { projectId: string; fromSequence?: number }, callback) => {
      const events = getEventHistory(data.projectId, data.fromSequence);
      const latestSequence = getLatestSequence(data.projectId);

      logger.info(`Sync requested for project ${data.projectId} from sequence ${data.fromSequence || 0}. Found ${events.length} events.`);

      callback({
        success: true,
        events,
        latestSequence,
        timestamp: Date.now(),
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      // Remove user from all rooms
      for (const [projectId, room] of activeRooms.entries()) {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          const roomName = `project-${projectId}`;

          if (room.users.size === 0) {
            activeRooms.delete(projectId);
          } else {
            io.to(roomName).emit('presence:update', {
              users: Array.from(room.users.values()),
              totalUsers: room.users.size,
            });
          }
        }
      }

      logger.info(`User ${socket.data.userId} disconnected`);
    });
  });

  return io;
}

export function getActiveRooms() {
  return activeRooms;
}

export function getProjectUsers(projectId: string): RealtimeUser[] {
  const room = activeRooms.get(projectId);
  return room ? Array.from(room.users.values()) : [];
}

export function incrementEventSequence(projectId: string): number {
  const room = activeRooms.get(projectId);
  if (!room) {
    const newRoom: ProjectRoom = {
      projectId,
      users: new Map(),
      eventSequence: 1,
    };
    activeRooms.set(projectId, newRoom);
    return 1;
  }
  return ++room.eventSequence;
}
