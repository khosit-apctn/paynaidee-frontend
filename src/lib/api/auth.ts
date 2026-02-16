// Authentication API endpoints for PayNaiDee

import { apiClient } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LoginResponse,
  AuthTokens,
} from '@/types/api';
import type { User } from '@/types/models';

/**
 * Login with username and password
 * @param credentials - Login credentials
 * @returns User data and tokens
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(
    '/auth/login',
    credentials,
    { skipAuth: true }
  );
}

/**
 * Register a new user account
 * @param data - Registration data
 * @returns User data and tokens
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(
    '/auth/register',
    data,
    { skipAuth: true }
  );
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - The refresh token
 * @returns New access and refresh tokens
 */
export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  const request: RefreshTokenRequest = { refresh_token: refreshToken };
  return apiClient.post<AuthTokens>(
    '/auth/refresh',
    request,
    { skipAuth: true }
  );
}

/**
 * Logout the current user
 * Note: This is primarily client-side token invalidation
 * The server endpoint is called for any server-side cleanup
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Ignore errors on logout - we'll clear tokens anyway
  }
}

/**
 * Get the current authenticated user's profile
 * @returns Current user data
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>('/users/profile');
}
