import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import authReducer, { loadUser } from './authSlice';

const createStore = () => configureStore({ reducer: { auth: authReducer } });

describe('loadUser authentication bootstrap', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not call the permission API without a usable access token', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const store = createStore();

    const result = await store.dispatch(
      loadUser({ profile: { sub: 'user-1' }, accessToken: undefined }) as any
    );

    expect(result.type).toBe('auth/loadUser/rejected');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('does not mark the user authenticated when the permission API returns 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    vi.stubGlobal('fetch', fetchMock);
    const store = createStore();

    const result = await store.dispatch(
      loadUser({ profile: { sub: 'user-1' }, accessToken: 'invalid-token' }) as any
    );

    expect(result.type).toBe('auth/loadUser/rejected');
    expect(store.getState().auth).toMatchObject({
      user: null,
      isAuthenticated: false,
      permissions: [],
      permissionsInitialized: true,
    });
  });

  it('uses the access token and initializes permissions after a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        groups: [
          {
            permissions: [{ name: 'ShikshaMitra.Module.Students', isGranted: true }],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const store = createStore();

    const result = await store.dispatch(
      loadUser({ profile: { sub: 'user-1' }, accessToken: 'valid-token' }) as any
    );

    expect(result.type).toBe('auth/loadUser/fulfilled');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('providerKey=user-1'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer valid-token' }),
      })
    );
    expect(store.getState().auth).toMatchObject({
      isAuthenticated: true,
      permissionsInitialized: true,
      permissions: [{ name: 'ShikshaMitra.Module.Students', isGranted: true }],
    });
  });
});
