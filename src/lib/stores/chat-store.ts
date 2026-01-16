import { create } from 'zustand';
import type { Message } from '@/types/models';

interface TypingUser {
  userId: number;
  username: string;
  groupId: number;
  timestamp: number;
}

interface ChatState {
  // State - using Map for efficient groupId-based lookups
  messages: Map<number, Message[]>;
  typingUsers: TypingUser[];

  // Actions
  addMessage: (groupId: number, message: Message) => void;
  setMessages: (groupId: number, messages: Message[]) => void;
  prependMessages: (groupId: number, messages: Message[]) => void;
  setTyping: (groupId: number, userId: number, username: string, isTyping: boolean) => void;
  clearChat: (groupId: number) => void;
  clearAllChats: () => void;
  getMessages: (groupId: number) => Message[];
  getTypingUsers: (groupId: number) => TypingUser[];
}

// Typing indicator timeout (5 seconds)
const TYPING_TIMEOUT = 5000;

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: new Map(),
  typingUsers: [],

  // Add a single message to a group's chat (for real-time messages)
  addMessage: (groupId, message) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      const groupMessages = newMessages.get(groupId) || [];
      
      // Avoid duplicates by checking message ID
      if (groupMessages.some((m) => m.id === message.id)) {
        return state;
      }
      
      newMessages.set(groupId, [...groupMessages, message]);
      return { messages: newMessages };
    }),

  // Set messages for a group (replaces existing)
  setMessages: (groupId, messages) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      newMessages.set(groupId, messages);
      return { messages: newMessages };
    }),

  // Prepend older messages (for pagination/infinite scroll)
  prependMessages: (groupId, messages) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      const existing = newMessages.get(groupId) || [];
      
      // Filter out any duplicates
      const existingIds = new Set(existing.map((m) => m.id));
      const uniqueNewMessages = messages.filter((m) => !existingIds.has(m.id));
      
      newMessages.set(groupId, [...uniqueNewMessages, ...existing]);
      return { messages: newMessages };
    }),

  // Set typing status for a user in a group
  setTyping: (groupId, userId, username, isTyping) =>
    set((state) => {
      // Remove existing typing entry for this user in this group
      const filtered = state.typingUsers.filter(
        (t) => !(t.groupId === groupId && t.userId === userId)
      );

      if (isTyping) {
        // Add new typing entry with timestamp
        return {
          typingUsers: [
            ...filtered,
            { groupId, userId, username, timestamp: Date.now() },
          ],
        };
      }

      return { typingUsers: filtered };
    }),

  // Clear chat for a specific group
  clearChat: (groupId) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      newMessages.delete(groupId);
      
      // Also clear typing users for this group
      const filteredTyping = state.typingUsers.filter(
        (t) => t.groupId !== groupId
      );
      
      return { 
        messages: newMessages,
        typingUsers: filteredTyping,
      };
    }),

  // Clear all chats (e.g., on logout)
  clearAllChats: () =>
    set({
      messages: new Map(),
      typingUsers: [],
    }),

  // Get messages for a specific group
  getMessages: (groupId) => {
    return get().messages.get(groupId) || [];
  },

  // Get typing users for a specific group (excluding stale entries)
  getTypingUsers: (groupId) => {
    const now = Date.now();
    return get().typingUsers.filter(
      (t) => t.groupId === groupId && now - t.timestamp < TYPING_TIMEOUT
    );
  },
}));

// Helper function to clean up stale typing indicators
export const cleanupStaleTypingIndicators = (): void => {
  const state = useChatStore.getState();
  const now = Date.now();
  const activeTyping = state.typingUsers.filter(
    (t) => now - t.timestamp < TYPING_TIMEOUT
  );
  
  if (activeTyping.length !== state.typingUsers.length) {
    useChatStore.setState({ typingUsers: activeTyping });
  }
};
