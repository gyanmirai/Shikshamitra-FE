import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';
import globalReducer, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import { useIssueReturnPage } from './useIssueReturnPage';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('year=year-1&page=2&pageSize=10'),
  usePathname: () => '/library/issued-books',
  useRouter: () => ({ replace: vi.fn() }),
}));
beforeEach(clearCachedAuthSession);
function setup() {
  const store = configureStore({
    reducer: {
      globalState: globalReducer,
      auth: () => ({ permissions: [{ name: 'Library.IssueReturn.View', isGranted: true }] }),
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  store.dispatch(setCurrentYear({ id: 'year-1' }));
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...renderHook(() => useIssueReturnPage(), { wrapper }) };
}
it('requests the selected server page instead of filtering the default first page', async () => {
  let requestedPage: string | null = null;
  mswServer.use(
    http.get('http://library.test/api/library/circulation/loans', ({ request }) => {
      requestedPage = new URL(request.url).searchParams.get('page');
      return HttpResponse.json({
        items: [{ transactionId: 'loan-page-2', role: 0, status: 0 }],
        totalCount: 12,
        currentPage: 2,
        pageSize: 10,
      });
    })
  );
  const { result } = setup();
  await waitFor(() => expect(result.current.currentData?.items[0].id).toBe('loan-page-2'));
  expect(requestedPage).toBe('2');
  expect(result.current.currentData?.totalCount).toBe(12);
});
it('retains the explicit historical year filter and page when the global current context changes', async () => {
  const requestedYears: (string | null)[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/circulation/loans', async ({ request }) => {
      const params = new URL(request.url).searchParams;
      const year = params.get('academicYearId');
      requestedYears.push(year);
      if (year === 'year-2') await delay(75);
      return HttpResponse.json({
        items: [{ transactionId: year, role: 0, status: 0 }],
        totalCount: 12,
        currentPage: Number(params.get('page')),
        pageSize: 10,
      });
    })
  );
  const { store, result } = setup();
  await waitFor(() => expect(result.current.currentData?.items[0].id).toBe('year-1'));
  act(() => {
    store.dispatch(setCurrentYear({ id: 'year-2' }));
  });
  expect(result.current.currentData?.items[0].id).toBe('year-1');
  expect(result.current.page).toBe(2);
  expect([...new Set(requestedYears)]).toEqual(['year-1']);
});
