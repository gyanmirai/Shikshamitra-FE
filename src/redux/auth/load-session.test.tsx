import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

import { api } from '../service';
import authReducer from './authSlice';
import LoadSession from './load-session';
import { clearCachedAuthSession } from '../session-cache';
import { useGetShiftsQuery } from '../shiftManagement/shift-management-api';

const auth = vi.hoisted(() => ({
  session: {
    accessToken: 'tenant-a',
    profile: { sub: 'same-user', tenantid: 'tenant-a', role: 'admin' },
  },
}));
vi.mock('next-auth/react', () => ({
  getSession: async () => auth.session,
  useSession: () => ({ data: auth.session, status: 'authenticated' }),
  signOut: vi.fn(),
}));

afterEach(() => {
  cleanup();
  clearCachedAuthSession();
  vi.unstubAllGlobals();
});

function ShiftProbe() {
  const { data } = useGetShiftsQuery(undefined);
  return <div>{data?.items?.map((shift: { shiftName: string }) => shift.shiftName).join(',')}</div>;
}

it('uses the new tenant token for the grid immediately after the same user changes tenant', async () => {
  clearCachedAuthSession();
  auth.session = {
    accessToken: 'tenant-a',
    profile: { sub: 'same-user', tenantid: 'tenant-a', role: 'admin' },
  };
  const shiftTokens: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: Request | string, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init);
      const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
      let body: unknown;
      if (request.url.includes('/host/session-context')) {
        body = {
          accountMode: 'tenant',
          tenantId: token,
          canViewTenants: false,
          canCreateTenants: false,
          canUpdateTenants: false,
          canManageTenantStatus: false,
          setupCompleted: true,
          canManageSetup: false,
        };
      } else if (request.url.includes('/permission-management/permissions')) {
        body = { groups: [] };
      } else if (request.url.includes('/app/shift-management')) {
        shiftTokens.push(token);
        body = { totalCount: 1, items: [{ id: token, shiftName: `${token} shift` }] };
      } else {
        throw new Error(`Unexpected request: ${request.url}`);
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    })
  );
  const store = configureStore({
    reducer: { auth: authReducer, globalState: () => ({}), [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const tree = () => (
    <Provider store={store}>
      <LoadSession />
      <ShiftProbe />
    </Provider>
  );
  const view = render(tree());
  await screen.findByText('tenant-a shift');
  await waitFor(() => expect(store.getState().auth.permissionsInitialized).toBe(true));

  auth.session = {
    accessToken: 'tenant-b',
    profile: { sub: 'same-user', tenantid: 'tenant-b', role: 'admin' },
  };
  view.rerender(tree());
  await screen.findByText('tenant-b shift');
  expect(screen.queryByText('tenant-a shift')).toBeNull();
  expect(shiftTokens.at(-1)).toBe('tenant-b');
});
