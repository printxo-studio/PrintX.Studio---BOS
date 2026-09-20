import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass Next.js internal files, static assets, and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/invoice') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.webp')
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  let session = null;

  if (sessionCookie) {
    session = await verifySessionToken(sessionCookie);
  }

  const isLoginPage = pathname === '/login';

  // 3. If authenticated user tries to visit /login, redirect to dashboard
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. If unauthenticated user tries to visit protected route, redirect to /login
  if (!session && !isLoginPage) {
    // For API routes, return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
