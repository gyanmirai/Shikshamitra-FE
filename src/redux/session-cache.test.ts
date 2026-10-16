import { getSession } from 'next-auth/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import {
  getCachedAuthSession,
  clearCachedAuthSession,
  isAuthSessionCacheCurrent,
  getAuthSessionCacheRevision,
} from './session-cache';

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

const mockedGetSession = vi.mocked(getSession);

const buildSession = (secondsUntilExpiry = 3600) =>
  ({
    accessToken: `token-${secondsUntilExpiry}`,
    profile: {
      exp: Math.floor(Date.now() / 1000) + secondsUntilExpiry,
    },
  }) as any;

describe('session cache', () => {
  it('does not restore the previous account after logout or an identity change', async () => {
    let resolveOld!: (value: ReturnType<typeof buildSession>) => void;
    mockedGetSession.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      })
    );
    const oldRequest = getCachedAuthSession();
    clearCachedAuthSession();
    const current = buildSession(7200);
    mockedGetSession.mockResolvedValueOnce(current);
    await expect(getCachedAuthSession()).resolves.toBe(current);
    resolveOld(buildSession());
    await expect(oldRequest).resolves.toBeNull();
    await expect(getCachedAuthSession()).resolves.toBe(current);
    expect(mockedGetSession).toHaveBeenCalledTimes(2);
  });
  beforeEach(() => {
    clearCachedAuthSession();
    mockedGetSession.mockReset();
  });

  it('shares one in-flight session request across concurrent callers', async () => {
    const session = buildSession();
    let resolveSession!: (value: any) => void;

    mockedGetSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }) as any
    );

    const first = getCachedAuthSession();
    const second = getCachedAuthSession();

    expect(mockedGetSession).toHaveBeenCalledTimes(1);

    resolveSession(session);

    await expect(Promise.all([first, second])).resolves.toEqual([session, session]);
  });

  it('reuses a fresh cached session for follow-up API calls', async () => {
    const session = buildSession();

    mockedGetSession.mockResolvedValue(session);

    await expect(getCachedAuthSession()).resolves.toBe(session);
    await expect(getCachedAuthSession()).resolves.toBe(session);

    expect(mockedGetSession).toHaveBeenCalledTimes(1);
  });

  it('does not cache a token that is already inside the refresh buffer', async () => {
    mockedGetSession
      .mockResolvedValueOnce(buildSession(30))
      .mockResolvedValueOnce(buildSession(3600));

    await getCachedAuthSession();
    await getCachedAuthSession();

    expect(mockedGetSession).toHaveBeenCalledTimes(2);
  });

  it('does not let an old rejected lookup clear the replacement account session', async () => {
    let rejectOld!: (error: Error) => void;
    mockedGetSession.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectOld = reject;
      })
    );
    const oldRequest = getCachedAuthSession();
    const oldFailure = expect(oldRequest).rejects.toThrow('Old session lookup failed');
    clearCachedAuthSession();
    const current = buildSession(7200);
    mockedGetSession.mockResolvedValueOnce(current);
    await getCachedAuthSession();
    const currentRevision = getAuthSessionCacheRevision();

    rejectOld(new Error('Old session lookup failed'));
    await oldFailure;

    expect(isAuthSessionCacheCurrent(currentRevision, current.accessToken)).toBe(true);
    await expect(getCachedAuthSession()).resolves.toBe(current);
    expect(mockedGetSession).toHaveBeenCalledTimes(2);
  });

  it('invalidates request ownership even when the replacement session has the same token', async () => {
    const current = buildSession();
    mockedGetSession.mockResolvedValue(current);
    await getCachedAuthSession();
    const oldRevision = getAuthSessionCacheRevision();
    expect(isAuthSessionCacheCurrent(oldRevision, current.accessToken)).toBe(true);

    clearCachedAuthSession();
    await getCachedAuthSession();

    expect(isAuthSessionCacheCurrent(oldRevision, current.accessToken)).toBe(false);
    expect(isAuthSessionCacheCurrent(getAuthSessionCacheRevision(), current.accessToken)).toBe(
      true
    );
  });
});
