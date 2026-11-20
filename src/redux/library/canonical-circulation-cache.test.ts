import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';

import { libraryLoansApi } from './loans-api';
import { libraryCirculationApi } from './circulation-api';
import { paths, makeStore, subscriptions } from './library-cache-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it.each(['issue', 'return'] as const)(
  'refreshes subscribed copy, member, charge and dashboard records after canonical %s',
  async (operation) => {
    const counts = Object.fromEntries(Object.keys(paths).map((key) => [key, 0]));
    mswServer.use(
      http.get('http://library.test/api/library/*', ({ request }) => {
        const key = Object.keys(paths).find(
          (name) => paths[name as keyof typeof paths] === new URL(request.url).pathname
        );
        if (!key) return HttpResponse.json({ detail: 'Unexpected read' }, { status: 500 });
        counts[key] += 1;
        if (key === 'detail')
          return HttpResponse.json({ id: 'book-id', title: 'Book', copies: [] });
        if (key === 'member')
          return HttpResponse.json({ id: 'member-id', role: 0, statistics: {} });
        if (key === 'dashboard') return HttpResponse.json({ generatedAt: '2026-11-17T10:00:00Z' });
        return HttpResponse.json({ items: [], totalCount: 0, pageSize: 20, currentPage: 1 });
      }),
      http.post('http://library.test/api/library/circulation/loans*', () =>
        HttpResponse.json({ loan: { id: 'loan-id' }, wasReplay: false, assessmentIds: [] })
      )
    );
    const store = makeStore();
    const active = subscriptions(store);
    try {
      await Promise.all(active.map((read) => read.unwrap()));
      if (operation === 'issue')
        await store
          .dispatch(
            libraryCirculationApi.endpoints.checkoutLibraryLoan.initiate({
              copyId: 'copy-id',
              memberId: 'member-id',
              academicYearId: 'year-id',
              issueDate: '2026-11-17',
              requestedDueDate: null,
              revision: 'preview-revision',
              idempotencyKey: 'issue-attempt',
            })
          )
          .unwrap();
      else
        await store
          .dispatch(
            libraryLoansApi.endpoints.returnLibraryLoan.initiate({
              loanId: 'loan-id',
              body: {
                copyId: 'copy-id',
                schoolReturnDate: '2026-11-17',
                copyStatus: 0,
                assessments: [],
                revision: 'loan-revision',
                idempotencyKey: 'return-attempt',
              },
            })
          )
          .unwrap();
      await waitFor(() => Object.keys(counts).forEach((name) => expect(counts[name]).toBe(2)));
    } finally {
      active.forEach((read) => read.unsubscribe());
    }
  }
);
