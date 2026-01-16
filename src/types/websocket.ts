// WebSocket message type definitions

// Base WebSocket message structure
export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
}

// All possible WebSocket message types
export type WSMessageType =
  | 'chat_message'
  | 'typing'
  | 'join_group'
  | 'leave_group'
  | 'payment_update'
  | 'bill_settled'
  | 'error'
  | 'connected'
  | 'disconnected';

// Chat message payload (sent and received)
export interface ChatMessagePayload {
  group_id: number;
  content: string;
  metadata?: string;
}

// Chat message received from server (includes sender info)
export interface ChatMessageReceived {
  id: number;
  group_id: number;
  sender_id: number;
  sender_username: string;
  sender_display_name: string;
  sender_avatar: string;
  content: string;
  type: 'text' | 'bill' | 'system';
  metadata: string;
  created_at: string;
}

// Typing indicator payload
export interface TypingPayload {
  group_id: number;
  is_typing: boolean;
}

// Typing indicator received from server
export interface TypingReceived {
  group_id: number;
  user_id: number;
  username: string;
  display_name: string;
  is_typing: boolean;
}

// Join/Leave group payloads
export interface JoinGroupPayload {
  group_id: number;
}

export interface LeaveGroupPayload {
  group_id: number;
}

// Payment update received from server
export interface PaymentUpdatePayload {
  bill_id: number;
  user_id: number;
  payment_status: 'pending' | 'paid';
  paid_at: string | null;
}

// Bill settled notification
export interface BillSettledPayload {
  bill_id: number;
  group_id: number;
  title: string;
  settled_at: string;
}

// Error payload from server
export interface WSErrorPayload {
  code: string;
  message: string;
}

// Connection status payload
export interface ConnectionPayload {
  user_id: number;
  connected_at: string;
}

// Type-safe message creators
export type OutgoingWSMessage =
  | WSMessage<ChatMessagePayload>
  | WSMessage<TypingPayload>
  | WSMessage<JoinGroupPayload>
  | WSMessage<LeaveGroupPayload>;

export type IncomingWSMessage =
  | WSMessage<ChatMessageReceived>
  | WSMessage<TypingReceived>
  | WSMessage<PaymentUpdatePayload>
  | WSMessage<BillSettledPayload>
  | WSMessage<WSErrorPayload>
  | WSMessage<ConnectionPayload>;
