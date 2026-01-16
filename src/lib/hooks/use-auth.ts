import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, register, logout } from '@/lib/api/auth';
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

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      // Store user and tokens in auth store
      setAuth(data.user, data.access_token, data.refresh_token);
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

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (data) => {
      // Store user and tokens in auth store
      setAuth(data.user, data.access_token, data.refresh_token);
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
