// Friends API endpoints for PayNaiDee

import { apiClient } from './client';
import type { SendFriendRequest } from '@/types/api';
import type { Friendship, User } from '@/types/models';

/**
 * Get the current user's friends list
 * @returns List of friends (accepted friendships)
 */
export async function getFriends(): Promise<User[]> {
  return apiClient.get<User[]>('/users/friends');
}

/**
 * Send a friend request to another user
 * @param data - Friend request data (addressee_id)
 * @returns Created friendship
 */
export async function sendFriendRequest(
  data: SendFriendRequest
): Promise<Friendship> {
  return apiClient.post<Friendship>('/users/friends/request', data);
}

/**
 * Accept a friend request
 * @param friendshipId - Friendship ID
 * @returns Updated friendship
 */
export async function acceptFriendRequest(
  friendshipId: number
): Promise<Friendship> {
  return apiClient.post<Friendship>(
    `/users/friends/${friendshipId}/accept`,
    {}
  );
}

/**
 * Reject a friend request
 * @param friendshipId - Friendship ID
 * @returns Updated friendship
 */
export async function rejectFriendRequest(
  friendshipId: number
): Promise<Friendship> {
  return apiClient.post<Friendship>(
    `/users/friends/${friendshipId}/reject`,
    {}
  );
}
