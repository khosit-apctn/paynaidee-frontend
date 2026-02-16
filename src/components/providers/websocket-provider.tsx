'use client';

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChatStore } from '@/lib/stores/chat-store';
import {
  PayNaiDeeWebSocket,
  getWebSocketInstance,
  destroyWebSocketInstance,
  type ConnectionState,
} from '@/lib/websocket/client';
import type {
  ChatMessageReceived,
  TypingReceived,
  PaymentUpdatePayload,
  BillSettledPayload,
} from '@/types/websocket';
import type { Message } from '@/types/models';

interface WebSocketContextValue {
  /** The WebSocket instance */
  ws: PayNaiDeeWebSocket | null;
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether the WebSocket is connected */
  isConnected: boolean;
  /** Manually connect to WebSocket */
  connect: () => Promise<void>;
  /** Manually disconnect from WebSocket */
  disconnect: () => void;
  /** Last error that occurred */
  lastError: Error | null;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  /** Auto-connect when authenticated (default: true) */
  autoConnect?: boolean;
  /** Enable global message handling (default: true) */
  enableGlobalHandlers?: boolean;
}

/**
 * WebSocket Provider Component
 * 
 * Manages the WebSocket connection lifecycle and provides context to child components.
 * Features:
 * - Auto-connect when user is authenticated
 * - Auto-disconnect on logout
 * - Global message handlers for chat and payment updates
 * - Connection state management
 */
export function WebSocketProvider({
  children,
  autoConnect = true,
  enableGlobalHandlers = true,
}: WebSocketProviderProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastError, setLastError] = useState<Error | null>(null);
  const wsRef = useRef<PayNaiDeeWebSocket | null>(null);

  // Auth state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Chat store actions
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const clearAllChats = useChatStore((state) => state.clearAllChats);

  // Initialize WebSocket instance
  useEffect(() => {
    wsRef.current = getWebSocketInstance();

    // Subscribe to connection state changes
    const unsubscribe = wsRef.current.onStateChange(setConnectionState);

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle chat message received
  const handleChatMessage = useCallback(
    (payload: ChatMessageReceived) => {
      const message: Message = {
        id: payload.id,
        group_id: payload.group_id,
        sender_id: payload.sender_id,
        content: payload.content,
        type: payload.type,
        metadata: payload.metadata,
        created_at: payload.created_at,
        sender: {
          id: payload.sender_id,
          username: payload.sender_username,
          display_name: payload.sender_display_name,
          avatar: payload.sender_avatar,
          email: '',
          phone_number: '',
          role: 'user',
          created_at: '',
        },
      };
      addMessage(payload.group_id, message);
    },
    [addMessage]
  );

  // Handle typing indicator received
  const handleTyping = useCallback(
    (payload: TypingReceived) => {
      setTyping(payload.group_id, payload.user_id, payload.username, payload.is_typing);
    },
    [setTyping]
  );

  // Handle payment update (can be extended to invalidate queries)
  const handlePaymentUpdate = useCallback((payload: PaymentUpdatePayload) => {
    console.log('[WebSocket] Payment update received:', payload);
    // This can be extended to invalidate TanStack Query caches
    // or dispatch to a payments store
  }, []);

  // Handle bill settled (can be extended to invalidate queries)
  const handleBillSettled = useCallback((payload: BillSettledPayload) => {
    console.log('[WebSocket] Bill settled:', payload);
    // This can be extended to invalidate TanStack Query caches
    // or show a notification
  }, []);

  // Set up global message handlers
  useEffect(() => {
    if (!enableGlobalHandlers || !wsRef.current) return;

    const ws = wsRef.current;
    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(ws.on('chat_message', handleChatMessage));
    unsubscribers.push(ws.on('typing', handleTyping));
    unsubscribers.push(ws.on('payment_update', handlePaymentUpdate));
    unsubscribers.push(ws.on('bill_settled', handleBillSettled));

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [enableGlobalHandlers, handleChatMessage, handleTyping, handlePaymentUpdate, handleBillSettled]);

  // Auto-connect when authenticated
  useEffect(() => {
    if (!autoConnect || !isHydrated || !wsRef.current) return;

    const ws = wsRef.current;

    if (isAuthenticated && ws.connectionState === 'disconnected') {
      ws.connect().catch((error) => {
        console.error('[WebSocketProvider] Auto-connect failed:', error);
        setLastError(error instanceof Error ? error : new Error(String(error)));
      });
    } else if (!isAuthenticated && ws.connectionState !== 'disconnected') {
      // Disconnect and clear chats on logout
      ws.disconnect();
      clearAllChats();
    }
  }, [autoConnect, isAuthenticated, isHydrated, clearAllChats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyWebSocketInstance();
    };
  }, []);

  // Manual connect function
  const connect = useCallback(async () => {
    if (!wsRef.current) {
      throw new Error('WebSocket not initialized');
    }

    setLastError(null);

    try {
      await wsRef.current.connect();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      throw err;
    }
  }, []);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    wsRef.current?.disconnect();
  }, []);

  const contextValue: WebSocketContextValue = {
    ws: wsRef.current,
    connectionState,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    lastError,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to access WebSocket context
 * Must be used within a WebSocketProvider
 */
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }

  return context;
}

/**
 * Hook to check if WebSocket is available (within provider)
 */
export function useWebSocketAvailable(): boolean {
  const context = useContext(WebSocketContext);
  return context !== null;
}
