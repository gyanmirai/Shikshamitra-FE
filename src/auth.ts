import { jwtDecode } from 'jwt-decode';
import { createHash } from 'node:crypto';
import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { refreshAccessToken } from './auth-token';
import { runAuthRequestOnce } from './auth-request';
import { AUTH_ERROR_CODE } from './constants/auth-errors';

class SchoolSignInError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

async function signInFn({
  email,
  password,
  organizationName,
}: {
  email: string;
  password: string;
  organizationName: string;
}) {
  const requestKey = createHash('sha256')
    .update(`${organizationName}\u0000${email}\u0000${password}`)
    .digest('base64url');

  return runAuthRequestOnce(requestKey, () =>
    requestPasswordToken({
      email,
      password,
      organizationName,
    })
  );
}

async function requestPasswordToken({
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
      ...(organizationName?.trim() ? { __tenant: organizationName.trim() } : {}),
    },
    body,
  }).catch(() => {
    throw new SchoolSignInError(AUTH_ERROR_CODE.authenticationUnavailable);
  });

  if (!resp.ok) {
    let apiError: string | undefined;
    try {
      const errorData = await resp.json();
      if (errorData?.errorCode === 'TENANT_INACTIVE')
        throw new SchoolSignInError('tenant-inactive');
      if (errorData?.errorCode === 'TENANT_NOT_FOUND') {
        throw new SchoolSignInError(AUTH_ERROR_CODE.invalidSchoolCode);
      }
      apiError = errorData?.error;
    } catch (error) {
      if (error instanceof CredentialsSignin) throw error;
      // ignore parse errors
    }
    if (resp.status === 400 && apiError === 'invalid_grant') {
      throw new SchoolSignInError(AUTH_ERROR_CODE.invalidCredentials);
    }
    throw new SchoolSignInError(AUTH_ERROR_CODE.authenticationUnavailable);
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
  trustHost: true,
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

      return refreshAccessToken(token);
    },

    async session({ session, token }: any) {
      session.user = token.user as {
        id: string;
        email: string;
      };

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.tokenType = token.tokenType as string;
      session.error = token.error;

      if (token.accessToken) {
        try {
          session.profile = jwtDecode(token.accessToken as string);
        } catch {
          session.profile = null;
        }
      } else {
        session.profile = null;
      }

      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
