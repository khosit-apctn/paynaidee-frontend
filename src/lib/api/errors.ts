// API Error handling utilities for PayNaiDee
// Maps error codes to i18n keys for localized error display

import { APIError } from './client';

// Error code to i18n key mapping
export const errorCodeToKey: Record<string, string> = {
  // Authentication errors (matches backend registry.go)
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  UNAUTHORIZED: 'errors.unauthorized',
  EXPIRED_TOKEN: 'errors.tokenExpired',
  INVALID_TOKEN: 'errors.tokenInvalid',
  INVALID_REFRESH_TOKEN: 'errors.refreshTokenExpired',

  // User errors
  USER_NOT_FOUND: 'errors.userNotFound',
  DUPLICATE_USERNAME: 'errors.usernameExists',
  DUPLICATE_EMAIL: 'errors.emailExists',

  // Group errors
  GROUP_NOT_FOUND: 'errors.groupNotFound',
  NOT_GROUP_MEMBER: 'errors.notGroupMember',
  INSUFFICIENT_PERMISSION: 'errors.notGroupAdmin',
  DUPLICATE_MEMBER: 'errors.alreadyMember',

  // Bill errors
  BILL_NOT_FOUND: 'errors.billNotFound',
  BILL_ALREADY_SETTLED: 'errors.billAlreadySettled',
  NOT_PARTICIPANT: 'errors.notBillParticipant',
  PAYMENT_ALREADY_CONFIRMED: 'errors.paymentAlreadyConfirmed',

  // Friendship errors
  DUPLICATE_FRIENDSHIP: 'errors.friendshipExists',
  FRIENDSHIP_NOT_FOUND: 'errors.friendshipNotFound',
  INVALID_FRIEND_REQUEST: 'errors.cannotFriendSelf',

  // Permission errors
  FORBIDDEN: 'errors.forbidden',

  // Validation errors
  VALIDATION_ERROR: 'errors.validation',
  INVALID_INPUT: 'errors.invalidInput',

  // Message errors
  EMPTY_MESSAGE: 'errors.emptyMessage',
  MESSAGE_TOO_LONG: 'errors.messageTooLong',
  MESSAGE_NOT_FOUND: 'errors.messageNotFound',

  // Resource errors
  NOT_FOUND: 'errors.notFound',
  DUPLICATE_RESOURCE: 'errors.duplicateResource',

  // Server errors
  INTERNAL_ERROR: 'errors.internalError',
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
    error.code === 'UNAUTHORIZED' ||
    error.code === 'EXPIRED_TOKEN' ||
    error.code === 'INVALID_TOKEN' ||
    error.code === 'INVALID_CREDENTIALS'
  );
}

/**
 * Check if an error is a permission/forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  if (!(error instanceof APIError)) return false;
  return (
    error.status === 403 ||
    error.code === 'FORBIDDEN' ||
    error.code === 'INSUFFICIENT_PERMISSION' ||
    error.code === 'NOT_GROUP_MEMBER'
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
