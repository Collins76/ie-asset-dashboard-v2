import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If Google OAuth is configured, enforce auth
  const hasAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  if (hasAuth) {
    // Check for session cookie (next-auth)
    const sessionToken = request.cookies.get('next-auth.session-token') ||
                         request.cookies.get('__Secure-next-auth.session-token');
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isAuthApi = request.nextUrl.pathname.startsWith('/api/auth');
    const isPublicApi = request.nextUrl.pathname.startsWith('/api/data');

    if (!sessionToken && !isLoginPage && !isAuthApi && !isPublicApi) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.png|ie-logo\\.png).*)',
  ],
};
