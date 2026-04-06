import NextAuth from 'next-auth';

export default NextAuth({
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
      wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
      authorization: { params: { scope: 'openid email profile' } },
      idToken: true,
      checks: ['pkce', 'state'],
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
