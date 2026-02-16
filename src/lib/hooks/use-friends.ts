import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from '@/lib/api/friends';
import type { SendFriendRequest } from '@/types/api';

// Query keys for friends
export const friendKeys = {
  all: ['friends'] as const,
  lists: () => [...friendKeys.all, 'list'] as const,
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
 * Hook to send a friend request
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendFriendRequest) => sendFriendRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: friendKeys.lists() });
    },
  });
}
