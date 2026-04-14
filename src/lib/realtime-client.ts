import io, { Socket } from 'socket.io-client';

class RealtimeClient {
  private socket: Socket | null = null;
  private projectId: string | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;

  /**
   * Initialize WebSocket connection
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        this.socket = io(serverUrl, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.isConnected = true;
          this.emit('connected');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
          this.isConnected = false;
          this.emit('disconnected');
        });

        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        });

        // Register event listeners
        this.registerEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Join a project room for real-time collaboration
   */
  joinProject(projectId: string): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.projectId = projectId;
    this.socket.emit('project:join', projectId);
    console.log(`Joined project room: ${projectId}`);
  }

  /**
   * Leave a project room
   */
  leaveProject(projectId: string): void {
    if (!this.socket) return;

    this.socket.emit('project:leave', projectId);
    this.projectId = null;
    console.log(`Left project room: ${projectId}`);
  }

  /**
   * Send cursor position
   */
  setCursorPosition(x: number, y: number): void {
    if (!this.socket || !this.projectId) return;

    this.socket.emit('cursor:move', {
      projectId: this.projectId,
      x,
      y,
    });
  }

  /**
   * Notify node selection
   */
  notifyNodeSelection(nodeId?: string): void {
    if (!this.socket || !this.projectId) return;

    this.socket.emit('node:selected', {
      projectId: this.projectId,
      nodeId,
    });
  }

  /**
   * Request sync data for catching up with missed events
   */
  syncData(fromSequence?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.projectId) {
        reject(new Error('Not connected or project not joined'));
        return;
      }

      this.socket.emit(
        'sync:request',
        {
          projectId: this.projectId,
          fromSequence,
        },
        (response: any) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Sync failed'));
          }
        }
      );
    });
  }

  /**
   * Register global event listeners
   */
  private registerEventListeners(): void {
    if (!this.socket) return;

    // Presence updates
    this.socket.on('presence:update', (data) => {
      this.emit('presence:update', data);
    });

    // Cursor updates
    this.socket.on('cursor:update', (data) => {
      this.emit('cursor:update', data);
    });

    // Node selection updates
    this.socket.on('node:selected', (data) => {
      this.emit('node:selected', data);
    });

    // Real-time events
    this.socket.on('event:change', (event) => {
      this.emit('event:change', event);
      // Also emit type-specific events
      this.emit(event.type, event);
    });
  }

  /**
   * Register event listener
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit local event
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current project ID
   */
  getProjectId(): string | null {
    return this.projectId;
  }
}

// Export singleton instance
export const realtimeClient = new RealtimeClient();
export default realtimeClient;
