import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { schoolIdentityActions } from '../types';
import { useIdentityCopy } from './use-identity-copy';
import { useSchoolIdentity } from './use-school-identity';

const navigation = vi.hoisted(() => ({ search: '', push: vi.fn() }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(navigation.search),
  usePathname: () => '/setting/school-identity',
  useRouter: () => ({ push: navigation.push }),
}));

const board = (year: string) => ({
  id: `board-${year}`,
  academicYearId: year,
  name: 'CBSE',
  educationMediums: [{ id: `medium-${year}`, educationBoardId: `board-${year}`, name: 'English' }],
});
let requested: URL[];
let store: ReturnType<typeof createStore>;
function createStore() {
  return configureStore({
    reducer: {
      auth: () => ({
        permissionsInitialized: true,
        permissions: Object.values(schoolIdentityActions).map((name) => ({
          name,
          isGranted: true,
        })),
      }),
      globalState: () => ({
        currentYear: { id: 'year-1' },
        currentBoard: board('year-1'),
        currentMedium: { id: 'medium-year-1', educationBoardId: 'board-year-1' },
      }),
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
}
function Wrapper({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}

beforeEach(() => {
  store = createStore();
  requested = [];
  navigation.push.mockClear();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-year', () =>
      HttpResponse.json({
        items: [
          { id: 'year-1', name: '2025-2026' },
          { id: 'year-2', name: '2026-2027' },
        ],
      })
    ),
    http.get('*/api/app/education-board', ({ request }) => {
      requested.push(new URL(request.url));
      return HttpResponse.json({ items: [board('year-1')] });
    }),
    http.get('*/api/app/education-board/hierarchy', ({ request }) => {
      const url = new URL(request.url);
      requested.push(url);
      return HttpResponse.json({ items: [board(url.searchParams.get('academicYearId')!)] });
    }),
    http.get('*/api/app/education-board/board-year-2', ({ request }) => {
      requested.push(new URL(request.url));
      return HttpResponse.json(board('year-2'));
    }),
    http.get('*/api/institute-setup/school-identity', () => HttpResponse.json({ canManage: true }))
  );
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
});

it('loads only the selected year hierarchy and resolves boards outside the generic default page', async () => {
  navigation.search = 'scope=overrides&academicYearId=year-2&boardId=board-year-2';
  const { result } = renderHook(useSchoolIdentity, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.valid).toBe(true));
  expect(result.current.boards[0].id).toBe('board-year-2');
  expect(requested.map((url) => url.pathname)).toEqual(['/api/app/education-board/hierarchy']);
  expect(requested[0].searchParams.get('academicYearId')).toBe('year-2');
});

it('resolves a board-only deep link through its authorized detail before loading that year', async () => {
  navigation.search = 'scope=overrides&boardId=board-year-2';
  const { result } = renderHook(useSchoolIdentity, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.valid).toBe(true));
  expect(result.current.selectedYear).toBe('year-2');
  expect(requested.map((url) => url.pathname)).toEqual([
    '/api/app/education-board/board-year-2',
    '/api/app/education-board/hierarchy',
  ]);
  expect(requested.at(-1)?.searchParams.get('academicYearId')).toBe('year-2');
});

it('uses shell metadata to navigate to the current context from a different selected year', async () => {
  navigation.search = 'scope=overrides&academicYearId=year-2&boardId=board-year-2';
  const { result } = renderHook(useSchoolIdentity, { wrapper: Wrapper });
  await waitFor(() => expect(result.current.valid).toBe(true));
  act(() => result.current.selectCurrentContext());
  expect(navigation.push).toHaveBeenCalledWith(expect.stringContaining('academicYearId=year-1'), {
    scroll: false,
  });
  expect(navigation.push).toHaveBeenCalledWith(expect.stringContaining('mediumId=medium-year-1'), {
    scroll: false,
  });
});

it('loads copy-source choices from their own selected year', async () => {
  const { result } = renderHook(
    () => useIdentityCopy({ boardId: 'board-year-1' }, 'version', vi.fn()),
    { wrapper: Wrapper }
  );
  expect(result.current.boards).toEqual([]);
  act(() => result.current.selectSource('year-2', '', ''));
  await waitFor(() => expect(result.current.boards[0]?.id).toBe('board-year-2'));
  expect(requested.map((url) => url.pathname)).toEqual(['/api/app/education-board/hierarchy']);
  expect(requested[0].searchParams.get('academicYearId')).toBe('year-2');
});
