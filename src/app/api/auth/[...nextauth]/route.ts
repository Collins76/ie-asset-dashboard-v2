import NextAuth from 'next-auth';

const handler = NextAuth({
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '',
      authorization: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
        params: {
          scope: 'openid email profile',
          response_type: 'code',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
      token: {
        url: 'https://oauth2.googleapis.com/token',
      },
      userinfo: {
        url: 'https://openidconnect.googleapis.com/v1/userinfo',
      },
      idToken: true,
      checks: ['state'],
      jwks_endpoint: 'https://www.googleapis.com/oauth2/v3/certs',
      issuer: 'https://accounts.google.com',
      profile(profile: { sub: string; name: string; email: string; picture: string }) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session }) {
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      if (session.user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).role = adminEmails.includes(session.user.email.toLowerCase()) ? 'admin' : 'viewer';
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
