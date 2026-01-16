// Users API endpoints for PayNaiDee

import { apiClient } from './client';
import type { UpdateProfileRequest, SearchUsersParams } from '@/types/api';
import type { User } from '@/types/models';

/**
 * Get the current user's profile
 * @returns User profile data
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}

/**
 * Update the current user's profile
 * @param data - Profile update data
 * @returns Updated user data
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.put<User>('/users/me', data);
  return response.data;
}

// Search users response type
interface SearchUsersResponse {
  users: User[];
  limit: number;
  offset: number;
}

/**
 * Search for users by username, email, or phone number
 * @param params - Search parameters
 * @returns Paginated list of users
 */
export async function searchUsers(params: SearchUsersParams): Promise<SearchUsersResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('q', params.query);
  if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
  if (params.offset !== undefined) queryParams.set('offset', params.offset.toString());

  const response = await apiClient.get<SearchUsersResponse>(
    `/users/search?${queryParams.toString()}`
  );
  return response.data;
}

/**
 * Get a user by ID
 * @param userId - User ID
 * @returns User data
 */
export async function getUserById(userId: number): Promise<User> {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
}
