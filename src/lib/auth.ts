import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oidc',
      issuer: 'https://accounts.google.com',
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      checks: ['state'],
    },
  ],
  trustHost: true,
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).role = ADMIN_EMAILS.includes(session.user.email.toLowerCase()) ? 'admin' : 'viewer';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
