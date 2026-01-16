/**
 * WebSocket type definitions for PayNaiDee
 * Re-exports and extends types from @/types/websocket
 */

// Re-export all types from the main websocket types file
export type {
  WSMessage,
  WSMessageType,
  ChatMessagePayload,
  ChatMessageReceived,
  TypingPayload,
  TypingReceived,
  JoinGroupPayload,
  LeaveGroupPayload,
  PaymentUpdatePayload,
  BillSettledPayload,
  WSErrorPayload,
  ConnectionPayload,
  OutgoingWSMessage,
  IncomingWSMessage,
} from '@/types/websocket';

// Import for use in this file
import type {
  WSMessageType,
  ChatMessageReceived,
  TypingReceived,
  PaymentUpdatePayload,
  BillSettledPayload,
  WSErrorPayload,
  ConnectionPayload,
} from '@/types/websocket';

/**
 * Connection state for the WebSocket client
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/**
 * WebSocket event handler types for type-safe event handling
 */
export interface WSEventHandlers {
  chat_message: (payload: ChatMessageReceived) => void;
  typing: (payload: TypingReceived) => void;
  join_group: (payload: { group_id: number; user_id: number }) => void;
  leave_group: (payload: { group_id: number; user_id: number }) => void;
  payment_update: (payload: PaymentUpdatePayload) => void;
  bill_settled: (payload: BillSettledPayload) => void;
  error: (payload: WSErrorPayload) => void;
  connected: (payload: ConnectionPayload) => void;
  disconnected: (payload: { reason: string }) => void;
}

/**
 * Type-safe handler registration
 */
export type WSEventHandler<T extends WSMessageType> = T extends keyof WSEventHandlers
  ? WSEventHandlers[T]
  : (payload: unknown) => void;

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  /** Maximum number of reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Base delay for reconnection in ms (default: 1000) */
  baseReconnectDelay?: number;
  /** Maximum delay for reconnection in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
}

/**
 * WebSocket connection info
 */
export interface WebSocketConnectionInfo {
  state: ConnectionState;
  reconnectAttempts: number;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
}

/**
 * Message queue item for offline message handling
 */
export interface QueuedMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

/**
 * Group presence info
 */
export interface GroupPresence {
  groupId: number;
  joinedAt: Date;
  lastActivity: Date;
}

/**
 * User presence in a group
 */
export interface UserPresence {
  userId: number;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date | null;
}

/**
 * Chat room state
 */
export interface ChatRoomState {
  groupId: number;
  isJoined: boolean;
  typingUsers: Map<number, { username: string; timestamp: number }>;
  onlineUsers: Map<number, UserPresence>;
}
