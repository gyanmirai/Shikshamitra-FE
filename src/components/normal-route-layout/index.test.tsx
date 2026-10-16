import type { HostSessionContext } from 'src/redux/host-tenants/types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import NormalRouteLayout from './index';

const replace = vi.fn();
const useSession = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('next-auth/react', () => ({ useSession: () => useSession(), signOut: vi.fn() }));
vi.mock('../loading-screen', () => ({ SplashScreen: () => <div>Loading</div> }));
const host: HostSessionContext = {
  accountMode: 'host',
  tenantId: null,
  canViewTenants: true,
  canCreateTenants: true,
  canUpdateTenants: true,
  canManageTenantStatus: true,
};
function renderLogin(
  context: HostSessionContext | null,
  userId = 'user-1',
  overrides: Partial<ReturnType<typeof authReducer>> = {}
) {
  const auth = {
    ...authReducer(undefined, { type: '@@INIT' }),
    user: { sub: userId },
    sessionContext: context,
    isAuthenticated: true,
    permissionsInitialized: Boolean(context),
    ...overrides,
  };
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth } });
  render(
    <Provider store={store}>
      <NormalRouteLayout>
        <div>Login form</div>
      </NormalRouteLayout>
    </Provider>
  );
  return store;
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
  it('does not redirect using context from the previous tenant for the same user', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: {
        profile: { sub: 'user-1', tenantid: 'new-school' },
        accessToken: 'new-token',
      },
    });
    renderLogin(host, 'user-1', { user: { sub: 'user-1', tenantid: 'old-school' } });
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
  it('shows retry instead of a blank login screen when account verification fails', () => {
    const store = renderLogin(null, 'user-1', { initializationError: 'Please try again.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Account access could not be verified');
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(store.getState().auth.initializationVersion).toBe(1);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
