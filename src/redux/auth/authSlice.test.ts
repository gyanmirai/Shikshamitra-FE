import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, afterEach } from 'vitest';

import authReducer, { setUser, loadUser, clearUser, getEmployee } from './authSlice';

const createStore = () => configureStore({ reducer: { auth: authReducer } });
const hostContext = {
  accountMode: 'host',
  tenantId: null,
  canViewTenants: true,
  canCreateTenants: false,
  canUpdateTenants: false,
  canManageTenantStatus: false,
};
const tenantContext = {
  ...hostContext,
  accountMode: 'tenant',
  tenantId: 'tenant-1',
  setupCompleted: true,
  canViewTenants: false,
};
const response = (value: unknown) => ({ ok: true, json: async () => value });
const session = { profile: { sub: 'user-1' }, accessToken: 'valid-token' };

describe('loadUser authentication bootstrap', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not restore an old identity after clearing initialization', async () => {
    let resolveContext!: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveContext = resolve;
        })
      )
    );
    const store = createStore();
    const pending = store.dispatch(loadUser(session));
    store.dispatch(clearUser());
    resolveContext(response(hostContext));
    await pending;
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.sessionContext).toBeNull();
  });

  it('does not fetch without a usable access token', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const store = createStore();
    const result = await store.dispatch(loadUser({ profile: { sub: 'user-1' } }));
    expect(result.type).toBe('auth/loadUser/rejected');
    expect(fetch).not.toHaveBeenCalled();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('fails closed when server account verification returns 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const store = createStore();
    await store.dispatch(loadUser(session));
    expect(store.getState().auth).toMatchObject({
      user: null,
      isAuthenticated: false,
      permissions: [],
      permissionsInitialized: true,
    });
  });

  it('uses only server-verified tenant capabilities for host initialization', async () => {
    const fetch = vi.fn().mockResolvedValue(response(hostContext));
    vi.stubGlobal('fetch', fetch);
    const store = createStore();
    await store.dispatch(loadUser(session));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/host/session-context'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer valid-token' }),
      })
    );
    expect(store.getState().auth.permissions).toContainEqual({
      name: 'AbpTenantManagement.Tenants.ManageStatus',
      isGranted: false,
    });
    expect(store.getState().auth.mainModuleVisibility.every((value) => !value)).toBe(true);
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it('preserves school effective-permission initialization', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(tenantContext))
      .mockResolvedValueOnce(
        response({
          groups: [{ permissions: [{ name: 'ShikshaMitra.Module.Students', isGranted: true }] }],
        })
      );
    vi.stubGlobal('fetch', fetch);
    const store = createStore();
    await store.dispatch(loadUser(session));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('providerKey=user-1'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer valid-token' }),
      })
    );
    expect(store.getState().auth).toMatchObject({
      isAuthenticated: true,
      permissions: [{ name: 'ShikshaMitra.Module.Students', isGranted: true }],
    });
  });

  it('keeps school authentication denied when its permission API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(response(tenantContext))
        .mockResolvedValueOnce({ ok: false, status: 401 })
    );
    const store = createStore();
    await store.dispatch(loadUser(session));
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('does not restore employee data from an earlier visit to the same account', async () => {
    let resolveOldEmployee!: (value: unknown) => void;
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOldEmployee = resolve;
        })
      )
      .mockResolvedValueOnce(response({ id: 'new-employee' }));
    vi.stubGlobal('fetch', fetch);
    const store = createStore();
    const employeeSession = { ...session, profile: { sub: 'user-1', tenantid: 'tenant-1' } };
    store.dispatch(setUser(employeeSession.profile));
    const oldRequest = store.dispatch(getEmployee(employeeSession));
    store.dispatch(clearUser());
    store.dispatch(setUser(employeeSession.profile));
    await store.dispatch(getEmployee(employeeSession));
    resolveOldEmployee(response({ id: 'old-employee' }));
    await oldRequest;
    expect(store.getState().auth.employee).toEqual({ id: 'new-employee' });
  });

  it('does not apply an employee response to the same user in a different tenant', async () => {
    let resolveEmployee!: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveEmployee = resolve;
        })
      )
    );
    const store = createStore();
    store.dispatch(setUser({ sub: 'user-1', tenantid: 'tenant-1' }));
    const pending = store.dispatch(
      getEmployee({ ...session, profile: { sub: 'user-1', tenantid: 'tenant-1' } })
    );
    store.dispatch(setUser({ sub: 'user-1', tenantid: 'tenant-2' }));
    resolveEmployee(response({ id: 'old-employee' }));
    await pending;
    expect(store.getState().auth.employee).toBeNull();
  });
});
