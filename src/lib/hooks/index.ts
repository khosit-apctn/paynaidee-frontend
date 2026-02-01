// Auth hooks
export {
  authKeys,
  useLogin,
  useRegister,
  useLogout,
} from './use-auth';

// Groups hooks
export {
  groupKeys,
  useGroups,
  useGroup,
  useGroupMembers,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
  useLeaveGroup,
} from './use-groups';

// Bills hooks
export {
  billKeys,
  useGroupBills,
  useBill,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  useBillQR,
  useParticipantQR,
  useUpdatePaymentStatus,
  useSettleBill,
} from './use-bills';

// Friends hooks
export {
  friendKeys,
  useFriends,
  useFriendRequests,
  useSentFriendRequests,
  useFriendshipStatus,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
} from './use-friends';

// Chat hooks
export {
  chatKeys,
  useMessages,
  useSendMessage,
  usePrefetchMessages,
} from './use-chat';

// Utility hooks
export { useClickOutside } from './use-click-outside';
