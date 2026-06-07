import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/models';
import { initializeTokenFunctions } from '@/lib/api/client';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (userData: Partial<User>) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      // Set full auth state after login
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          document.cookie = `access_token=${accessToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      // Update tokens only (for refresh)
      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          document.cookie = `access_token=${accessToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        }
        set({
          accessToken,
          refreshToken,
        });
      },

      // Update user profile data
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // Clear all auth state on logout
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Mark store as hydrated from storage
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'paynaidee-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Helper functions for use outside of React components (e.g., API client)
export const getAccessToken = (): string | null => {
  return useAuthStore.getState().accessToken;
};

export const getRefreshToken = (): string | null => {
  return useAuthStore.getState().refreshToken;
};

export const clearTokens = (): void => {
  useAuthStore.getState().clearAuth();
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
};

// Helper to get current user
export const getCurrentUser = (): User | null => {
  return useAuthStore.getState().user;
};

// Initialize API client token functions to prevent authorization token issues
initializeTokenFunctions({
  getAccessToken,
  getRefreshToken,
  setTokens: (accessToken, refreshToken) => useAuthStore.getState().setTokens(accessToken, refreshToken),
  clearTokens,
});
