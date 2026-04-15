/**
 * Real-time Collaboration Service
 * Manages WebSocket connections and state synchronization
 */

export interface CollaborativeAction {
  type: 'node_create' | 'node_update' | 'node_delete' | 'edge_create' | 'edge_delete';
  userId: string;
  userName: string;
  projectId: string;
  payload: any;
  timestamp: number;
  transactionId?: string;
}

export interface CollaborativeState {
  projectId: string;
  version: number;
  lastUpdate: number;
  participants: Map<string, ParticipantInfo>;
  operations: CollaborativeAction[];
}

export interface ParticipantInfo {
  userId: string;
  userName: string;
  cursorX?: number;
  cursorY?: number;
  selectedNodeId?: string;
  status: 'active' | 'idle' | 'offline';
  joinedAt: number;
  lastActivity: number;
}

export interface ConflictResolutionStrategy {
  strategy: 'last-write-wins' | 'operational-transform' | 'crdt';
  timestamp: number;
  userId: string;
}

export class RealtimeCollaborationService {
  private ws: WebSocket | null = null;
  private projectId: string;
  private userId: string;
  private userName: string;
  private state: CollaborativeState;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private operationQueue: CollaborativeAction[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(projectId: string, userId: string, userName: string) {
    this.projectId = projectId;
    this.userId = userId;
    this.userName = userName;
    this.state = {
      projectId,
      version: 0,
      lastUpdate: Date.now(),
      participants: new Map(),
      operations: [],
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Connected to collaboration server');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send join message
          this.send('join', {
            projectId: this.projectId,
            userId: this.userId,
            userName: this.userName,
            joinedAt: Date.now(),
          });

          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from collaboration server');
          this.isConnected = false;
          this.emit('disconnected');
          this.attemptReconnect(wsUrl);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: any): void {
    const { type, payload } = message;

    switch (type) {
      case 'state_sync':
        this.handleStateSync(payload);
        break;
      case 'operation':
        this.handleRemoteOperation(payload);
        break;
      case 'participant_joined':
        this.handleParticipantJoined(payload);
        break;
      case 'participant_left':
        this.handleParticipantLeft(payload);
        break;
      case 'cursor_move':
        this.handleCursorMove(payload);
        break;
      case 'error':
        this.emit('error', payload);
        break;
      default:
        console.warn('Unknown message type', type);
    }
  }

  /**
   * Handle state synchronization
   */
  private handleStateSync(state: CollaborativeState): void {
    this.state = state;
    this.emit('state_updated', this.state);
  }

  /**
   * Handle remote operation
   */
  private handleRemoteOperation(action: CollaborativeAction): void {
    this.state.operations.push(action);
    this.state.version++;
    this.state.lastUpdate = Date.now();

    // Apply operational transform or conflict resolution
    this.resolveConflicts(action);
    this.emit('operation', action);
  }

  /**
   * Handle participant joined
   */
  private handleParticipantJoined(participant: ParticipantInfo): void {
    this.state.participants.set(participant.userId, participant);
    this.emit('participant_joined', participant);
  }

  /**
   * Handle participant left
   */
  private handleParticipantLeft(userId: string): void {
    this.state.participants.delete(userId);
    this.emit('participant_left', userId);
  }

  /**
   * Handle cursor movement
   */
  private handleCursorMove(payload: {
    userId: string;
    x: number;
    y: number;
    selectedNodeId?: string;
  }): void {
    const participant = this.state.participants.get(payload.userId);
    if (participant) {
      participant.cursorX = payload.x;
      participant.cursorY = payload.y;
      participant.selectedNodeId = payload.selectedNodeId;
      participant.lastActivity = Date.now();
    }
    this.emit('cursor_moved', payload);
  }

  /**
   * Broadcast local operation
   */
  async broadcastOperation(action: Omit<CollaborativeAction, 'userId' | 'userName' | 'timestamp' | 'projectId'>): Promise<void> {
    const fullAction: CollaborativeAction = {
      ...action,
      userId: this.userId,
      userName: this.userName,
      projectId: this.projectId,
      timestamp: Date.now(),
    };

    this.operationQueue.push(fullAction);

    if (this.isConnected) {
      this.send('operation', fullAction);
    }
  }

  /**
   * Update cursor position
   */
  broadcastCursorMove(x: number, y: number, selectedNodeId?: string): void {
    if (this.isConnected) {
      this.send('cursor_move', { x, y, selectedNodeId });
    }
  }

  /**
   * Resolve conflicts between operations
   */
  private resolveConflicts(newOperation: CollaborativeAction): void {
    // Last-write-wins strategy
    const conflictingOps = this.state.operations.filter(
      (op) => op.type === newOperation.type && op.payload.id === newOperation.payload.id
    );

    if (conflictingOps.length > 1) {
      // Keep the operation with the latest timestamp
      conflictingOps.sort((a, b) => b.timestamp - a.timestamp);
      this.state.operations = this.state.operations.filter(
        (op) =>
          !(op.type === newOperation.type && op.payload.id === newOperation.payload.id) ||
          op === conflictingOps[0]
      );
    }
  }

  /**
   * Send message to server
   */
  private send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  /**
   * Attempt reconnection
   */
  private attemptReconnect(wsUrl: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
      console.log(`Attempting to reconnect in ${delay}ms...`);

      setTimeout(() => {
        this.connect(wsUrl).catch((error) => {
          console.error('Reconnection failed', error);
        });
      }, delay);
    } else {
      this.emit('max_reconnect_attempts_reached');
    }
  }

  /**
   * Register event listener
   */
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event
   */
  private emit(event: string, data?: any): void {
    this.eventListeners.get(event)?.forEach((callback) => callback(data));
  }

  /**
   * Get current state
   */
  getState(): CollaborativeState {
    return this.state;
  }

  /**
   * Get participant list
   */
  getParticipants(): ParticipantInfo[] {
    return Array.from(this.state.participants.values());
  }

  /**
   * Check connection status
   */
  isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}
