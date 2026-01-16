// API Error handling utilities for PayNaiDee
// Maps error codes to i18n keys for localized error display

import { APIError } from './client';

// Error code to i18n key mapping
export const errorCodeToKey: Record<string, string> = {
  // Authentication errors
  ERR_INVALID_CREDENTIALS: 'errors.invalidCredentials',
  ERR_UNAUTHORIZED: 'errors.unauthorized',
  ERR_TOKEN_EXPIRED: 'errors.tokenExpired',
  ERR_TOKEN_INVALID: 'errors.tokenInvalid',
  ERR_REFRESH_TOKEN_EXPIRED: 'errors.refreshTokenExpired',
  
  // User errors
  ERR_USER_NOT_FOUND: 'errors.userNotFound',
  ERR_USER_EXISTS: 'errors.userExists',
  ERR_EMAIL_EXISTS: 'errors.emailExists',
  ERR_USERNAME_EXISTS: 'errors.usernameExists',
  
  // Group errors
  ERR_GROUP_NOT_FOUND: 'errors.groupNotFound',
  ERR_NOT_GROUP_MEMBER: 'errors.notGroupMember',
  ERR_NOT_GROUP_ADMIN: 'errors.notGroupAdmin',
  ERR_ALREADY_MEMBER: 'errors.alreadyMember',
  ERR_CANNOT_REMOVE_SELF: 'errors.cannotRemoveSelf',
  ERR_LAST_ADMIN: 'errors.lastAdmin',
  
  // Bill errors
  ERR_BILL_NOT_FOUND: 'errors.billNotFound',
  ERR_INVALID_SPLIT_AMOUNT: 'errors.invalidSplitAmount',
  ERR_BILL_ALREADY_SETTLED: 'errors.billAlreadySettled',
  ERR_NOT_BILL_PARTICIPANT: 'errors.notBillParticipant',
  
  // Friendship errors
  ERR_FRIENDSHIP_EXISTS: 'errors.friendshipExists',
  ERR_FRIENDSHIP_NOT_FOUND: 'errors.friendshipNotFound',
  ERR_CANNOT_FRIEND_SELF: 'errors.cannotFriendSelf',
  ERR_FRIEND_REQUEST_PENDING: 'errors.friendRequestPending',
  
  // Permission errors
  ERR_FORBIDDEN: 'errors.forbidden',
  ERR_ACCESS_DENIED: 'errors.accessDenied',
  
  // Validation errors
  ERR_VALIDATION: 'errors.validation',
  ERR_INVALID_INPUT: 'errors.invalidInput',
  ERR_MISSING_FIELD: 'errors.missingField',
  
  // Server errors
  ERR_INTERNAL_ERROR: 'errors.internalError',
  ERR_SERVICE_UNAVAILABLE: 'errors.serviceUnavailable',
  ERR_NETWORK_ERROR: 'errors.networkError',
  
  // Generic
  ERR_UNKNOWN: 'errors.unknown',
};

// Translation function type
type TranslationFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Get a localized error message from an error
 * @param error - The error to get a message from
 * @param t - Translation function from i18n
 * @returns Localized error message string
 */
export function getErrorMessage(error: unknown, t: TranslationFn): string {
  if (error instanceof APIError) {
    const key = errorCodeToKey[error.code];
    if (key) {
      return t(key);
    }
    // Fallback to the error message if no i18n key found
    return error.message;
  }

  if (error instanceof Error) {
    // Check for network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      return t('errors.networkError');
    }
    return error.message;
  }

  return t('errors.unknown');
}

/**
 * Check if an error is an API error with a specific code
 * @param error - The error to check
 * @param code - The error code to match
 */
export function isAPIError(error: unknown, code?: string): error is APIError {
  if (!(error instanceof APIError)) return false;
  if (code) return error.code === code;
  return true;
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!(error instanceof APIError)) return false;
  return (
    error.status === 401 ||
    error.code === 'ERR_UNAUTHORIZED' ||
    error.code === 'ERR_TOKEN_EXPIRED' ||
    error.code === 'ERR_TOKEN_INVALID' ||
    error.code === 'ERR_INVALID_CREDENTIALS'
  );
}

/**
 * Check if an error is a permission/forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  if (!(error instanceof APIError)) return false;
  return (
    error.status === 403 ||
    error.code === 'ERR_FORBIDDEN' ||
    error.code === 'ERR_ACCESS_DENIED' ||
    error.code === 'ERR_NOT_GROUP_ADMIN' ||
    error.code === 'ERR_NOT_GROUP_MEMBER'
  );
}

/**
 * Check if an error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof APIError)) return false;
  return (
    error.status === 404 ||
    error.code.includes('NOT_FOUND')
  );
}

// Re-export APIError for convenience
export { APIError } from './client';
