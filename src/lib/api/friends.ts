// Friends API endpoints for PayNaiDee

import { apiClient } from './client';
import type { SendFriendRequest } from '@/types/api';
import type { Friendship, User } from '@/types/models';

// Response types
interface FriendsListResponse {
  friends: User[];
}

interface FriendRequestsResponse {
  requests: Friendship[];
}

/**
 * Get the current user's friends list
 * @returns List of friends (accepted friendships)
 */
export async function getFriends(): Promise<User[]> {
  const response = await apiClient.get<FriendsListResponse>('/users/friends');
  return response.data.friends;
}

/**
 * Get pending friend requests (received)
 * @returns List of pending friend requests
 */
export async function getPendingRequests(): Promise<Friendship[]> {
  const response = await apiClient.get<FriendRequestsResponse>(
    '/users/friends/requests'
  );
  return response.data.requests;
}

/**
 * Get sent friend requests (outgoing)
 * @returns List of sent friend requests
 */
export async function getSentRequests(): Promise<Friendship[]> {
  const response = await apiClient.get<FriendRequestsResponse>(
    '/users/friends/sent'
  );
  return response.data.requests;
}

/**
 * Send a friend request to another user
 * @param data - Friend request data (addressee_id)
 * @returns Created friendship
 */
export async function sendFriendRequest(
  data: SendFriendRequest
): Promise<Friendship> {
  const response = await apiClient.post<Friendship>(
    '/users/friends/request',
    data
  );
  return response.data;
}


/**
 * Accept a friend request
 * @param friendshipId - Friendship ID
 * @returns Updated friendship
 */
export async function acceptFriendRequest(
  friendshipId: number
): Promise<Friendship> {
  const response = await apiClient.put<Friendship>(
    `/users/friends/${friendshipId}/accept`
  );
  return response.data;
}

/**
 * Reject a friend request
 * @param friendshipId - Friendship ID
 * @returns Updated friendship
 */
export async function rejectFriendRequest(
  friendshipId: number
): Promise<Friendship> {
  const response = await apiClient.put<Friendship>(
    `/users/friends/${friendshipId}/reject`
  );
  return response.data;
}

/**
 * Remove a friend (unfriend)
 * @param friendshipId - Friendship ID
 */
export async function removeFriend(friendshipId: number): Promise<void> {
  await apiClient.delete(`/users/friends/${friendshipId}`);
}

/**
 * Check friendship status with a user
 * @param userId - User ID to check
 * @returns Friendship if exists, null otherwise
 */
export async function getFriendshipStatus(
  userId: number
): Promise<Friendship | null> {
  try {
    const response = await apiClient.get<Friendship>(
      `/users/friends/status/${userId}`
    );
    return response.data;
  } catch {
    return null;
  }
}
