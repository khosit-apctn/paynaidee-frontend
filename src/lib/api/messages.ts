// Messages API endpoints for PayNaiDee

import { apiClient } from './client';
import type { GetMessagesParams } from '@/types/api';
import type { Message } from '@/types/models';

// Response types
interface MessagesResponse {
  messages: Message[];
  limit: number;
  offset: number;
}

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
 * @returns Paginated list of messages
 */
export async function getMessages(
  groupId: number,
  params: GetMessagesParams = {}
): Promise<MessagesResponse> {
  const queryParams = new URLSearchParams();
  if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
  if (params.offset !== undefined) queryParams.set('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/groups/${groupId}/messages${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<MessagesResponse>(endpoint);
  return response.data;
}

/**
 * Send a message to a group via REST API
 * Note: For real-time messaging, use WebSocket instead
 * @param groupId - Group ID
 * @param data - Message data
 * @returns Created message
 */
export async function sendMessage(
  groupId: number,
  data: SendMessageRequest
): Promise<Message> {
  const response = await apiClient.post<Message>(
    `/groups/${groupId}/messages`,
    data
  );
  return response.data;
}
