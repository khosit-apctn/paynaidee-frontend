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
  useCreateGroup,
  useUpdateGroup,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
} from './use-groups';

// Bills hooks
export {
  billKeys,
  useGroupBills,
  useBill,
  useCreateBill,
  useBillQR,
  useParticipantQR,
  useUpdatePaymentStatus,
} from './use-bills';

// Friends hooks
export {
  friendKeys,
  useFriends,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
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
