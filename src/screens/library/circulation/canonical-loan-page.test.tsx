import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { waitFor, renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { loanReadDto } from './loan-read-fixture';
import { useIssueReturnPage } from './useIssueReturnPage';

const location = vi.hoisted(() => ({ query: '', replace: vi.fn() }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(location.query),
  usePathname: () => '/library/issued-books',
  useRouter: () => ({ replace: location.replace }),
}));
beforeEach(() => {
  location.query = '';
  location.replace.mockReset();
  clearCachedAuthSession();
});
function setup(currentYear: { id: string } | null = { id: 'current-year' }) {
  const store = configureStore({
    reducer: {
      auth: () => ({ permissions: [{ name: 'Library.IssueReturn.View', isGranted: true }] }),
      globalState: () => ({ currentYear }),
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  return renderHook(() => useIssueReturnPage(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
}
function handlers(requests: URL[]) {
  const response = ({ request }: { request: Request }) => {
    requests.push(new URL(request.url));
    return HttpResponse.json({
      items: [loanReadDto],
      totalCount: 12,
      currentPage: 2,
      pageSize: 10,
      totalPages: 2,
    });
  };
  mswServer.use(
    http.get('http://library.test/api/library/issue-returns', response),
    http.get('http://library.test/api/library/circulation/loans', response)
  );
}
it('defaults to all authorized recorded loan years without injecting the global current year', async () => {
  const requests: URL[] = [];
  handlers(requests);
  const { result } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(requests[0].pathname).toBe('/api/library/circulation/loans');
  expect(requests[0].searchParams.has('academicYearId')).toBe(false);
});
it('preserves an explicit stored-year/as-of filter and requested page independently of current context', async () => {
  location.query = 'year=recorded-year&asOfDate=2026-11-17&page=2&pageSize=10';
  const requests: URL[] = [];
  handlers(requests);
  const { result } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(requests[0].searchParams.get('academicYearId')).toBe('recorded-year');
  expect(requests[0].searchParams.get('asOfDate')).toBe('2026-11-17');
  expect(requests[0].searchParams.get('page')).toBe('2');
});
it('can load authorized historical loans without selecting a global current academic year', () => {
  handlers([]);
  expect(setup(null).result.current.isUninitialized).toBe(false);
});
it('preserves the all-year default when advancing to another server page', async () => {
  handlers([]);
  const { result } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  result.current.onPage(2, 10);
  expect(location.replace).toHaveBeenCalledWith('/library/issued-books?page=2&pageSize=10', {
    scroll: false,
  });
});
