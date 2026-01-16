import { getAccessToken } from '@/lib/stores/auth-store';
import type {
  WSMessage,
  WSMessageType,
  ChatMessagePayload,
  TypingPayload,
  JoinGroupPayload,
  LeaveGroupPayload,
} from '@/types/websocket';

// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// Message handler type
type MessageHandler<T = unknown> = (payload: T) => void;

// Configuration options
interface WebSocketConfig {
  maxReconnectAttempts?: number;
  baseReconnectDelay?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
}

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  maxReconnectAttempts: 5,
  baseReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
};

/**
 * PayNaiDee WebSocket Client
 * Handles real-time communication with the backend WebSocket server.
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Message handler registration (on/off pattern)
 * - JWT authentication
 * - Heartbeat to keep connection alive
 */
export class PayNaiDeeWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<WSMessageType, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private config: Required<WebSocketConfig>;
  private _connectionState: ConnectionState = 'disconnected';
  private stateChangeHandlers: Set<(state: ConnectionState) => void> = new Set();
  private manualDisconnect = false;

  constructor(config: WebSocketConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current connection state
   */
  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  /**
   * Check if WebSocket is connected
   */
  get isConnected(): boolean {
    return this._connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    this._connectionState = state;
    this.stateChangeHandlers.forEach((handler) => handler(state));
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateChangeHandlers.add(handler);
    return () => this.stateChangeHandlers.delete(handler);
  }

  /**
   * Connect to WebSocket server with JWT authentication
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Don't connect if already connected or connecting
      if (this._connectionState === 'connected' || this._connectionState === 'connecting') {
        resolve();
        return;
      }

      const token = getAccessToken();
      if (!token) {
        reject(new Error('No access token available'));
        return;
      }

      this.manualDisconnect = false;
      this.setConnectionState('connecting');

      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws?token=${encodeURIComponent(token)}`;
      
      try {
        this.ws = new WebSocket(wsUrl);
      } catch (error) {
        this.setConnectionState('disconnected');
        reject(error);
        return;
      }

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setConnectionState('connected');
        this.startHeartbeat();
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        if (this._connectionState === 'connecting') {
          reject(new Error('WebSocket connection failed'));
        }
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        this.setConnectionState('disconnected');
        
        // Only attempt reconnect if not manually disconnected
        if (!this.manualDisconnect && !event.wasClean) {
          this.attemptReconnect();
        }
      };
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.manualDisconnect = true;
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionState('disconnected');
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.manualDisconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.setConnectionState('disconnected');
      return;
    }

    this.setConnectionState('reconnecting');
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.config.maxReconnectDelay
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
        this.attemptReconnect();
      });
    }, delay);
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // Send a ping message to keep connection alive
        this.send('ping', {});
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);
      const handlers = this.handlers.get(message.type);
      
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message.payload);
          } catch (error) {
            console.error(`[WebSocket] Handler error for ${message.type}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  /**
   * Register a message handler for a specific message type
   * Returns an unsubscribe function
   */
  on<T = unknown>(type: WSMessageType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    const handlers = this.handlers.get(type)!;
    handlers.add(handler as MessageHandler);
    
    // Return unsubscribe function
    return () => this.off(type, handler);
  }

  /**
   * Unregister a message handler
   */
  off<T = unknown>(type: WSMessageType, handler: MessageHandler<T>): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler as MessageHandler);
    }
  }

  /**
   * Send a message through WebSocket
   */
  send<T>(type: string, payload: T): boolean {
    if (!this.isConnected) {
      console.warn('[WebSocket] Cannot send message: not connected');
      return false;
    }

    try {
      this.ws!.send(JSON.stringify({ type, payload }));
      return true;
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      return false;
    }
  }

  /**
   * Send a chat message to a group
   */
  sendMessage(groupId: number, content: string, metadata = ''): boolean {
    const payload: ChatMessagePayload = {
      group_id: groupId,
      content,
      metadata,
    };
    return this.send('chat_message', payload);
  }

  /**
   * Send typing indicator to a group
   */
  sendTyping(groupId: number, isTyping: boolean): boolean {
    const payload: TypingPayload = {
      group_id: groupId,
      is_typing: isTyping,
    };
    return this.send('typing', payload);
  }

  /**
   * Join a group chat room
   */
  joinGroup(groupId: number): boolean {
    const payload: JoinGroupPayload = {
      group_id: groupId,
    };
    return this.send('join_group', payload);
  }

  /**
   * Leave a group chat room
   */
  leaveGroup(groupId: number): boolean {
    const payload: LeaveGroupPayload = {
      group_id: groupId,
    };
    return this.send('leave_group', payload);
  }

  /**
   * Reset reconnection attempts (useful after successful operations)
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.disconnect();
    this.handlers.clear();
    this.stateChangeHandlers.clear();
  }
}

// Singleton instance for app-wide use
let wsInstance: PayNaiDeeWebSocket | null = null;

/**
 * Get or create the WebSocket singleton instance
 */
export function getWebSocketInstance(config?: WebSocketConfig): PayNaiDeeWebSocket {
  if (!wsInstance) {
    wsInstance = new PayNaiDeeWebSocket(config);
  }
  return wsInstance;
}

/**
 * Destroy the WebSocket singleton instance
 */
export function destroyWebSocketInstance(): void {
  if (wsInstance) {
    wsInstance.destroy();
    wsInstance = null;
  }
}
