// Groups API endpoints for PayNaiDee

import { apiClient } from './client';
import type {
  CreateGroupRequest,
  UpdateGroupRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
} from '@/types/api';
import type { Group, GroupMember } from '@/types/models';

// Response types
interface GroupsListResponse {
  groups: Group[];
}

interface GroupMembersResponse {
  members: GroupMember[];
}

/**
 * Get all groups the current user belongs to
 * @returns List of groups
 */
export async function getGroups(): Promise<Group[]> {
  const response = await apiClient.get<GroupsListResponse>('/groups');
  return response.data.groups;
}

/**
 * Get a specific group by ID
 * @param groupId - Group ID
 * @returns Group details with members
 */
export async function getGroup(groupId: number): Promise<Group> {
  const response = await apiClient.get<Group>(`/groups/${groupId}`);
  return response.data;
}

/**
 * Create a new group
 * @param data - Group creation data
 * @returns Created group
 */
export async function createGroup(data: CreateGroupRequest): Promise<Group> {
  const response = await apiClient.post<Group>('/groups', data);
  return response.data;
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
  const response = await apiClient.put<Group>(`/groups/${groupId}`, data);
  return response.data;
}

/**
 * Delete a group
 * @param groupId - Group ID
 */
export async function deleteGroup(groupId: number): Promise<void> {
  await apiClient.delete(`/groups/${groupId}`);
}

/**
 * Get members of a group
 * @param groupId - Group ID
 * @returns List of group members
 */
export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const response = await apiClient.get<GroupMembersResponse>(
    `/groups/${groupId}/members`
  );
  return response.data.members;
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
  await apiClient.put(`/groups/${groupId}/members/${userId}/role`, data);
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

/**
 * Leave a group (remove self)
 * @param groupId - Group ID
 */
export async function leaveGroup(groupId: number): Promise<void> {
  await apiClient.post(`/groups/${groupId}/leave`);
}
