import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useAcademicSetupWorkspace } from './use-academic-setup-workspace';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'setup-token', profile: { sub: 'user', tenantid: 'school' } }),
  signOut: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn(), success: vi.fn() } }));

const years = [{ id: 'year-1', name: '2025-2026' }, { id: 'year-2', name: '2026-2027' }];
const board = (year: string) => ({ id: `board-${year}`, name: 'CBSE', academicYearId: year, educationMediums: [] });
let store: ReturnType<typeof createStore>;
let requested: URL[];

function createStore() {
  return configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
}
function wrapper({ children }: { children: ReactNode }) { return <Provider store={store}>{children}</Provider>; }

beforeEach(() => {
  store = createStore();
  requested = [];
  clearCachedAuthSession();
  vi.stubGlobal('fetch', vi.fn(async (request: Request) => {
    const url = new URL(request.url);
    requested.push(url);
    const items = url.pathname.endsWith('/academic-year') ? years
      : url.pathname.endsWith('/education-board/hierarchy') ? [board(url.searchParams.get('academicYearId')!)]
        : [board('year-1')];
    return new Response(JSON.stringify({ items, totalCount: items.length }), { headers: { 'Content-Type': 'application/json' } });
  }));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.unstubAllGlobals();
});

it('loads a complete hierarchy for the selected year instead of filtering a default board page', async () => {
  const { result } = renderHook(() => useAcademicSetupWorkspace('year-2'), { wrapper });
  await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-2'));
  expect(requested.some((url) => url.pathname.endsWith('/education-board/hierarchy') && url.searchParams.get('academicYearId') === 'year-2')).toBe(true);
  expect(requested.some((url) => url.pathname.endsWith('/education-board'))).toBe(false);
});

it('reuses the derived hierarchy during expansion and cached data during a warm remount', async () => {
  const first = renderHook(() => useAcademicSetupWorkspace('year-1'), { wrapper });
  await waitFor(() => expect(first.result.current.tree).toHaveLength(1));
  const {tree} = first.result.current;
  act(() => first.result.current.toggleExpanded(tree[0].id));
  expect(first.result.current.tree).toBe(tree);
  first.unmount();
  const requestCount = requested.length;
  const second = renderHook(() => useAcademicSetupWorkspace('year-1'), { wrapper });
  await waitFor(() => expect(second.result.current.tree).toHaveLength(1));
  await new Promise((resolve) => setTimeout(resolve, 30));
  expect(requested).toHaveLength(requestCount);
});
