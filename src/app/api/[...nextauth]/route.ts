import type { JWT } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials, req) {
        return null;
      },
    }),
  ],
  // site: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  session: {
    strategy: 'jwt',
    maxAge: 1 * 3 * 60 * 60, // 3 hrs
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin',
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
