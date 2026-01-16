import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getMessages, sendMessage } from '@/lib/api/messages';
import { useChatStore } from '@/lib/stores/chat-store';

// Query keys for chat/messages
export const chatKeys = {
  all: ['chat'] as const,
  messages: (groupId: number) => [...chatKeys.all, 'messages', groupId] as const,
};

// Default page size for message pagination
const DEFAULT_MESSAGE_LIMIT = 50;

/**
 * Hook to fetch paginated messages for a group
 * Uses infinite query for loading older messages on scroll
 */
export function useMessages(groupId: number, limit = DEFAULT_MESSAGE_LIMIT) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(groupId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getMessages(groupId, { limit, offset: pageParam });
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // If we got fewer messages than the limit, there are no more pages
      if (lastPage.messages.length < limit) {
        return undefined;
      }
      // Next offset is current offset + number of messages received
      return lastPage.offset + lastPage.messages.length;
    },
    enabled: !!groupId,
    // Update chat store when data is fetched
    select: (data) => {
      // Flatten all pages into a single array of messages
      const allMessages = data.pages.flatMap((page) => page.messages);
      return {
        ...data,
        messages: allMessages,
      };
    },
  });
}

/**
 * Hook to send a message via REST API
 * Note: For real-time messaging, prefer using WebSocket via useChatWebSocket
 */
export function useSendMessage(groupId: number) {
  const queryClient = useQueryClient();
  const addMessage = useChatStore((state) => state.addMessage);

  return useMutation({
    mutationFn: (content: string) =>
      sendMessage(groupId, { content, type: 'text' }),
    onSuccess: (message) => {
      // Add message to chat store for immediate display
      addMessage(groupId, message);
      // Invalidate messages query to ensure consistency
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(groupId) });
    },
  });
}

/**
 * Hook to prefetch messages for a group
 * Useful for preloading chat data before navigation
 */
export function usePrefetchMessages(groupId: number) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchInfiniteQuery({
      queryKey: chatKeys.messages(groupId),
      queryFn: async () => {
        const response = await getMessages(groupId, { limit: DEFAULT_MESSAGE_LIMIT, offset: 0 });
        return response;
      },
      initialPageParam: 0,
    });
  };
}
