import type { HostSessionContext } from 'src/redux/host-tenants/types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import NormalRouteLayout from './index';

const replace = vi.fn();
const useSession = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('next-auth/react', () => ({ useSession: () => useSession() }));
vi.mock('../loading-screen', () => ({ SplashScreen: () => <div>Loading</div> }));
const host: HostSessionContext = {
  accountMode: 'host',
  tenantId: null,
  canViewTenants: true,
  canCreateTenants: true,
  canUpdateTenants: true,
  canManageTenantStatus: true,
};
function renderLogin(context: HostSessionContext | null, userId = 'user-1') {
  const auth = {
    ...authReducer(undefined, { type: '@@INIT' }),
    user: { sub: userId },
    sessionContext: context,
    isAuthenticated: true,
    permissionsInitialized: Boolean(context),
  };
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth } });
  render(
    <Provider store={store}>
      <NormalRouteLayout>
        <div>Login form</div>
      </NormalRouteLayout>
    </Provider>
  );
}
describe('verified login landing', () => {
  beforeEach(() => {
    replace.mockReset();
    useSession.mockReset();
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'user-1' }, accessToken: 'token' },
    });
  });
  it('sends the host directly to Tenant', () => {
    renderLogin(host);
    expect(replace).toHaveBeenCalledWith('/host/tenants');
    expect(replace).not.toHaveBeenCalledWith('/dashboard');
  });
  it('keeps the school dashboard landing', () => {
    renderLogin({ ...host, accountMode: 'tenant', tenantId: 'school-id', setupCompleted: true });
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });
  it('sends an incomplete school to its setup route', () => {
    renderLogin({ ...host, accountMode: 'tenant', tenantId: 'school-id', setupCompleted: false });
    expect(replace).toHaveBeenCalledWith('/initial-setup');
    expect(replace).not.toHaveBeenCalledWith('/dashboard');
  });
  it('waits for server verification instead of guessing an account mode', () => {
    renderLogin(null);
    expect(replace).not.toHaveBeenCalled();
  });
  it('does not use the previous account context after switching identities', () => {
    renderLogin(host, 'old-user');
    expect(replace).not.toHaveBeenCalled();
  });
  it('shows login for an expired session without redirecting back to Tenant', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'user-1' }, error: 'RefreshAccessTokenError' },
    });
    renderLogin(host);
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText('Login form')).toBeInTheDocument();
  });
});
