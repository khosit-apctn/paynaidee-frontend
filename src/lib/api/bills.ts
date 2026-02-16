// Bills API endpoints for PayNaiDee

import { apiClient } from './client';
import type { CreateBillRequest, UpdatePaymentStatusRequest } from '@/types/api';
import type { Bill, QRCodeResponse } from '@/types/models';

// Pagination params
interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Get bills for a group
 * @param groupId - Group ID
 * @param params - Pagination parameters
 * @returns List of bills
 */
export async function getGroupBills(
  groupId: number,
  params?: PaginationParams
): Promise<Bill[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const url = `/groups/${groupId}/bills${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<Bill[]>(url);
}

/**
 * Get a specific bill by ID
 * @param billId - Bill ID
 * @returns Bill details
 */
export async function getBill(billId: number): Promise<Bill> {
  return apiClient.get<Bill>(`/bills/${billId}`);
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
  return apiClient.post<Bill>(`/groups/${groupId}/bills`, data);
}

/**
 * Update the payment status for a bill participant
 * @param billId - Bill ID
 * @param userId - User ID of the participant
 * @param data - Payment status update data
 */
export async function updatePaymentStatus(
  billId: number,
  userId: number,
  data: UpdatePaymentStatusRequest
): Promise<void> {
  await apiClient.put(
    `/bills/${billId}/participants/${userId}/status`,
    data
  );
}

/**
 * Generate QR code for a bill (bill creator's QR)
 * @param billId - Bill ID
 * @returns QR code data
 */
export async function getBillQR(billId: number): Promise<QRCodeResponse> {
  return apiClient.post<QRCodeResponse>(`/bills/${billId}/qr`, {});
}

/**
 * Generate QR code for a specific participant's payment
 * @param billId - Bill ID
 * @param userId - Participant user ID
 * @returns QR code data
 */
export async function getParticipantQR(
  billId: number,
  userId: number
): Promise<QRCodeResponse> {
  return apiClient.post<QRCodeResponse>(
    `/bills/${billId}/participants/${userId}/qr`,
    {}
  );
}
