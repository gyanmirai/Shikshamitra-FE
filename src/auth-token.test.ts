import { it, vi, expect, describe, afterEach } from 'vitest';

import { refreshAccessToken, REFRESH_ACCESS_TOKEN_ERROR } from './auth-token';

const token = {
  accessToken: 'expired-token',
  refreshToken: 'refresh-token',
  expiresAt: 1,
  tokenType: 'Bearer',
  user: { organizationName: 'school-one' },
};

describe('refreshAccessToken', () => {
  it('omits the tenant resolver header when refreshing the host account', async () => {
    const fetchToken = vi.fn().mockResolvedValue({ ok: false });
    await refreshAccessToken(
      { ...token, refreshToken: 'host-refresh-token', user: { organizationName: '' } },
      fetchToken
    );
    expect(fetchToken.mock.calls[0][1].headers).not.toHaveProperty('__tenant');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears an expired access token when the refresh endpoint rejects it', async () => {
    const fetchToken = vi.fn().mockResolvedValue({ ok: false, status: 400 });

    const result = await refreshAccessToken(token, fetchToken as any);

    expect(result.accessToken).toBeUndefined();
    expect(result.expiresAt).toBe(0);
    expect(result.error).toBe(REFRESH_ACCESS_TOKEN_ERROR);
  });

  it('rejects a successful response that does not contain a usable access token', async () => {
    const fetchToken = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ expires_in: 3600 }),
    });

    const result = await refreshAccessToken(token, fetchToken as any);

    expect(result.accessToken).toBeUndefined();
    expect(result.error).toBe(REFRESH_ACCESS_TOKEN_ERROR);
  });

  it('stores a valid refreshed token and clears the previous refresh error', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    const fetchToken = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 120,
      }),
    });

    const result = await refreshAccessToken(
      { ...token, error: REFRESH_ACCESS_TOKEN_ERROR },
      fetchToken as any
    );

    expect(result).toMatchObject({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: 121_000,
      error: undefined,
    });
  });

  it('shares one refresh request when the same session is evaluated concurrently', async () => {
    let resolveResponse: ((response: unknown) => void) | undefined;
    const fetchToken = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        })
    );

    const firstRefresh = refreshAccessToken(token, fetchToken as any);
    const secondRefresh = refreshAccessToken(token, fetchToken as any);

    await vi.waitFor(() => expect(fetchToken).toHaveBeenCalledTimes(1));
    resolveResponse?.({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'shared-access-token',
        refresh_token: 'shared-refresh-token',
        expires_in: 120,
      }),
    });

    const [firstResult, secondResult] = await Promise.all([firstRefresh, secondRefresh]);

    expect(firstResult.accessToken).toBe('shared-access-token');
    expect(secondResult.accessToken).toBe('shared-access-token');
    expect(fetchToken).toHaveBeenCalledOnce();
  });
});
