export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    // Only protect admin routes — dashboard is publicly viewable
    '/admin/:path*',
  ],
};
