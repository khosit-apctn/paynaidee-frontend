// Users API endpoints for PayNaiDee

import { apiClient } from './client';
import type { UpdateProfileRequest, SearchUsersParams } from '@/types/api';
import type { User } from '@/types/models';

/**
 * Get the current user's profile
 * @returns User profile data
 */
export async function getProfile(): Promise<User> {
  return apiClient.get<User>('/users/profile');
}

/**
 * Update the current user's profile
 * @param data - Profile update data
 * @returns Updated user data
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return apiClient.put<User>('/users/profile', data);
}

/**
 * Search for users by username, email, or phone number
 * @param params - Search parameters
 * @returns List of matching users
 */
export async function searchUsers(params: SearchUsersParams): Promise<User[]> {
  const queryParams = new URLSearchParams();
  queryParams.set('q', params.query);
  if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
  if (params.offset !== undefined) queryParams.set('offset', params.offset.toString());

  return apiClient.get<User[]>(
    `/users/search?${queryParams.toString()}`
  );
}

/**
 * Get a user by ID
 * @param userId - User ID
 * @returns User data
 */
export async function getUserById(userId: number): Promise<User> {
  return apiClient.get<User>(`/users/${userId}`);
}
