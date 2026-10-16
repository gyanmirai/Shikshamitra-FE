import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, render, cleanup, waitFor } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { api } from '../service';
import LoadSession from './load-session';
import { clearCachedAuthSession } from '../session-cache';
import { openLibraryApi } from '../library/LibraryDataSearch';
import globalStateReducer, { setCurrentYear } from '../globalState/globalSlice';
import authReducer, {
  setUser,
  loadUser,
  setPermissions,
  retrySessionInitialization,
} from './authSlice';

type TestSession = {
  accessToken?: string;
  profile?: { sub: string; tenantid: string; role: string };
  error?: string;
};

const auth = vi.hoisted(() => ({
  session: null as TestSession | null,
  status: 'authenticated' as 'authenticated' | 'unauthenticated' | 'loading',
  segments: ['(auth-route)', 'dashboard'],
  signOut: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  getSession: async () => auth.session,
  useSession: () => ({ data: auth.session, status: auth.status }),
  signOut: (...args: unknown[]) => auth.signOut(...args),
}));
vi.mock('next/navigation', () => ({
  useSelectedLayoutSegments: () => auth.segments,
}));

const staffSession = (accessToken = 'current-token'): TestSession => ({
  accessToken,
  profile: { sub: 'user-1', tenantid: 'school-1', role: 'admin' },
});
const schoolContext = {
  accountMode: 'tenant',
  tenantId: 'school-1',
  setupCompleted: true,
  canManageSetup: false,
  canViewTenants: false,
  canCreateTenants: false,
  canUpdateTenants: false,
  canManageTenantStatus: false,
};
const effectivePermissions = {
  groups: [{ permissions: [{ name: 'ShikshaMitra.Module.Students', isGranted: true }] }],
};
const jsonResponse = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      globalState: globalStateReducer,
      [api.reducerPath]: api.reducer,
      [openLibraryApi.reducerPath]: openLibraryApi.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware, openLibraryApi.middleware),
  });
const renderSession = (store = createStore()) => {
  const tree = () => (
    <Provider store={store}>
      <LoadSession />
    </Provider>
  );
  const view = render(tree());
  return { ...view, store, redraw: () => view.rerender(tree()) };
};
const requestStage = (input: RequestInfo | URL) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.includes('/host/session-context')) return 'context';
  if (url.includes('/permission-management/permissions')) return 'permissions';
  throw new Error(`Unexpected bootstrap request: ${url}`);
};
const successfulResponse = (input: RequestInfo | URL) =>
  jsonResponse(requestStage(input) === 'context' ? schoolContext : effectivePermissions);

beforeEach(() => {
  auth.session = staffSession();
  auth.status = 'authenticated';
  auth.segments = ['(auth-route)', 'dashboard'];
  auth.signOut.mockReset();
  auth.signOut.mockResolvedValue({ url: '/login' });
  clearCachedAuthSession();
});

afterEach(() => {
  cleanup();
  clearCachedAuthSession();
  vi.unstubAllGlobals();
});

describe('public route session isolation', () => {
  it.each([
    ['admission-inquiry', 'anonymous'],
    ['admission-inquiry', 'valid'],
    ['admission-inquiry', 'invalid'],
    ['employee-application', 'anonymous'],
    ['employee-application', 'valid'],
    ['employee-application', 'invalid'],
  ])('does not bootstrap or sign out on %s with an %s session', async (route, sessionKind) => {
    auth.segments = ['(public-route)', route, 'fixture-token'];
    if (sessionKind === 'anonymous') {
      auth.session = null;
      auth.status = 'unauthenticated';
    } else if (sessionKind === 'invalid') {
      auth.session = { ...staffSession(), error: 'RefreshAccessTokenError' };
    }
    const fetch = vi.fn(async (input: RequestInfo | URL) => successfulResponse(input));
    vi.stubGlobal('fetch', fetch);
    renderSession();
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('still clears private state after the session becomes unauthenticated on a public route', () => {
    auth.segments = ['(public-route)', 'admission-inquiry', 'fixture-token'];
    auth.session = null;
    auth.status = 'unauthenticated';
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const store = createStore();
    store.dispatch(setUser(staffSession().profile));
    store.dispatch(setPermissions(effectivePermissions.groups[0].permissions));
    store.dispatch(setCurrentYear({ id: 'private-year' }));
    renderSession(store);
    expect(store.getState().auth).toMatchObject({
      user: null,
      isAuthenticated: false,
      permissions: [],
    });
    expect(store.getState().globalState.currentYear).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
    expect(auth.signOut).not.toHaveBeenCalled();
  });
});

describe('private session validity', () => {
  it.each(['missing token', 'refresh error'])(
    'clears private state and signs out once for %s',
    async (kind) => {
      auth.session =
        kind === 'missing token'
          ? { profile: staffSession().profile }
          : { ...staffSession(), error: 'RefreshAccessTokenError' };
      const fetch = vi.fn();
      vi.stubGlobal('fetch', fetch);
      const store = createStore();
      store.dispatch(setUser(staffSession().profile));
      store.dispatch(setPermissions(effectivePermissions.groups[0].permissions));
      store.dispatch(setCurrentYear({ id: 'private-year' }));
      const { redraw } = renderSession(store);
      await waitFor(() => expect(auth.signOut).toHaveBeenCalledOnce());
      expect(auth.signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
      expect(store.getState().auth).toMatchObject({
        user: null,
        isAuthenticated: false,
        permissions: [],
        sessionContext: null,
      });
      expect(store.getState().globalState.currentYear).toEqual({});
      expect(fetch).not.toHaveBeenCalled();

      auth.session = { ...auth.session };
      redraw();
      await act(async () => {
        await Promise.resolve();
      });
      expect(auth.signOut).toHaveBeenCalledOnce();
    }
  );

  it('does not clear private state, bootstrap or sign out while the session is loading', async () => {
    auth.session = null;
    auth.status = 'loading';
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const store = createStore();
    store.dispatch(setUser(staffSession().profile));
    store.dispatch(setPermissions(effectivePermissions.groups[0].permissions));
    store.dispatch(setCurrentYear({ id: 'private-year' }));
    renderSession(store);
    await act(async () => {
      await Promise.resolve();
    });
    expect(store.getState().auth.user).toEqual(staffSession().profile);
    expect(store.getState().auth.permissions).toEqual(effectivePermissions.groups[0].permissions);
    expect(store.getState().globalState.currentYear).toEqual({ id: 'private-year' });
    expect(fetch).not.toHaveBeenCalled();
    expect(auth.signOut).not.toHaveBeenCalled();
  });
});

describe('session initialization recovery', () => {
  it('reinitializes an admin after an independent account-context refresh fails and retry is requested', async () => {
    let failing = false;
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (failing && requestStage(input) === 'context') return jsonResponse({}, 500);
      return successfulResponse(input);
    });
    vi.stubGlobal('fetch', fetch);
    const { store } = renderSession();
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));

    failing = true;
    await act(async () => {
      await store.dispatch(loadUser(staffSession()));
    });
    expect(store.getState().auth.initializationError).toBeTruthy();
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(auth.signOut).not.toHaveBeenCalled();

    failing = false;
    act(() => {
      store.dispatch(retrySessionInitialization());
    });
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
    expect(store.getState().auth.initializationError).toBeNull();
    expect(store.getState().auth.permissions).toEqual(effectivePermissions.groups[0].permissions);
    expect(fetch.mock.calls.filter(([input]) => requestStage(input) === 'context')).toHaveLength(3);
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it.each([
    ['context', 'server'],
    ['context', 'network'],
    ['context', 'forbidden'],
    ['context', 'malformed'],
    ['permissions', 'server'],
    ['permissions', 'network'],
    ['permissions', 'forbidden'],
  ])(
    'keeps a %s %s failure closed and recovers after retry without signing out',
    async (stage, kind) => {
      let failing = true;
      const fetch = vi.fn(async (input: RequestInfo | URL) => {
        if (failing && requestStage(input) === stage) {
          if (kind === 'network') throw new TypeError('Network unavailable');
          if (kind === 'malformed') return jsonResponse({ accountMode: 'tenant' });
          return jsonResponse({ errorCode: 'AccessDenied' }, kind === 'forbidden' ? 403 : 500);
        }
        return successfulResponse(input);
      });
      vi.stubGlobal('fetch', fetch);
      const { store } = renderSession();
      await waitFor(() => expect(store.getState().auth.initializationError).toBeTruthy());
      expect(store.getState().auth).toMatchObject({
        user: null,
        isAuthenticated: false,
        permissions: [],
        sessionContext: null,
      });
      expect(auth.signOut).not.toHaveBeenCalled();

      failing = false;
      act(() => {
        store.dispatch(retrySessionInitialization());
      });
      await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
      expect(store.getState().auth.initializationError).toBeNull();
      expect(store.getState().auth.permissions).toEqual(effectivePermissions.groups[0].permissions);
      expect(store.getState().auth.sessionContext).toEqual(schoolContext);
      expect(auth.signOut).not.toHaveBeenCalled();
    }
  );

  it.each([
    ['context', 401, undefined, '/login'],
    ['permissions', 401, undefined, '/login'],
    ['context', 403, 'TENANT_INACTIVE', '/login?reason=tenant-inactive'],
    ['permissions', 403, 'TENANT_INACTIVE', '/login?reason=tenant-inactive'],
  ])(
    'invalidates the current session for %s %s %s',
    async (stage, status, errorCode, callbackUrl) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (input: RequestInfo | URL) =>
          requestStage(input) === stage
            ? jsonResponse({ errorCode }, Number(status))
            : successfulResponse(input)
        )
      );
      const { store } = renderSession();
      await waitFor(() => expect(auth.signOut).toHaveBeenCalledOnce());
      expect(auth.signOut).toHaveBeenCalledWith(expect.objectContaining({ callbackUrl }));
      expect(store.getState().auth).toMatchObject({
        user: null,
        isAuthenticated: false,
        permissions: [],
        sessionContext: null,
      });
    }
  );
});

describe('obsolete session initialization', () => {
  it('ignores a first account attempt after switching away and back to the same account and token', async () => {
    let resolveFirst!: (response: Response) => void;
    let resolveOther!: (response: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const otherResponse = new Promise<Response>((resolve) => {
      resolveOther = resolve;
    });
    const obsoleteSignals: (AbortSignal | null | undefined)[] = [];
    let firstAccountAttempt = true;
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = new Headers(init?.headers).get('Authorization');
      if (requestStage(input) === 'context') {
        if (token === 'Bearer account-a' && firstAccountAttempt) {
          firstAccountAttempt = false;
          obsoleteSignals.push(init?.signal);
          return firstResponse;
        }
        if (token === 'Bearer account-b') {
          obsoleteSignals.push(init?.signal);
          return otherResponse;
        }
      }
      return successfulResponse(input);
    });
    vi.stubGlobal('fetch', fetch);
    auth.session = staffSession('account-a');
    const { store, redraw } = renderSession();
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());

    auth.session = {
      accessToken: 'account-b',
      profile: { sub: 'other-user', tenantid: 'other-school', role: 'admin' },
    };
    redraw();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    auth.session = staffSession('account-a');
    redraw();
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
    expect(obsoleteSignals).toHaveLength(2);
    expect(obsoleteSignals.every((signal) => signal?.aborted)).toBe(true);

    await act(async () => {
      resolveFirst(jsonResponse({}, 401));
      resolveOther(jsonResponse({}, 401));
    });
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toEqual(staffSession('account-a').profile);
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.initializationError).toBeNull();
  });

  it.each(['token', 'tenant'])(
    'ignores an old employee 401 after the same user changes %s',
    async (change) => {
      let resolveOldEmployee!: (response: Response) => void;
      const oldEmployeeResponse = new Promise<Response>((resolve) => {
        resolveOldEmployee = resolve;
      });
      let oldEmployeeSignal: AbortSignal | null | undefined;
      const nextTenant = change === 'tenant' ? 'school-2' : 'school-1';
      const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input instanceof Request ? input.url : String(input);
        const token = new Headers(init?.headers).get('Authorization');
        if (url.includes('/employees/me')) {
          if (token === 'Bearer old-token') {
            oldEmployeeSignal = init?.signal;
            return oldEmployeeResponse;
          }
          return jsonResponse({ id: 'employee-new' });
        }
        if (requestStage(input) === 'context') {
          return jsonResponse({
            ...schoolContext,
            tenantId: token === 'Bearer old-token' ? 'school-1' : nextTenant,
          });
        }
        return jsonResponse(effectivePermissions);
      });
      vi.stubGlobal('fetch', fetch);
      auth.session = {
        accessToken: 'old-token',
        profile: { sub: 'user-1', tenantid: 'school-1', role: 'teacher' },
      };
      const { store, redraw } = renderSession();
      await waitFor(() => expect(oldEmployeeSignal).toBeDefined());
      auth.session = {
        accessToken: 'new-token',
        profile: { sub: 'user-1', tenantid: nextTenant, role: 'teacher' },
      };
      redraw();
      await waitFor(() => expect(store.getState().auth.employee).toEqual({ id: 'employee-new' }));
      expect(oldEmployeeSignal?.aborted).toBe(true);

      await act(async () => {
        resolveOldEmployee(jsonResponse({}, 401));
      });
      expect(auth.signOut).not.toHaveBeenCalled();
      expect(store.getState().auth.user?.tenantid).toBe(nextTenant);
      expect(store.getState().auth.employee).toEqual({ id: 'employee-new' });
      expect(store.getState().auth.isAuthenticated).toBe(true);
    }
  );

  it('ignores an old token 401 after the same identity receives a new token', async () => {
    let resolveOld!: (response: Response) => void;
    const oldResponse = new Promise<Response>((resolve) => {
      resolveOld = resolve;
    });
    let oldSignal: AbortSignal | null | undefined;
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = new Headers(init?.headers).get('Authorization');
      if (token === 'Bearer old-token' && requestStage(input) === 'context') {
        oldSignal = init?.signal;
        return oldResponse;
      }
      return successfulResponse(input);
    });
    vi.stubGlobal('fetch', fetch);
    auth.session = staffSession('old-token');
    const { store, redraw } = renderSession();
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    auth.session = staffSession('new-token');
    redraw();
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
    expect(oldSignal?.aborted).toBe(true);

    await act(async () => {
      resolveOld(jsonResponse({}, 401));
    });
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.initializationError).toBeNull();
  });

  it.each([401, 500])(
    'ignores an in-flight %s after opening a public route and can resume private navigation',
    async (status) => {
      let resolveOld!: (response: Response) => void;
      const oldResponse = new Promise<Response>((resolve) => {
        resolveOld = resolve;
      });
      let oldSignal: AbortSignal | null | undefined;
      let firstRequest = true;
      const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (firstRequest) {
          firstRequest = false;
          oldSignal = init?.signal;
          return oldResponse;
        }
        return successfulResponse(input);
      });
      vi.stubGlobal('fetch', fetch);
      const { store, redraw } = renderSession();
      await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
      auth.segments = ['(public-route)', 'admission-inquiry', 'fixture-token'];
      redraw();
      expect(oldSignal?.aborted).toBe(true);
      await act(async () => {
        resolveOld(jsonResponse({}, status));
      });
      expect(fetch).toHaveBeenCalledOnce();
      expect(auth.signOut).not.toHaveBeenCalled();

      auth.segments = ['(auth-route)', 'dashboard'];
      redraw();
      await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(true));
      expect(store.getState().auth.initializationError).toBeNull();
      expect(auth.signOut).not.toHaveBeenCalled();
    }
  );

  it('aborts bootstrap on unmount and ignores its late unauthorized response', async () => {
    let resolveOld!: (response: Response) => void;
    const oldResponse = new Promise<Response>((resolve) => {
      resolveOld = resolve;
    });
    let oldSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        oldSignal = init?.signal;
        return oldResponse;
      })
    );
    const { unmount } = renderSession();
    unmount();
    expect(oldSignal?.aborted).toBe(true);
    await act(async () => {
      resolveOld(jsonResponse({}, 401));
    });
    expect(auth.signOut).not.toHaveBeenCalled();
  });
});
