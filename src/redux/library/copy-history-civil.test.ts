import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { loanReadDto } from 'src/screens/library/circulation/loan-read-fixture';

import { libraryCopyHistoryApi } from './copy-history-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it('preserves civil/raw/provenance metadata and forwards explicit copy-history year/as-of filters before server paging', async () => {
  mswServer.use(
    http.get(
      'http://library.test/api/library/books/book-id/copies/copy-id/history',
      ({ request }) => {
        const query = new URL(request.url).searchParams;
        expect(query.get('academicYearId')).toBe('recorded-year');
        expect(query.get('asOfDate')).toBe('2026-11-17');
        expect(query.get('page')).toBe('2');
        return HttpResponse.json({
          items: [loanReadDto],
          totalCount: 12,
          currentPage: 2,
          pageSize: 10,
        });
      }
    )
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const params = {
    bookId: 'book-id',
    copyId: 'copy-id',
    page: 2,
    pageSize: 10,
    academicYearId: 'recorded-year',
    asOfDate: '2026-11-17',
  };
  const read = store.dispatch(
    libraryCopyHistoryApi.endpoints.getLibraryCopyHistory.initiate(params)
  );
  try {
    const result = await read.unwrap();
    expect(result.items[0]).toMatchObject({
      schoolIssueDate: '2026-11-17',
      rawIssueDate: loanReadDto.rawIssueDate,
      issueDateProvenance: 1,
      academicYearId: 'recorded-year',
      isOverdue: null,
      overdueDateSource: 'Unavailable',
      memberDisplaySource: 'LoanSnapshot',
    });
    expect(result.totalCount).toBe(12);
  } finally {
    read.unsubscribe();
  }
});
