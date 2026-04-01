import NextAuth from 'next-auth';
import { jwtDecode } from 'jwt-decode';
import CredentialsProvider from 'next-auth/providers/credentials';

async function signInFn({
  email,
  password,
  organizationName,
}: {
  email: string;
  password: string;
  organizationName: string;
}) {
  const body = new URLSearchParams();
  body.append('grant_type', 'password');
  body.append('username', email as string);
  body.append('password', password as string);
  body.append('client_id', process.env.NEXT_PUBLIC_CLIENT_ID!);
  body.append('client_secret', process.env.NEXT_PUBLIC_CLIENT_SECRET!);
  body.append('scope', process.env.NEXT_PUBLIC_SCOPE!);

  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      __tenant: organizationName as string,
    },
    body,
  });

  if (!resp.ok) {
    let apiError: string | undefined;
    try {
      const errorData = await resp.json();
      apiError = errorData?.error;
    } catch {
      // ignore parse errors
    }
    if (apiError === 'invalid_grant') {
      throw new Error('INVALID_CREDENTIALS');
    }
    throw new Error('AUTH_FAILED');
  }

  const data = await resp.json();

  return {
    id: email as string,
    email,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    tokenType: data.token_type,
    expiresAt: Date.now() + data.expires_in * 1000,
    organizationName: organizationName as string,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        organizationName: { label: 'Organization', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        return signInFn({
          email: credentials.email as string,
          password: credentials.password as string,
          organizationName: credentials.organizationName as string,
        });
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          organizationName: user.organizationName,
        };
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tokenType = user.tokenType;
        token.expiresAt = user.expiresAt;

        return token;
      }
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      try {
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
          client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
          // scope: process.env.NEXT_PUBLIC_SCOPE!,
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connect/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            __tenant: token.user?.organizationName,
          },
          body,
        });

        const refreshed = await response.json();

        return {
          ...token,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? token.refreshToken,
          expiresAt: Date.now() + refreshed.expires_in * 1000,
        };
      } catch (error) {
        console.error('Refresh token failed', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },

    async session({ session, token }: any) {
      session.user = token.user as {
        id: string;
        email: string;
      };

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.tokenType = token.tokenType as string;

      try {
        session.profile = jwtDecode(token.accessToken as string);
      } catch {
        session.profile = null;
      }

      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
});
