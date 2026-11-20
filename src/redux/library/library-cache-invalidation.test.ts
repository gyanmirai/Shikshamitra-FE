import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';

import { booksApi } from './bookList/bookList-api';
import { paths, mutate, makeStore, subscriptions } from './library-cache-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it.each([
  {
    operation: 'issue',
    affected: ['detail', 'copies', 'member', 'borrowed', 'reserved', 'history', 'dashboard'],
  },
  {
    operation: 'return',
    affected: [
      'detail',
      'copies',
      'member',
      'borrowed',
      'reserved',
      'charges',
      'history',
      'dashboard',
    ],
  },
  { operation: 'status', affected: ['detail', 'copies', 'dashboard'] },
  { operation: 'charge', affected: ['member', 'charges', 'dashboard'] },
  { operation: 'reservation', affected: ['detail', 'copies', 'member', 'reserved', 'dashboard'] },
] as const)(
  'refreshes subscribed affected records after a completed $operation',
  async ({ operation, affected }) => {
    const counts = Object.fromEntries(Object.keys(paths).map((key) => [key, 0]));
    let revision = 0;
    mswServer.use(
      http.get('http://library.test/api/library/*', ({ request }) => {
        const path = new URL(request.url).pathname;
        const key = Object.keys(paths).find((name) => paths[name as keyof typeof paths] === path);
        if (!key) return HttpResponse.json({ detail: 'Unexpected read' }, { status: 500 });
        counts[key] += 1;
        if (key === 'detail')
          return HttpResponse.json({ id: 'book-id', title: `Revision ${revision}`, copies: [] });
        if (key === 'member')
          return HttpResponse.json({
            id: 'member-id',
            memberName: 'Asha Patel',
            role: 'Student',
            statistics: { currentIssue: revision },
          });
        if (key === 'dashboard')
          return HttpResponse.json({
            generatedAt: revision ? '2026-11-16T10:01:00Z' : '2026-11-16T10:00:00Z',
          });
        return HttpResponse.json({ items: [], totalCount: 0, pageSize: 20, currentPage: 1 });
      }),
      http.post('http://library.test/api/library/*', () => {
        revision += 1;
        return HttpResponse.json({ id: 'saved-id' });
      }),
      http.put('http://library.test/api/library/*', () => {
        revision += 1;
        return HttpResponse.json({ id: 'saved-id' });
      })
    );
    const store = makeStore();
    const active = subscriptions(store);
    try {
      await Promise.all(active.map((request) => request.unwrap()));
      await mutate(store, operation);
      await waitFor(() => affected.forEach((name) => expect(counts[name]).toBe(2)));
      if (affected.some((name) => name === 'detail'))
        expect(
          booksApi.endpoints.viewBookDetails.select({ bookId: 'book-id' })(store.getState()).data
            ?.title
        ).toBe('Revision 1');
    } finally {
      active.forEach((request) => request.unsubscribe());
    }
  }
);
