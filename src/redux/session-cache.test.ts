import { getSession } from 'next-auth/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { getCachedAuthSession, clearCachedAuthSession } from './session-cache';

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
});
