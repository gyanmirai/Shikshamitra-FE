import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, afterEach } from 'vitest';

import authReducer, { loadUser } from './authSlice';

const context = {
  accountMode: 'tenant',
  tenantId: 'synthetic-school',
  setupCompleted: true,
  canViewTenants: false,
  canCreateTenants: false,
  canUpdateTenants: false,
  canManageTenantStatus: false,
};
const session = {
  accessToken: 'synthetic-token',
  profile: { sub: 'synthetic-user', tenantid: context.tenantId, module_mask: '0000000000000000' },
};
const modules = ['Dashboard', 'Academics', 'HR', 'Finance'];
const response = (value: unknown) => ({ ok: true, json: async () => value });

describe('effective user overrides during sign-in', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('hydrates module visibility from live direct grants even when the token mask is stale', async () => {
    const permissions = modules.map((name) => ({
      name: `ShikshaMitra.Module.${name}`,
      isGranted: true,
      grantedProviders: [{ providerName: 'U', providerKey: session.profile.sub }],
    }));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response(context))
      .mockResolvedValueOnce(response({ groups: [{ permissions }] })));
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(loadUser(session));

    expect(store.getState().auth.permissionsInitialized).toBe(true);
    expect(store.getState().auth.mainModuleVisibility.filter(Boolean)).toHaveLength(4);
    expect(store.getState().auth.mainModuleVisibility.slice(0, 6)).toEqual([
      true, false, true, false, true, true,
    ]);
  });

  it('keeps navigation hidden when only action overrides are allowed', async () => {
    const permissions = [{ name: 'Finance.Fees.Refund.View', isGranted: true }];
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response(context))
      .mockResolvedValueOnce(response({ groups: [{ permissions }] })));
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(loadUser(session));

    expect(store.getState().auth.permissions).toEqual(permissions);
    expect(store.getState().auth.mainModuleVisibility.every((visible) => !visible)).toBe(true);
  });

  it('removes a denied module on a subsequent initialization without trusting token claims', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(response(context))
      .mockResolvedValueOnce(response({ groups: [{ permissions: [
        { name: 'ShikshaMitra.Module.Finance', isGranted: true },
      ] }] }))
      .mockResolvedValueOnce(response(context))
      .mockResolvedValueOnce(response({ groups: [{ permissions: [
        { name: 'ShikshaMitra.Module.Finance', isGranted: false },
      ] }] }));
    vi.stubGlobal('fetch', fetch);
    const store = configureStore({ reducer: { auth: authReducer } });

    await store.dispatch(loadUser(session));
    expect(store.getState().auth.mainModuleVisibility[5]).toBe(true);
    await store.dispatch(loadUser(session));
    expect(store.getState().auth.mainModuleVisibility[5]).toBe(false);
  });
});
