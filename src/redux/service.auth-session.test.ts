import { toast } from 'sonner';
import { configureStore } from '@reduxjs/toolkit';
import { signOut, getSession } from 'next-auth/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { api } from './service';
import { getCachedAuthSession, clearCachedAuthSession } from './session-cache';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn(), signOut: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const authProbeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    authSessionResponseProbe: builder.query<unknown, { id: string; body?: unknown }>({
      query: ({ id, body }) => ({
        url: `/auth-session-response-probe/${id}`,
        ...(body ? { method: 'POST', body } : {}),
      }),
    }),
  }),
});

const buildSession = (accessToken = 'tenant-a-token') =>
  ({
    accessToken,
    profile: { sub: 'same-user', tenantid: accessToken, exp: Date.now() / 1000 + 3600 },
  }) as any;

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolveValue) => {
    resolve = resolveValue;
  });
  return { promise, resolve };
}

function createStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) =>
      defaults().concat(
        () => (next) => (action) => {
          if (typeof action === 'object' && action !== null && 'type' in action) {
            dispatchedTypes.push(String(action.type));
          }
          return next(action);
        },
        api.middleware
      ),
  });
}

let store: ReturnType<typeof createStore>;
let dispatchedTypes: string[];
const mockedGetSession = vi.mocked(getSession);
const resetTypes = [
  'auth/clearUser',
  'globalState/setCurrentYear',
  'globalState/setCurrentBoard',
  'globalState/setCurrentMedium',
];

beforeEach(() => {
  clearCachedAuthSession();
  vi.clearAllMocks();
  mockedGetSession.mockReset();
  mockedGetSession.mockResolvedValue(buildSession());
  dispatchedTypes = [];
  store = createStore();
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('authentication response ownership', () => {
  it('does not send an invalidated session lookup anonymously or under the replacement account', async () => {
    const oldSession = deferred<ReturnType<typeof buildSession>>();
    mockedGetSession.mockReturnValueOnce(oldSession.promise);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const pending = store.dispatch(
      authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: 'old' })
    );
    await vi.waitFor(() => expect(mockedGetSession).toHaveBeenCalledOnce());

    clearCachedAuthSession();
    mockedGetSession.mockResolvedValue(buildSession('tenant-b-token'));
    await getCachedAuthSession();
    oldSession.resolve(buildSession());

    expect((await pending).error).toMatchObject({ status: 'CUSTOM_ERROR' });
    expect(fetch).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    { status: 401, data: { detail: 'Expired token' } },
    { status: 403, data: { errorCode: 'TENANT_INACTIVE' } },
  ])(
    'ignores a previous tenant response with status $status after an account change',
    async ({ status, data }) => {
      const response = deferred<Response>();
      const fetch = vi.fn().mockReturnValue(response.promise);
      vi.stubGlobal('fetch', fetch);
      const pending = store.dispatch(
        authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: 'old' })
      );
      await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
      expect((fetch.mock.calls[0][0] as Request).headers.get('Authorization')).toBe(
        'Bearer tenant-a-token'
      );

      clearCachedAuthSession();
      const replacement = buildSession('tenant-b-token');
      mockedGetSession.mockResolvedValue(replacement);
      await getCachedAuthSession();
      response.resolve(jsonResponse(status, data));

      expect((await pending).error).toMatchObject({ status, data });
      expect(signOut).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expect(dispatchedTypes.filter((type) => resetTypes.includes(type))).toEqual([]);
      await expect(getCachedAuthSession()).resolves.toBe(replacement);
    }
  );

  it('ignores an old token response after a refreshed token replaces the cached session', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    const response = deferred<Response>();
    const fetch = vi.fn().mockReturnValue(response.promise);
    vi.stubGlobal('fetch', fetch);
    const pending = store.dispatch(
      authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: 'old-token' })
    );
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());

    clock.mockReturnValue(now + 31_000);
    mockedGetSession.mockResolvedValue(buildSession('refreshed-token'));
    await getCachedAuthSession();
    response.resolve(jsonResponse(401, { detail: 'Expired token' }));

    expect((await pending).error).toMatchObject({ status: 401 });
    expect(signOut).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('preserves logout and feedback for the current session 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'Expired token' }))
    );

    const result = await store.dispatch(
      authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: 'current' })
    );

    expect(result.error).toMatchObject({ status: 401, data: { detail: 'Expired token' } });
    expect(signOut).toHaveBeenCalledExactlyOnceWith({ callbackUrl: '/login' });
    expect(toast.error).toHaveBeenCalledExactlyOnceWith('Unauthorized access');
  });

  it('preserves current inactive-school logout and state resets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(403, { errorCode: 'TENANT_INACTIVE' }))
    );

    const result = await store.dispatch(
      authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: 'inactive' })
    );

    expect(result.error).toMatchObject({ status: 403, data: { errorCode: 'TENANT_INACTIVE' } });
    expect(signOut).toHaveBeenCalledExactlyOnceWith({
      callbackUrl: '/login?reason=tenant-inactive',
    });
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(
      'This school is inactive. Contact the platform administrator.'
    );
    expect(dispatchedTypes.filter((type) => resetTypes.includes(type))).toEqual(resetTypes);
  });

  it.each([403, 503])('does not log out for an ordinary HTTP %s response', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(status, { detail: 'Request unavailable' }))
    );

    const result = await store.dispatch(
      authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: String(status) })
    );

    expect(result.error).toMatchObject({ status });
    expect(signOut).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('preserves authenticated request headers, credentials and JSON payloads', async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse(200, { saved: true }));
    vi.stubGlobal('fetch', fetch);
    const body = { name: 'Synthetic request', active: false };

    const result = await store.dispatch(
      authProbeApi.endpoints.authSessionResponseProbe.initiate({ id: 'payload', body })
    );

    expect(result.data).toEqual({ saved: true });
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBe('Bearer tenant-a-token');
    expect(request.headers.get('Content-Type')).toBe('application/json');
    expect(request.credentials).toBe('include');
    expect(request.method).toBe('POST');
    await expect(request.json()).resolves.toEqual(body);
  });
});
