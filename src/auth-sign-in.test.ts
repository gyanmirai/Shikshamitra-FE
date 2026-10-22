import { it, vi, expect, describe, afterEach } from 'vitest';

import './auth';

const { config } = vi.hoisted(() => ({ config: { current: undefined as any } }));
vi.mock('next-auth', () => ({
  CredentialsSignin: class extends Error {
    code = 'credentials';
  },
  default: (value: unknown) => {
    config.current = value;
    return {};
  },
}));
vi.mock('next-auth/providers/credentials', () => ({ default: (value: unknown) => value }));
vi.mock('./auth-token', () => ({ refreshAccessToken: vi.fn() }));

describe('credential response classification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [400, { error: 'invalid_grant', errorCode: 'TENANT_NOT_FOUND' }, 'invalid_school_code'],
    [400, { error: 'invalid_grant', errorCode: 'TENANT_INACTIVE' }, 'tenant-inactive'],
    [400, { error: 'invalid_grant' }, 'invalid_credentials'],
    [503, { error: 'invalid_grant' }, 'authentication_unavailable'],
  ])('maps status %s and response %j to %s', async (status, payload, code) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status }))
    );
    await expect(
      config.current.providers[0].authorize({
        email: 'teacher',
        password: 'test',
        organizationName: 'SCHOOL',
      })
    ).rejects.toMatchObject({ code });
  });

  it('classifies transport failure without blaming the credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(
      config.current.providers[0].authorize({
        email: 'teacher',
        password: 'test',
        organizationName: 'SCHOOL',
      })
    ).rejects.toMatchObject({ code: 'authentication_unavailable' });
  });
});
