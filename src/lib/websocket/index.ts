// WebSocket client exports
export {
  PayNaiDeeWebSocket,
  getWebSocketInstance,
  destroyWebSocketInstance,
  type ConnectionState,
} from './client';

// WebSocket type exports
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
  WebSocketConfig,
  WebSocketConnectionInfo,
  QueuedMessage,
  GroupPresence,
  UserPresence,
  ChatRoomState,
  WSEventHandlers,
  WSEventHandler,
} from './types';

// WebSocket hooks exports
export {
  useWebSocket,
  useChatWebSocket,
  useGroupPresence,
  usePaymentUpdates,
  useWebSocketErrors,
  useTypingIndicator,
} from './hooks';
