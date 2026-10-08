import type { HostSessionContext } from 'src/redux/host-tenants/types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import AuthRouteLayout from './index';

const push = vi.fn();
const replace = vi.fn();
const useSession = vi.fn();
let pathname = '/dashboard';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => pathname,
}));
vi.mock('next-auth/react', () => ({ useSession: () => useSession() }));
vi.mock('../loading-screen', () => ({ SplashScreen: () => <div data-testid="splash-screen" /> }));

const caps = {
  canViewTenants: true,
  canCreateTenants: true,
  canUpdateTenants: true,
  canManageTenantStatus: true,
};
const host: HostSessionContext = { accountMode: 'host', tenantId: null, ...caps };
const school: HostSessionContext = { accountMode: 'tenant', tenantId: 'school-id', ...caps };
function renderProtected(context: HostSessionContext | null, initialized = true) {
  const state = {
    ...authReducer(undefined, { type: '@@INIT' }),
    user: initialized ? { sub: 'user-1' } : null,
    isAuthenticated: initialized,
    permissionsInitialized: initialized,
    sessionContext: context,
  };
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: state } });
  return render(
    <Provider store={store}>
      <AuthRouteLayout>
        <div>Protected content</div>
      </AuthRouteLayout>
    </Provider>
  );
}
describe('AuthRouteLayout workspace boundary', () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    useSession.mockReset();
    pathname = '/dashboard';
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'user-1' }, accessToken: 'token' },
    });
  });
  it('keeps protected content hidden until account context and permissions are initialized', () => {
    renderProtected(null, false);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
  it('renders school content with a verified school context', () => {
    renderProtected(school);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
  it('redirects host users from school routes before their children render', async () => {
    renderProtected(host);
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/host/tenants'));
  });
  it('redirects school users away from the host workspace', async () => {
    pathname = '/host/tenants';
    renderProtected(school);
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
  });
  it('allows host users to render the tenant workspace', () => {
    pathname = '/host/tenants';
    renderProtected(host);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
  it('accepts a trailing slash without redirecting in a loop', () => {
    pathname = '/host/tenants/';
    renderProtected(host);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
  it('does not render a stale identity after an account switch', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'different-user' }, accessToken: 'token' },
    });
    renderProtected(school);
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
  it('redirects an expired session to login', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'user-1' }, error: 'RefreshAccessTokenError' },
    });
    renderProtected(null, false);
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
  });
});
