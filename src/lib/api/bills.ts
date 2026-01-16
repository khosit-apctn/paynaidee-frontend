// Bills API endpoints for PayNaiDee

import { apiClient } from './client';
import type { CreateBillRequest, UpdatePaymentStatusRequest } from '@/types/api';
import type { Bill, QRCodeResponse } from '@/types/models';

// Response types
interface BillsListResponse {
  bills: Bill[];
  limit: number;
  offset: number;
}

// Pagination params
interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Get bills for a group
 * @param groupId - Group ID
 * @param params - Pagination parameters
 * @returns Paginated list of bills
 */
export async function getGroupBills(
  groupId: number,
  params: PaginationParams = {}
): Promise<BillsListResponse> {
  const queryParams = new URLSearchParams();
  if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
  if (params.offset !== undefined) queryParams.set('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/groups/${groupId}/bills${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<BillsListResponse>(endpoint);
  return response.data;
}

/**
 * Get a specific bill by ID
 * @param billId - Bill ID
 * @returns Bill details with participants
 */
export async function getBill(billId: number): Promise<Bill> {
  const response = await apiClient.get<Bill>(`/bills/${billId}`);
  return response.data;
}


/**
 * Create a new bill in a group
 * @param groupId - Group ID
 * @param data - Bill creation data
 * @returns Created bill
 */
export async function createBill(
  groupId: number,
  data: CreateBillRequest
): Promise<Bill> {
  const response = await apiClient.post<Bill>(`/groups/${groupId}/bills`, data);
  return response.data;
}

/**
 * Update a bill
 * @param billId - Bill ID
 * @param data - Bill update data
 * @returns Updated bill
 */
export async function updateBill(
  billId: number,
  data: Partial<CreateBillRequest>
): Promise<Bill> {
  const response = await apiClient.put<Bill>(`/bills/${billId}`, data);
  return response.data;
}

/**
 * Delete a bill
 * @param billId - Bill ID
 */
export async function deleteBill(billId: number): Promise<void> {
  await apiClient.delete(`/bills/${billId}`);
}

/**
 * Update payment status for a bill participant
 * @param billId - Bill ID
 * @param userId - User ID of the participant
 * @param data - Payment status update
 */
export async function updatePaymentStatus(
  billId: number,
  userId: number,
  data: UpdatePaymentStatusRequest
): Promise<void> {
  await apiClient.put(`/bills/${billId}/participants/${userId}/payment`, data);
}

/**
 * Get QR code data for a bill
 * @param billId - Bill ID
 * @returns QR code data
 */
export async function getBillQR(billId: number): Promise<QRCodeResponse> {
  const response = await apiClient.get<QRCodeResponse>(`/bills/${billId}/qr`);
  return response.data;
}

/**
 * Get QR code data for a specific participant's payment
 * @param billId - Bill ID
 * @param userId - User ID of the participant
 * @returns QR code data for the participant
 */
export async function getParticipantQR(
  billId: number,
  userId: number
): Promise<QRCodeResponse> {
  const response = await apiClient.get<QRCodeResponse>(
    `/bills/${billId}/participants/${userId}/qr`
  );
  return response.data;
}

/**
 * Mark a bill as settled
 * @param billId - Bill ID
 * @returns Updated bill
 */
export async function settleBill(billId: number): Promise<Bill> {
  const response = await apiClient.put<Bill>(`/bills/${billId}/settle`);
  return response.data;
}
