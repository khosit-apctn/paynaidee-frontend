import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, register, logout, getCurrentUser } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { LoginRequest, RegisterRequest } from '@/types/api';

// Query keys for auth-related queries
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Hook for user login
 * Handles authentication and token storage
 */
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: async (data) => {
      // Save tokens first so subsequent API calls are authenticated
      setTokens(data.access_token, data.refresh_token);

      // Backend may not return user — fetch it separately
      const user = data.user ?? await getCurrentUser();
      setAuth(user, data.access_token, data.refresh_token);

      // Redirect to dashboard
      router.push('/dashboard');
    },
  });
}

/**
 * Hook for user registration
 * Handles account creation and automatic login
 */
export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: async (data) => {
      // Save tokens first so subsequent API calls are authenticated
      setTokens(data.access_token, data.refresh_token);

      // Backend may not return user — fetch it separately
      const user = data.user ?? await getCurrentUser();
      setAuth(user, data.access_token, data.refresh_token);

      // Redirect to dashboard
      router.push('/dashboard');
    },
  });
}

/**
 * Hook for user logout
 * Clears auth state and invalidates queries
 */
export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Clear auth state
      clearAuth();
      // Clear all cached queries
      queryClient.clear();
      // Redirect to login
      router.push('/login');
    },
    onError: () => {
      // Even on error, clear local state and redirect
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });
}
