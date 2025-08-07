import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// List of reserved paths that should not be treated as usernames
const RESERVED_PATHS = [
  'api',
  'profile',
  'events',
  'movies',
  'screenplays',
  'create',
  'discover',
  'invitations',
  'privacy-policy',
  'terms-of-service',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'admin',
  'auth',
  'login',
  'signup',
  'dashboard',
  'settings',
  'help',
  'about',
  'contact'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Extract the first segment of the path
  const firstSegment = pathname.split('/')[1];
  
  // If the first segment is a reserved path, continue normally
  if (RESERVED_PATHS.includes(firstSegment)) {
    return NextResponse.next();
  }

  // If we get here, this might be a username route
  // Let Next.js handle it with the [username] dynamic route
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
