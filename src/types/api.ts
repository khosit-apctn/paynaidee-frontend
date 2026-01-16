// API response and request type interfaces

export interface APIResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  offset: number;
  page: number;
}

// Auth request types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  display_name?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Auth response types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: import('./models').User;
  access_token: string;
  refresh_token: string;
}

// Group request types
export interface CreateGroupRequest {
  name: string;
  avatar?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  avatar?: string;
}

export interface AddMemberRequest {
  user_id: number;
  role: 'admin' | 'member';
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member';
}

// Bill request types
export interface CreateBillRequest {
  title: string;
  description?: string;
  total_amount: number;
  service_charge?: number;
  split_type: 'equal' | 'custom';
  qr_header?: string;
  participants: BillParticipantInput[];
}

export interface BillParticipantInput {
  user_id: number;
  amount?: number;
}

export interface UpdatePaymentStatusRequest {
  status: 'paid' | 'pending';
}

// Friend request types
export interface SendFriendRequest {
  addressee_id: number;
}

export interface RespondFriendRequest {
  status: 'accepted' | 'rejected';
}

// User request types
export interface UpdateProfileRequest {
  display_name?: string;
  avatar?: string;
  phone_number?: string;
}

export interface SearchUsersParams {
  query: string;
  limit?: number;
  offset?: number;
}

// Message request types
export interface GetMessagesParams {
  limit?: number;
  offset?: number;
}
