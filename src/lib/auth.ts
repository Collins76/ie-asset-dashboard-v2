import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).role = ADMIN_EMAILS.includes(session.user.email.toLowerCase()) ? 'admin' : 'viewer';
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      const isApiUpload = request.nextUrl.pathname.startsWith('/api/upload-data');

      if (isAdminRoute || isApiUpload) {
        if (!isLoggedIn) return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const role = (auth as any)?.role;
        return role === 'admin';
      }

      return isLoggedIn;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
