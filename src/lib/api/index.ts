// API exports for PayNaiDee

// Client and error handling
export { apiClient, APIClient, APIError, initializeTokenFunctions } from './client';
export {
  errorCodeToKey,
  getErrorMessage,
  isAPIError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
} from './errors';

// Auth API
export {
  login,
  register,
  refreshToken,
  logout,
  getCurrentUser,
} from './auth';

// Users API
export {
  getProfile,
  updateProfile,
  searchUsers,
  getUserById,
} from './users';

// Groups API
export {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addMember,
  updateMemberRole,
  removeMember,
  leaveGroup,
} from './groups';

// Bills API
export {
  getGroupBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  updatePaymentStatus,
  getBillQR,
  getParticipantQR,
  settleBill,
} from './bills';

// Messages API
export { getMessages, sendMessage } from './messages';

// Friends API
export {
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendshipStatus,
} from './friends';
