import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import NextAuthSessionProvider from './providers';
import ReduxProvider from '../redux/reduxProvider';

const state = vi.hoisted(() => ({
  pathname: '/admission-registration',
  session: vi.fn(),
  bootstrap: vi.fn(),
}));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }));
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => {
    state.session();
    return children;
  },
}));
vi.mock('src/redux/auth/load-session', () => ({
  default: () => {
    state.bootstrap();
    return null;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.pathname = '/admission-registration';
});
vi.mock('src/redux/store', () => ({ default: {}, persistor: {} }));
vi.mock('react-redux', () => ({ Provider: ({ children }: any) => children }));
vi.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }: any) => children,
}));

it('mounts the public capability route without a session request or authenticated bootstrap', () => {
  render(
    <NextAuthSessionProvider>
      <ReduxProvider>
        <p>Private registration</p>
      </ReduxProvider>
    </NextAuthSessionProvider>
  );
  expect(screen.getByText('Private registration')).toBeVisible();
  expect(state.session).not.toHaveBeenCalled();
  expect(state.bootstrap).not.toHaveBeenCalled();
});

it('keeps the existing session provider and bootstrap on staff routes', () => {
  state.pathname = '/student/admissions/pipeline';
  render(
    <NextAuthSessionProvider>
      <ReduxProvider>
        <p>Staff admissions</p>
      </ReduxProvider>
    </NextAuthSessionProvider>
  );
  expect(screen.getByText('Staff admissions')).toBeVisible();
  expect(state.session).toHaveBeenCalledOnce();
  expect(state.bootstrap).toHaveBeenCalledOnce();
});
