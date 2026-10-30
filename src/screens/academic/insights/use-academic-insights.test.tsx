import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';
import { academicInsightsApi as api } from 'src/redux/academicAPI/academicInsightsApi';

import { useAcademicInsights } from './use-academic-insights';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  getAuthSessionCacheRevision: () => 1, isAuthSessionCacheCurrent: () => true,
}));
const permission = (name: string) => ({ name, isGranted: true });
const auth = { user: { sub: 'user-a' }, sessionContext: { tenantId: 'tenant-a' },
  permissions: ['ShikshaMitra.Module.Academics', 'Academics.Dashboard.View'].map(permission),
  permissionsInitialized: true, initializationVersion: 1 };
const globalState = { currentYear: { id: 'year-a', name: '2026' },
  currentBoard: { id: 'board-a', name: 'Board A' }, currentMedium: { id: 'medium-a', name: 'English' } };
const payload = { role: 'parent', scopeLabel: 'Verified child',
  generatedAt: '2026-10-29T10:00:00Z', sections: [], students: [] };
const endpoint = 'http://localhost:5000/api/academic/dashboard/insights';
function createStore(initial = { auth, globalState }) {
  return configureStore({ reducer: {
    auth: (state: typeof auth | undefined, action): typeof auth => action.type === 'test/auth'
      ? action.payload as typeof auth : state ?? initial.auth,
    globalState: (state: typeof globalState | undefined, action): typeof globalState => action.type === 'test/context'
      ? action.payload as typeof globalState : state ?? initial.globalState,
    [api.reducerPath]: api.reducer,
  }, middleware: (defaults) => defaults().concat(api.middleware) });
}
let store: ReturnType<typeof createStore>;
afterEach(() => { store?.dispatch(api.util.resetApiState()); });
const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

describe('Academic Insights context ownership', () => {
  it('skips requests until context and both dashboard grants are available', async () => {
    let requests = 0;
    mswServer.use(http.get(endpoint, () => { requests += 1; return HttpResponse.json(payload); }));
    store = createStore({ auth: { ...auth, permissions: [permission('Academics.Dashboard.View')] }, globalState });
    const { result } = renderHook(useAcademicInsights, { wrapper });
    expect(result.current.authorized).toBe(false);
    expect(result.current.isUninitialized).toBe(true);
    act(() => { store.dispatch({ type: 'test/auth', payload: auth }); });
    await waitFor(() => expect(result.current.data).toEqual(payload));
    expect(requests).toBe(1);
    act(() => { store.dispatch({ type: 'test/context', payload: { ...globalState, currentMedium: {} } }); });
    expect(result.current.hasContext).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('removes previous context data immediately and resets a selected child', async () => {
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => { release = resolve; });
    const received: URL[] = [];
    mswServer.use(http.get(endpoint, async ({ request }) => {
      const url = new URL(request.url);
      received.push(url);
      if (url.searchParams.get('educationMediumId') === 'medium-b') await waiting;
      return HttpResponse.json({ ...payload, scopeLabel: url.searchParams.get('educationMediumId') });
    }));
    store = createStore();
    const { result } = renderHook(useAcademicInsights, { wrapper });
    await waitFor(() => expect(result.current.data?.scopeLabel).toBe('medium-a'));
    act(() => { result.current.selectStudent('child-a'); });
    await waitFor(() => expect(received.some((url) => url.searchParams.get('studentId') === 'child-a')).toBe(true));
    act(() => { store.dispatch({ type: 'test/context', payload: { ...globalState,
      currentMedium: { id: 'medium-b', name: 'Other medium' } } }); });
    expect(result.current.studentId).toBe('');
    expect(result.current.data).toBeUndefined();
    expect(result.current.isFetching).toBe(true);
    await waitFor(() => expect(received.at(-1)?.searchParams.get('educationMediumId')).toBe('medium-b'));
    expect(received.at(-1)?.searchParams.has('studentId')).toBe(false);
    await act(async () => { release(); });
    await waitFor(() => expect(result.current.data?.scopeLabel).toBe('medium-b'));
  });

  it('clears visible data when permission initialization restarts', async () => {
    mswServer.use(http.get(endpoint, () => HttpResponse.json(payload)));
    store = createStore();
    const { result } = renderHook(useAcademicInsights, { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(payload));
    act(() => { store.dispatch({ type: 'test/auth', payload: { ...auth,
      permissionsInitialized: false, initializationVersion: 2 } }); });
    expect(result.current.data).toBeUndefined();
    expect(result.current.authorized).toBe(false);
  });

  it('can return to verified student selection after a child request fails', async () => {
    const choices = { ...payload, scopeLabel: 'Select a student', students: [
      { id: 'child-a', label: 'Student A' }, { id: 'child-b', label: 'Student B' }] };
    mswServer.use(http.get(endpoint, ({ request }) =>
      new URL(request.url).searchParams.has('studentId')
        ? HttpResponse.json({ error: { message: 'Invalid context' } }, { status: 400 })
        : HttpResponse.json(choices)));
    store = createStore();
    const { result } = renderHook(useAcademicInsights, { wrapper });
    await waitFor(() => expect(result.current.data?.students).toHaveLength(2));
    act(() => { result.current.selectStudent('child-b'); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    act(() => { result.current.selectStudent(''); });
    expect(result.current.data?.students).toHaveLength(2);
    expect(result.current.isError).toBe(false);
  });
});
