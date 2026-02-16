// API Client for PayNaiDee
// Handles HTTP requests with automatic JWT token injection and refresh

import type { APIResponse } from '@/types/api';
import { useI18n } from '@/lib/i18n/use-translation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// APIError class for structured error handling
export class APIError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'APIError';
  }
}

// Token management functions - will be connected to auth store
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let setTokens: (accessToken: string, refreshToken: string) => void = () => { };
let clearTokens: () => void = () => { };

// Initialize token functions from auth store
export function initializeTokenFunctions(fns: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}) {
  getAccessToken = fns.getAccessToken;
  getRefreshToken = fns.getRefreshToken;
  setTokens = fns.setTokens;
  clearTokens = fns.clearTokens;
}

// Refresh tokens using the refresh token
async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data) {
      setTokens(data.data.access_token, data.data.refresh_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}


// Request options type
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

class APIClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const { body, skipAuth, ...fetchOptions } = options;
    const token = skipAuth ? null : getAccessToken();

    const locale = useI18n.getState().locale;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 - attempt token refresh
    if (response.status === 401 && !skipAuth) {
      const refreshed = await this.handleTokenRefresh();
      if (refreshed) {
        // Retry the request with new token
        return this.request(endpoint, options);
      }
      // Refresh failed - clear tokens and redirect
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new APIError('ERR_UNAUTHORIZED', 'Session expired', 401);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.code || 'ERR_UNKNOWN',
        data.message || 'An error occurred',
        response.status
      );
    }

    return data;
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = refreshTokens();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL);

// Export for testing or custom instances
export { APIClient };
