export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    // Protect dashboard and admin routes, skip API auth routes and static files
    '/((?!api/auth|login|_next/static|_next/image|favicon\\.png|ie-logo\\.png).*)',
  ],
};
