import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { LibraryBookStatus } from 'src/enums/library-book-status';

import { libraryCopyHistoryApi } from './copy-history-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('loads real scoped copy history by stable book/copy IDs and preserves server pagination', async () => {
  expect(libraryCopyHistoryApi.endpoints).toHaveProperty('getLibraryCopyHistory');
  mswServer.use(
    http.get(
      'http://library.test/api/library/books/book-id/copies/copy-id/history',
      ({ request }) => {
        expect(new URL(request.url).searchParams.get('page')).toBe('2');
        expect(new URL(request.url).searchParams.get('pageSize')).toBe('10');
        return HttpResponse.json({
          items: [
            {
              transactionId: 'loan-id',
              memberId: 'canonical-member',
              memberName: 'Asha Patel',
              bookId: 'book-id',
              copyId: 'copy-id',
              role: 1,
              accessionNo: 'વાંચન/#42',
              issueDate: '2026-10-01',
              dueDate: '2026-10-15',
              returnDate: '2026-10-14',
              status: 1,
            },
          ],
          totalCount: 12,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        });
      }
    )
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const result = await store
    .dispatch(
      libraryCopyHistoryApi.endpoints.getLibraryCopyHistory.initiate({
        bookId: 'book-id',
        copyId: 'copy-id',
        page: 2,
        pageSize: 10,
      })
    )
    .unwrap();
  expect(result.items[0]).toMatchObject({
    transactionId: 'loan-id',
    memberId: 'canonical-member',
    copyId: 'copy-id',
    role: 'Staff',
    status: LibraryBookStatus.Returned,
  });
  expect(result.totalCount).toBe(12);
  expect(result.currentPage).toBe(2);
});
