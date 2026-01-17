import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/'];

// Admin-only routes that require admin role
const adminRoutes = ['/admin'];

// Routes that authenticated users should be redirected away from
const authOnlyRoutes = ['/login', '/register'];

/**
 * Next.js Middleware for route protection
 * 
 * Features:
 * - JWT validation and expiration check
 * - Redirect to login with return URL for protected routes
 * - Role-based access control for admin routes
 * - Redirect authenticated users away from login/register pages
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies or authorization header
    const token = getTokenFromRequest(request);

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/api/')
    );

    // Check if the route is admin-only
    const isAdminRoute = adminRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    // Check if the route is for non-authenticated users only (login, register)
    const isAuthOnlyRoute = authOnlyRoutes.includes(pathname);

    // If no token, handle unauthenticated access
    if (!token) {
        // Allow access to public routes
        if (isPublicRoute) {
            return NextResponse.next();
        }

        // Redirect to login with return URL for protected routes
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Token exists, validate it
    const tokenPayload = parseJwtPayload(token);

    if (!tokenPayload) {
        // Invalid token format, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        // Clear the invalid token cookie
        response.cookies.delete('access_token');
        return response;
    }

    // Check if token is expired
    if (isTokenExpired(tokenPayload)) {
        // Token expired, redirect to login with return URL
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnUrl', pathname);
        loginUrl.searchParams.set('expired', 'true');

        const response = NextResponse.redirect(loginUrl);
        // Clear the expired token cookie
        response.cookies.delete('access_token');
        return response;
    }

    // Token is valid, check role-based access for admin routes
    if (isAdminRoute) {
        const userRole = tokenPayload.role;

        if (userRole !== 'admin') {
            // User doesn't have admin role, redirect to dashboard with error
            const dashboardUrl = new URL('/dashboard', request.url);
            dashboardUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // Authenticated users should be redirected away from login/register pages
    if (isAuthOnlyRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow access
    return NextResponse.next();
}

/**
 * Extract token from request (cookies or Authorization header)
 */
function getTokenFromRequest(request: NextRequest): string | null {
    // First, try to get from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Then, try to get from cookies
    const tokenCookie = request.cookies.get('access_token');
    if (tokenCookie?.value) {
        return tokenCookie.value;
    }

    // For client-side auth with Zustand, we need to check localStorage via a different approach
    // Since middleware runs on the edge, we can't access localStorage directly
    // The AuthProvider component handles client-side auth state
    // This middleware focuses on cookie-based token validation

    return null;
}

/**
 * Parse JWT payload without verification
 * Note: This only decodes the payload, it doesn't verify the signature
 * Signature verification should be done on the backend
 */
function parseJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode base64url encoded payload
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));

        return payload as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(payload: JwtPayload): boolean {
    if (!payload.exp) {
        return false; // No expiration claim
    }

    // exp is in seconds, Date.now() is in milliseconds
    // Add 30 second buffer to account for network latency
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const buffer = 30 * 1000;

    return currentTime >= (expirationTime - buffer);
}

/**
 * JWT Payload interface
 */
interface JwtPayload {
    sub?: string | number; // Subject (user ID)
    exp?: number; // Expiration time (Unix timestamp in seconds)
    iat?: number; // Issued at time
    role?: 'user' | 'admin'; // User role
    username?: string;
    email?: string;
}

/**
 * Middleware configuration
 * Define which routes the middleware should run on
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, fonts, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
    ],
};
