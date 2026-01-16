import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendshipStatus,
} from '@/lib/api/friends';
import type { SendFriendRequest } from '@/types/api';

// Query keys for friends
export const friendKeys = {
  all: ['friends'] as const,
  lists: () => [...friendKeys.all, 'list'] as const,
  requests: () => [...friendKeys.all, 'requests'] as const,
  pending: () => [...friendKeys.requests(), 'pending'] as const,
  sent: () => [...friendKeys.requests(), 'sent'] as const,
  status: (userId: number) => [...friendKeys.all, 'status', userId] as const,
};

/**
 * Hook to fetch the user's friends list
 */
export function useFriends() {
  return useQuery({
    queryKey: friendKeys.lists(),
    queryFn: getFriends,
  });
}

/**
 * Hook to fetch pending friend requests (received)
 */
export function useFriendRequests() {
  return useQuery({
    queryKey: friendKeys.pending(),
    queryFn: getPendingRequests,
  });
}

/**
 * Hook to fetch sent friend requests (outgoing)
 */
export function useSentFriendRequests() {
  return useQuery({
    queryKey: friendKeys.sent(),
    queryFn: getSentRequests,
  });
}

/**
 * Hook to check friendship status with a specific user
 */
export function useFriendshipStatus(userId: number) {
  return useQuery({
    queryKey: friendKeys.status(userId),
    queryFn: () => getFriendshipStatus(userId),
    enabled: !!userId,
  });
}


/**
 * Hook to send a friend request
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendFriendRequest) => sendFriendRequest(data),
    onSuccess: (_, variables) => {
      // Invalidate sent requests and status for the user
      queryClient.invalidateQueries({ queryKey: friendKeys.sent() });
      queryClient.invalidateQueries({ queryKey: friendKeys.status(variables.addressee_id) });
    },
  });
}

/**
 * Hook to accept a friend request
 */
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: number) => acceptFriendRequest(friendshipId),
    onSuccess: () => {
      // Invalidate friends list and pending requests
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
      queryClient.invalidateQueries({ queryKey: friendKeys.pending() });
    },
  });
}

/**
 * Hook to reject a friend request
 */
export function useRejectFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: number) => rejectFriendRequest(friendshipId),
    onSuccess: () => {
      // Invalidate pending requests
      queryClient.invalidateQueries({ queryKey: friendKeys.pending() });
    },
  });
}

/**
 * Hook to remove a friend (unfriend)
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: number) => removeFriend(friendshipId),
    onSuccess: () => {
      // Invalidate friends list
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
    },
  });
}
