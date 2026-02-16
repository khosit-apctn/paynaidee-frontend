// Messages API endpoints for PayNaiDee

import { apiClient } from './client';
import type { GetMessagesParams } from '@/types/api';
import type { Message } from '@/types/models';

// Send message request
interface SendMessageRequest {
  content: string;
  type?: 'text' | 'bill' | 'system';
  metadata?: string;
}

/**
 * Get paginated messages for a group
 * @param groupId - Group ID
 * @param params - Pagination parameters
 * @returns List of messages
 */
export async function getMessages(
  groupId: number,
  params?: GetMessagesParams
): Promise<Message[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const url = `/groups/${groupId}/messages${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<Message[]>(url);
}

/**
 * Send a message to a group
 * @param groupId - Group ID
 * @param data - Message data
 * @returns Created message
 */
export async function sendMessage(
  groupId: number,
  data: SendMessageRequest
): Promise<Message> {
  return apiClient.post<Message>(`/groups/${groupId}/messages`, data);
}
