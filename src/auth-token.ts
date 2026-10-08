import { runAuthRequestOnce } from './auth-request';

export const REFRESH_ACCESS_TOKEN_ERROR = 'RefreshAccessTokenError';

type AuthToken = Record<string, any> & {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: typeof REFRESH_ACCESS_TOKEN_ERROR;
  user?: {
    organizationName?: string;
  };
};

type TokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
};

const failedRefresh = (token: AuthToken): AuthToken => ({
  ...token,
  accessToken: undefined,
  expiresAt: 0,
  error: REFRESH_ACCESS_TOKEN_ERROR,
});

export async function refreshAccessToken(
  token: AuthToken,
  fetchToken: typeof fetch = fetch
): Promise<AuthToken> {
  const { refreshToken } = token;
  if (!refreshToken) {
    return failedRefresh(token);
  }

  return runAuthRequestOnce(`refresh:${refreshToken}`, () =>
    requestRefreshedAccessToken(token, refreshToken, fetchToken)
  );
}

async function requestRefreshedAccessToken(
  token: AuthToken,
  refreshToken: string,
  fetchToken: typeof fetch
): Promise<AuthToken> {
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
      client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
    });

    const response = await fetchToken(`${process.env.NEXT_PUBLIC_API_URL}/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(token.user?.organizationName?.trim()
          ? { __tenant: token.user.organizationName.trim() }
          : {}),
      },
      body,
    });

    if (!response.ok) {
      return failedRefresh(token);
    }

    const refreshed = (await response.json()) as TokenResponse;
    const expiresIn = Number(refreshed.expires_in);

    if (
      typeof refreshed.access_token !== 'string' ||
      !refreshed.access_token ||
      !Number.isFinite(expiresIn) ||
      expiresIn <= 0
    ) {
      return failedRefresh(token);
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken:
        typeof refreshed.refresh_token === 'string' && refreshed.refresh_token
          ? refreshed.refresh_token
          : refreshToken,
      tokenType:
        typeof refreshed.token_type === 'string' && refreshed.token_type
          ? refreshed.token_type
          : token.tokenType,
      expiresAt: Date.now() + expiresIn * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error('Refresh token failed', error);
    return failedRefresh(token);
  }
}
