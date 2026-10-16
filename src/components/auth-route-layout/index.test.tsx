import type { HostSessionContext } from 'src/redux/host-tenants/types';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AuthRouteLayout from './index';

const push = vi.fn();
const replace = vi.fn();
const useSession = vi.fn();
const signOut = vi.fn();
let pathname = '/dashboard';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => pathname,
}));
vi.mock('next-auth/react', () => ({
  useSession: () => useSession(),
  signOut: (...args: unknown[]) => signOut(...args),
}));
vi.mock('../loading-screen', () => ({ SplashScreen: () => <div data-testid="splash-screen" /> }));

const caps = {
  canViewTenants: true,
  canCreateTenants: true,
  canUpdateTenants: true,
  canManageTenantStatus: true,
};
const host: HostSessionContext = { accountMode: 'host', tenantId: null, ...caps };
const school: HostSessionContext = {
  accountMode: 'tenant',
  tenantId: 'school-id',
  setupCompleted: true,
  ...caps,
};
function renderProtected(
  context: HostSessionContext | null,
  initialized = true,
  overrides: Partial<ReturnType<typeof authReducer>> = {}
) {
  const state = {
    ...authReducer(undefined, { type: '@@INIT' }),
    user: initialized ? { sub: 'user-1' } : null,
    isAuthenticated: initialized,
    permissionsInitialized: initialized,
    sessionContext: context,
    ...overrides,
  };
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: state } });
  const view = render(
    <Provider store={store}>
      <AuthRouteLayout>
        <div>Protected content</div>
      </AuthRouteLayout>
    </Provider>
  );
  return { ...view, store };
}
describe('AuthRouteLayout workspace boundary', () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    useSession.mockReset();
    signOut.mockReset();
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
  it('redirects incomplete schools to setup before dashboard content renders', async () => {
    renderProtected({ ...school, setupCompleted: false });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/initial-setup'));
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
  it('hides the old tenant workspace immediately for the same user in another tenant', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: {
        profile: { sub: 'user-1', tenantid: 'new-school' },
        accessToken: 'new-token',
      },
    });
    renderProtected(school, true, { user: { sub: 'user-1', tenantid: 'school-id' } });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
  it('shows a retry after verification failure and keeps protected content hidden during retry', () => {
    const { store } = renderProtected(null, false, {
      initializationError: 'We could not verify your account access. Please try again.',
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Account access could not be verified');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(store.getState().auth.initializationVersion).toBe(1);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });
  it('allows explicit sign out from the recovery state', () => {
    renderProtected(null, false, { initializationError: 'Please try again.' });
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });
});
