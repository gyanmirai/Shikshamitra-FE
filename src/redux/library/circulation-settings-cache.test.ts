import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { loanReadDto } from 'src/screens/library/circulation/loan-read-fixture';
import {
  canonicalCopy,
  canonicalReturn,
  canonicalIssuePlan,
} from 'src/screens/library/circulation/canonical-test-fixtures';

import { libraryPoliciesApi } from './policies-api';
import { libraryCalendarApi } from './calendar-api';
import { libraryCirculationApi } from './circulation-api';
import { libraryCopyHistoryApi } from './copy-history-api';
import { libraryCirculationReadApi } from './circulation-read-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
const plan = {
  copyId: 'copy-id',
  memberId: 'person-id',
  academicYearId: 'year-id',
  issueDate: '2026-11-17',
  requestedDueDate: '2026-11-30',
};
it.each(['calendar', 'policy'] as const)(
  'refreshes subscribed operational data after a completed %s setting change',
  async (setting) => {
    const counts = { preview: 0, copy: 0, returned: 0, list: 0, history: 0 };
    let version = 0;
    const page = () => ({
      items: [
        {
          ...loanReadDto,
          isOverdue: version ? false : null,
          overdueDateSource: version ? 'ConfirmedLibraryClock' : 'Unavailable',
        },
      ],
      totalCount: 1,
      currentPage: 1,
      pageSize: 20,
    });
    mswServer.use(
      http.post('http://library.test/api/library/circulation/issues/preview', () => {
        counts.preview += 1;
        return HttpResponse.json({
          ...canonicalIssuePlan,
          ...plan,
          revision: `preview-${version}`,
        });
      }),
      http.get('http://library.test/api/library/circulation/lookups/copy', () => {
        counts.copy += 1;
        return HttpResponse.json(canonicalCopy);
      }),
      http.get('http://library.test/api/library/circulation/lookups/return', () => {
        counts.returned += 1;
        return HttpResponse.json(canonicalReturn);
      }),
      http.get('http://library.test/api/library/circulation/loans', () => {
        counts.list += 1;
        return HttpResponse.json(page());
      }),
      http.get('http://library.test/api/library/books/book-id/copies/copy-id/history', () => {
        counts.history += 1;
        return HttpResponse.json(page());
      }),
      http.put('http://library.test/api/library/calendar/settings', () => {
        version += 1;
        return HttpResponse.json({
          timeZoneId: 'UTC',
          source: 'Library',
          needsConfiguration: false,
        });
      }),
      http.post('http://library.test/api/library/policies/version-id/publish', () => {
        version += 1;
        return HttpResponse.json({ id: 'version-id', status: 1 });
      })
    );
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    const active = [
      store.dispatch(libraryCirculationApi.endpoints.getCirculationIssuePlan.initiate(plan)),
      store.dispatch(libraryCirculationApi.endpoints.getCirculationCopy.initiate({ scan: 'scan' })),
      store.dispatch(
        libraryCirculationApi.endpoints.getCirculationReturn.initiate({ scan: 'scan' })
      ),
      store.dispatch(
        libraryCirculationReadApi.endpoints.getLibraryLoanPage.initiate({ page: 1, pageSize: 20 })
      ),
      store.dispatch(
        libraryCopyHistoryApi.endpoints.getLibraryCopyHistory.initiate({
          bookId: 'book-id',
          copyId: 'copy-id',
          page: 1,
          pageSize: 20,
        })
      ),
    ];
    try {
      await Promise.all(active.map((read) => read.unwrap()));
      if (setting === 'calendar')
        await store
          .dispatch(
            libraryCalendarApi.endpoints.updateLibraryCalendarSettings.initiate({
              timeZoneId: 'UTC',
            })
          )
          .unwrap();
      else
        await store
          .dispatch(
            libraryPoliciesApi.endpoints.publishLibraryPolicy.initiate({
              versionId: 'version-id',
              concurrencyStamp: 'draft-revision',
            })
          )
          .unwrap();
      const affected =
        setting === 'calendar'
          ? (Object.keys(counts) as (keyof typeof counts)[])
          : (['preview'] as const);
      await waitFor(() => affected.forEach((key) => expect(counts[key]).toBe(2)));
      expect(
        libraryCirculationApi.endpoints.getCirculationIssuePlan.select(plan)(store.getState()).data
          ?.revision
      ).toBe('preview-1');
      if (setting === 'calendar')
        expect(
          libraryCirculationReadApi.endpoints.getLibraryLoanPage.select({ page: 1, pageSize: 20 })(
            store.getState()
          ).data?.items[0].overdueDateSource
        ).toBe('ConfirmedLibraryClock');
    } finally {
      active.forEach((read) => read.unsubscribe());
    }
  }
);
