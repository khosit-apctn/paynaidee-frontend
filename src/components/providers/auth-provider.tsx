'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { refreshToken as refreshTokenAPI } from '@/lib/api/auth';
import { Spinner } from '@/components/ui/spinner';

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider component handles authentication state initialization
 * and token restoration on app load.
 * 
 * Features:
 * - Token restoration from localStorage on app load
 * - Automatic token validation and refresh
 * - Loading state while auth is being initialized
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const { isHydrated, accessToken, refreshToken, setTokens, clearAuth } = useAuthStore();

    useEffect(() => {
        async function initializeAuth() {
            // Wait for Zustand to hydrate from localStorage
            if (!isHydrated) {
                return;
            }

            // If we have a refresh token, try to validate/refresh the access token
            if (refreshToken) {
                try {
                    // Check if access token exists and is valid
                    if (accessToken) {
                        // Optionally check JWT expiration here
                        const isExpired = isTokenExpired(accessToken);

                        if (isExpired) {
                            // Token is expired, try to refresh
                            const newTokens = await refreshTokenAPI(refreshToken);
                            setTokens(newTokens.access_token, newTokens.refresh_token);
                        }
                        // If not expired, we're good to go
                    } else {
                        // No access token but we have refresh token, try to get new tokens
                        const newTokens = await refreshTokenAPI(refreshToken);
                        setTokens(newTokens.access_token, newTokens.refresh_token);
                    }
                } catch (error) {
                    // Refresh failed, clear auth state
                    console.error('Token refresh failed during initialization:', error);
                    clearAuth();
                }
            }

            setIsInitialized(true);
        }

        initializeAuth();
    }, [isHydrated, accessToken, refreshToken, setTokens, clearAuth]);

    // Show loading state while auth is being initialized
    if (!isHydrated || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired
 */
function isTokenExpired(token: string): boolean {
    try {
        // JWT structure: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return true;
        }

        // Decode the payload (base64url encoded)
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        // Check expiration time (exp claim)
        if (!payload.exp) {
            return false; // No expiration claim, assume valid
        }

        // exp is in seconds, Date.now() is in milliseconds
        // Add 30 second buffer for network latency
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const buffer = 30 * 1000; // 30 seconds

        return currentTime >= (expirationTime - buffer);
    } catch (error) {
        // If we can't parse the token, assume it's invalid/expired
        console.error('Error parsing JWT token:', error);
        return true;
    }
}

/**
 * Get user role from JWT token
 * @param token - JWT token string
 * @returns user role or null if not found
 */
export function getUserRoleFromToken(token: string): 'user' | 'admin' | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.role || null;
    } catch {
        return null;
    }
}
