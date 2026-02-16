import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGroupBills,
  getBill,
  createBill,
  updatePaymentStatus,
  getBillQR,
  getParticipantQR,
} from '@/lib/api/bills';
import type { CreateBillRequest, UpdatePaymentStatusRequest } from '@/types/api';

// Query keys for bills
export const billKeys = {
  all: ['bills'] as const,
  lists: () => [...billKeys.all, 'list'] as const,
  byGroup: (groupId: number) => [...billKeys.all, 'group', groupId] as const,
  detail: (id: number) => [...billKeys.all, 'detail', id] as const,
  qr: (billId: number, userId?: number) => [...billKeys.all, 'qr', billId, userId] as const,
};

/**
 * Hook to fetch bills for a group with pagination
 */
export function useGroupBills(groupId: number, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...billKeys.byGroup(groupId), { limit, offset }],
    queryFn: () => getGroupBills(groupId, { limit, offset }),
    enabled: !!groupId,
  });
}

/**
 * Hook to fetch a specific bill by ID
 */
export function useBill(id: number) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: () => getBill(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new bill in a group
 */
export function useCreateBill(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBillRequest) => createBill(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.byGroup(groupId) });
    },
  });
}

/**
 * Hook to get QR code data for a bill (POST — generates QR)
 */
export function useBillQR(billId: number) {
  return useMutation({
    mutationFn: () => getBillQR(billId),
  });
}

/**
 * Hook to get QR code data for a specific participant's payment (POST — generates QR)
 */
export function useParticipantQR(billId: number, userId: number) {
  return useMutation({
    mutationFn: () => getParticipantQR(billId, userId),
  });
}

/**
 * Hook to update payment status for a bill participant
 */
export function useUpdatePaymentStatus(billId: number, groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdatePaymentStatusRequest }) =>
      updatePaymentStatus(billId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) });
      queryClient.invalidateQueries({ queryKey: billKeys.byGroup(groupId) });
    },
  });
}
