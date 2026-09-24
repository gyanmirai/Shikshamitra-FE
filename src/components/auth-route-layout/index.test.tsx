import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import AuthRouteLayout from './index';

const push = vi.fn();
const useSession = vi.fn();
const useSelector = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => useSession(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: unknown) => useSelector(selector),
}));

vi.mock('../loading-screen', () => ({
  SplashScreen: () => <div data-testid="splash-screen" />,
}));

describe('AuthRouteLayout', () => {
  beforeEach(() => {
    push.mockReset();
    useSession.mockReset();
    useSelector.mockReset();
  });

  it('keeps protected content hidden until permissions are initialized', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'user-1' }, accessToken: 'token' },
    });
    useSelector.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      permissionsInitialized: false,
    });

    render(
      <AuthRouteLayout>
        <div>Protected content</div>
      </AuthRouteLayout>
    );

    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders protected content after the permission bootstrap succeeds', () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { profile: { sub: 'user-1' }, accessToken: 'token' },
    });
    useSelector.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      permissionsInitialized: true,
    });

    render(
      <AuthRouteLayout>
        <div>Protected content</div>
      </AuthRouteLayout>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects a session with a refresh error without rendering protected content', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: {
        profile: { sub: 'user-1' },
        accessToken: 'expired-token',
        error: 'RefreshAccessTokenError',
      },
    });
    useSelector.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      permissionsInitialized: true,
    });

    render(
      <AuthRouteLayout>
        <div>Protected content</div>
      </AuthRouteLayout>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
  });
});
