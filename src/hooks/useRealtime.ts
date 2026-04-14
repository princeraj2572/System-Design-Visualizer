import { useCallback, useEffect, useState } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';
import realtimeClient from '@/lib/realtime-client';
import { RealtimeUser, RealtimeEvent, CursorUpdate, NodeSelectionUpdate } from '@/types/realtime';

interface UseRealtimeParams {
  projectId: string;
  token: string;
  userId: string;
  enabled?: boolean;
}

export function useRealtime({
  projectId,
  token,
  userId,
  enabled = true,
}: UseRealtimeParams) {
  const [activeUsers, setActiveUsers] = useState<RealtimeUser[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorUpdate>>(new Map());
  const [selectedNodes, setSelectedNodes] = useState<Map<string, NodeSelectionUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const architectureStore = useArchitectureStore();

  // Initialize connection
  useEffect(() => {
    if (!enabled || !token) return;

    const initializeConnection = async () => {
      try {
        await realtimeClient.connect(token);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to realtime server:', error);
        setSyncError('Connection failed');
        setIsConnected(false);
      }
    };

    initializeConnection();

    return () => {
      realtimeClient.disconnect();
      setIsConnected(false);
    };
  }, [token, userId, enabled]);

  // Join project room
  useEffect(() => {
    if (!isConnected || !projectId) return;

    realtimeClient.joinProject(projectId);

    return () => {
      realtimeClient.leaveProject(projectId);
    };
  }, [isConnected, projectId]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers: Array<() => void> = [];

    // Listen for presence updates
    unsubscribers.push(
      realtimeClient.on('presence:update', (data: any) => {
        setActiveUsers(data.users);
        console.log(`Active users in project: ${data.totalUsers}`);
      })
    );

    // Listen for cursor updates
    unsubscribers.push(
      realtimeClient.on('cursor:update', (data: CursorUpdate) => {
        setRemoteCursors((prev) => {
          const next = new Map(prev);
          next.set(data.socketId, data);
          return next;
        });
      })
    );

    // Listen for node selection updates
    unsubscribers.push(
      realtimeClient.on('node:selected', (data: NodeSelectionUpdate) => {
        setSelectedNodes((prev) => {
          const next = new Map(prev);
          next.set(data.socketId, data);
          return next;
        });
      })
    );

    // Listen for real-time events
    unsubscribers.push(
      realtimeClient.on('event:change', (event: RealtimeEvent) => {
        handleRemoteEvent(event);
      })
    );

    // Listen for connection state changes
    unsubscribers.push(
      realtimeClient.on('connected', () => {
        console.log('Realtime connection established');
        setIsConnected(true);
        setSyncError(null);
      })
    );

    unsubscribers.push(
      realtimeClient.on('disconnected', () => {
        console.log('Realtime connection lost');
        setIsConnected(false);
      })
    );

    unsubscribers.push(
      realtimeClient.on('error', (error: any) => {
        console.error('Realtime error:', error);
        setSyncError(error.message || 'Connection error');
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isConnected]);

  // Handle remote events
  const handleRemoteEvent = useCallback(
    (event: RealtimeEvent) => {
      // Skip events from the current user
      if (event.userId === userId) return;

      const { type, data } = event;

      switch (type) {
        case 'node:add':
          // Add node if it doesn't exist
          if (data.node && !architectureStore.nodes.some((n) => n.id === data.node.id)) {
            architectureStore.addNode(data.node);
          }
          break;

        case 'node:update':
          if (data.node) {
            architectureStore.updateNode(data.node.id, data.node);
          }
          break;

        case 'node:delete':
          if (data.nodeId) {
            architectureStore.removeNode(data.nodeId);
          }
          break;

        case 'edge:add':
          if (data.edge && !architectureStore.edges.some((e) => e.id === data.edge.id)) {
            architectureStore.addEdge(data.edge);
          }
          break;

        case 'edge:update':
          if (data.edge) {
            architectureStore.updateEdge(data.edge.id, data.edge);
          }
          break;

        case 'edge:delete':
          if (data.edgeId) {
            architectureStore.removeEdge(data.edgeId);
          }
          break;

        case 'group:update':
          // Refresh project from server to get latest group state
          if (event.projectId === projectId) {
            console.log('Group updated by remote user, groups:', data.groupCount);
          }
          break;

        case 'project:update':
          console.log('Project updated by remote user');
          break;

        default:
          console.log(`Unhandled event type: ${type}`);
      }
    },
    [userId, projectId, architectureStore]
  );

  // Send cursor position
  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (isConnected) {
      realtimeClient.setCursorPosition(x, y);
    }
  }, [isConnected]);

  // Send node selection
  const sendNodeSelection = useCallback((nodeId?: string) => {
    if (isConnected) {
      realtimeClient.notifyNodeSelection(nodeId);
    }
  }, [isConnected]);

  // Sync with server
  const syncWithServer = useCallback(async (fromSequence?: number) => {
    try {
      setSyncError(null);
      const response = await realtimeClient.syncData(fromSequence);
      console.log(`Synced ${response.events.length} events. Latest sequence: ${response.latestSequence}`);
      return response;
    } catch (error: any) {
      const message = error.message || 'Sync failed';
      setSyncError(message);
      console.error('Sync error:', message);
      throw error;
    }
  }, []);

  return {
    isConnected,
    activeUsers,
    remoteCursors: Array.from(remoteCursors.values()),
    selectedNodes: Array.from(selectedNodes.values()),
    syncError,
    sendCursorPosition,
    sendNodeSelection,
    syncWithServer,
  };
}
