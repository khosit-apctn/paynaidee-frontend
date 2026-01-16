'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getWebSocketInstance, type ConnectionState } from './client';
import type {
  ChatMessageReceived,
  TypingReceived,
  PaymentUpdatePayload,
  BillSettledPayload,
  WSErrorPayload,
} from '@/types/websocket';
import type { Message } from '@/types/models';

/**
 * Hook to access the WebSocket instance and connection state
 */
export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const wsRef = useRef(getWebSocketInstance());

  useEffect(() => {
    const ws = wsRef.current;
    
    // Subscribe to connection state changes
    const unsubscribe = ws.onStateChange(setConnectionState);
    
    // Set initial state
    setConnectionState(ws.connectionState);

    return () => {
      unsubscribe();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn('[useWebSocket] Cannot connect: not authenticated');
      return;
    }
    
    try {
      await wsRef.current.connect();
    } catch (error) {
      console.error('[useWebSocket] Connection failed:', error);
      throw error;
    }
  }, [isAuthenticated]);

  const disconnect = useCallback(() => {
    wsRef.current.disconnect();
  }, []);

  return {
    ws: wsRef.current,
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isReconnecting: connectionState === 'reconnecting',
    connect,
    disconnect,
  };
}

/**
 * Hook to handle chat messages via WebSocket
 * Automatically integrates with the chat store
 */
export function useChatWebSocket(groupId: number | null) {
  const { ws, isConnected } = useWebSocket();
  const addMessage = useChatStore((state) => state.addMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Handle incoming chat messages
  useEffect(() => {
    if (!groupId || !isConnected) return;

    const handleChatMessage = (payload: ChatMessageReceived) => {
      // Only process messages for the current group
      if (payload.group_id !== groupId) return;

      // Convert to Message type for the store
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
          updated_at: '',
        },
      };

      addMessage(groupId, message);
    };

    const unsubscribe = ws.on('chat_message', handleChatMessage);
    return () => {
      unsubscribe();
    };
  }, [ws, groupId, isConnected, addMessage]);

  // Handle typing indicators
  useEffect(() => {
    if (!groupId || !isConnected) return;

    const handleTyping = (payload: TypingReceived) => {
      // Only process typing for the current group
      if (payload.group_id !== groupId) return;
      
      // Don't show typing indicator for current user
      if (payload.user_id === currentUserId) return;

      setTyping(groupId, payload.user_id, payload.username, payload.is_typing);
    };

    const unsubscribe = ws.on('typing', handleTyping);
    return () => {
      unsubscribe();
    };
  }, [ws, groupId, isConnected, currentUserId, setTyping]);

  // Send message function
  const sendMessage = useCallback(
    (content: string, metadata = '') => {
      if (!groupId || !isConnected) return false;
      return ws.sendMessage(groupId, content, metadata);
    },
    [ws, groupId, isConnected]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!groupId || !isConnected) return false;
      return ws.sendTyping(groupId, isTyping);
    },
    [ws, groupId, isConnected]
  );

  return {
    sendMessage,
    sendTyping,
    isConnected,
  };
}

/**
 * Hook to manage group presence (join/leave)
 */
export function useGroupPresence(groupId: number | null) {
  const { ws, isConnected } = useWebSocket();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!groupId || !isConnected) return;

    // Join the group when connected
    if (!joinedRef.current) {
      ws.joinGroup(groupId);
      joinedRef.current = true;
    }

    // Leave the group on cleanup
    return () => {
      if (joinedRef.current) {
        ws.leaveGroup(groupId);
        joinedRef.current = false;
      }
    };
  }, [ws, groupId, isConnected]);

  const joinGroup = useCallback(() => {
    if (!groupId || !isConnected || joinedRef.current) return;
    ws.joinGroup(groupId);
    joinedRef.current = true;
  }, [ws, groupId, isConnected]);

  const leaveGroup = useCallback(() => {
    if (!groupId || !isConnected || !joinedRef.current) return;
    ws.leaveGroup(groupId);
    joinedRef.current = false;
  }, [ws, groupId, isConnected]);

  return {
    isJoined: joinedRef.current,
    joinGroup,
    leaveGroup,
  };
}

/**
 * Hook to listen for payment updates via WebSocket
 */
export function usePaymentUpdates(
  onPaymentUpdate?: (payload: PaymentUpdatePayload) => void,
  onBillSettled?: (payload: BillSettledPayload) => void
) {
  const { ws, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers: (() => void)[] = [];

    if (onPaymentUpdate) {
      unsubscribers.push(ws.on('payment_update', onPaymentUpdate));
    }

    if (onBillSettled) {
      unsubscribers.push(ws.on('bill_settled', onBillSettled));
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [ws, isConnected, onPaymentUpdate, onBillSettled]);
}

/**
 * Hook to listen for WebSocket errors
 */
export function useWebSocketErrors(onError?: (payload: WSErrorPayload) => void) {
  const { ws, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected || !onError) return;

    const unsubscribe = ws.on('error', onError);
    return () => {
      unsubscribe();
    };
  }, [ws, isConnected, onError]);
}

/**
 * Hook for debounced typing indicator
 * Automatically sends typing: false after a delay
 */
export function useTypingIndicator(groupId: number | null, debounceMs = 2000) {
  const { sendTyping, isConnected } = useChatWebSocket(groupId);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!isConnected || !groupId) return;

    // Send typing: true if not already typing
    if (!isTypingRef.current) {
      sendTyping(true);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        sendTyping(false);
        isTypingRef.current = false;
      }
    }, debounceMs);
  }, [sendTyping, isConnected, groupId, debounceMs]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      sendTyping(false);
      isTypingRef.current = false;
    }
  }, [sendTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    startTyping,
    stopTyping,
  };
}
