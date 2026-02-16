// Groups API endpoints for PayNaiDee

import { apiClient } from './client';
import type {
  CreateGroupRequest,
  UpdateGroupRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
} from '@/types/api';
import type { Group } from '@/types/models';

/**
 * Get all groups the current user belongs to
 * @returns List of groups
 */
export async function getGroups(): Promise<Group[]> {
  return apiClient.get<Group[]>('/groups');
}

/**
 * Get a specific group by ID
 * @param groupId - Group ID
 * @returns Group details with members
 */
export async function getGroup(groupId: number): Promise<Group> {
  return apiClient.get<Group>(`/groups/${groupId}`);
}

/**
 * Create a new group
 * @param data - Group creation data
 * @returns Created group
 */
export async function createGroup(data: CreateGroupRequest): Promise<Group> {
  return apiClient.post<Group>('/groups', data);
}

/**
 * Update a group's information
 * @param groupId - Group ID
 * @param data - Update data
 * @returns Updated group
 */
export async function updateGroup(
  groupId: number,
  data: UpdateGroupRequest
): Promise<Group> {
  return apiClient.put<Group>(`/groups/${groupId}`, data);
}

/**
 * Add a member to a group
 * @param groupId - Group ID
 * @param data - Member data (user_id and role)
 */
export async function addMember(
  groupId: number,
  data: AddMemberRequest
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/members`, data);
}

/**
 * Update a member's role in a group
 * @param groupId - Group ID
 * @param userId - User ID of the member
 * @param data - New role data
 */
export async function updateMemberRole(
  groupId: number,
  userId: number,
  data: UpdateMemberRoleRequest
): Promise<void> {
  await apiClient.put(`/groups/${groupId}/members/${userId}`, data);
}

/**
 * Remove a member from a group
 * @param groupId - Group ID
 * @param userId - User ID of the member to remove
 */
export async function removeMember(
  groupId: number,
  userId: number
): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}
