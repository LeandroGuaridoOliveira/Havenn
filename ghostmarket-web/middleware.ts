import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Server-Side Authentication
 * 
 * This middleware intercepts all requests to /admin routes and checks for
 * authentication token existence. Full JWT validation happens on the backend
 * API for each request.
 * 
 * This prevents:
 * - Content flashing for unauthenticated users
 * - Unauthorized data exposure
 * - Client-side authentication bypass
 */
export function middleware(request: NextRequest) {
    // Extract the authentication token from cookies
    const token = request.cookies.get('havenn_token')?.value;

    // If no token is found, redirect to login page
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token exists, allow the request to proceed
    // Full JWT validation will happen on backend API calls
    return NextResponse.next();
}

/**
 * Matcher configuration - specifies which routes this middleware applies to
 * Protects all /admin routes and their sub-paths
 */
export const config = {
    matcher: ['/admin', '/admin/:path*'],
};
