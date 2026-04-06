// Auth middleware — uncomment the line below once Google OAuth is configured
// export { auth as middleware } from '@/lib/auth';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Passthrough middleware until auth is configured
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|login|_next/static|_next/image|favicon\\.png|ie-logo\\.png).*)',
  ],
};
