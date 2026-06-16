import { getSession } from 'next-auth/react';

type AuthSession = {
  accessToken?: string;
  profile?: {
    exp?: number | string;
  } | null;
};

const SESSION_CACHE_TTL_MS = 30_000;
const TOKEN_REFRESH_BUFFER_MS = 60_000;

let cachedSession: AuthSession | null | undefined;
let cacheExpiresAt = 0;
let pendingSession: Promise<AuthSession | null> | null = null;

const getTokenExpiresAt = (session: AuthSession | null) => {
  const exp = Number(session?.profile?.exp);

  if (!Number.isFinite(exp) || exp <= 0) {
    return null;
  }

  return exp * 1000;
};

const getCacheExpiresAt = (session: AuthSession | null) => {
  if (!session) {
    return 0;
  }

  const now = Date.now();
  const ttlExpiresAt = now + SESSION_CACHE_TTL_MS;
  const tokenExpiresAt = getTokenExpiresAt(session);

  if (!tokenExpiresAt) {
    return ttlExpiresAt;
  }

  return Math.min(ttlExpiresAt, Math.max(now, tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS));
};

export const clearCachedAuthSession = () => {
  cachedSession = undefined;
  cacheExpiresAt = 0;
  pendingSession = null;
};

export const getCachedAuthSession = async () => {
  const now = Date.now();

  if (cachedSession !== undefined && now < cacheExpiresAt) {
    return cachedSession;
  }

  if (pendingSession) {
    return pendingSession;
  }

  pendingSession = getSession()
    .then((session) => {
      cachedSession = session as AuthSession | null;
      cacheExpiresAt = getCacheExpiresAt(cachedSession);
      return cachedSession;
    })
    .catch((error) => {
      clearCachedAuthSession();
      throw error;
    })
    .finally(() => {
      pendingSession = null;
    });

  return pendingSession;
};
