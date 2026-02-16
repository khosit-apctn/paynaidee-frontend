import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  addMember,
  updateMemberRole,
  removeMember,
} from '@/lib/api/groups';
import type { CreateGroupRequest, UpdateGroupRequest, AddMemberRequest, UpdateMemberRoleRequest } from '@/types/api';

// Query keys for groups
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  detail: (id: number) => [...groupKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all groups the user belongs to
 */
export function useGroups() {
  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: getGroups,
  });
}

/**
 * Hook to fetch a specific group by ID
 */
export function useGroup(id: number) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => getGroup(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupRequest) => createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/**
 * Hook to update a group
 */
export function useUpdateGroup(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGroupRequest) => updateGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

/**
 * Hook to add a member to a group
 */
export function useAddMember(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberRequest) => addMember(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateMemberRoleRequest }) =>
      updateMemberRole(groupId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}

/**
 * Hook to remove a member from a group
 */
export function useRemoveMember(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
  });
}
