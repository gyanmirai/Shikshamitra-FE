import { it, vi, expect } from 'vitest';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import {
  renewalPreview,
  maintenanceLoan,
} from 'src/screens/library/circulation/loan-maintenance-data.fixture';

import { libraryLoansApi } from './loans-api';
import { libraryCalendarApi } from './calendar-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('refreshes subscribed exact-loan school context and renewal evidence after a completed calendar change', async () => {
  let version = 0;
  const reads = { loan: 0, preview: 0 };
  const body = {
    academicYearId: 'renewal-year',
    schoolRenewalDate: '2026-11-18',
    requestedDueDate: '2026-12-05',
  };
  const input = { loanId: maintenanceLoan.id, body };
  mswServer.use(
    http.get(`http://library.test/api/library/circulation/loans/${maintenanceLoan.id}`, () => {
      reads.loan += 1;
      return HttpResponse.json({
        ...maintenanceLoan,
        schoolContext: {
          ...maintenanceLoan.schoolContext,
          isConfirmed: Boolean(version),
          schoolToday: version ? '2026-11-18' : null,
          confirmedTimeZoneId: version ? 'UTC' : null,
        },
      });
    }),
    http.post(
      `http://library.test/api/library/circulation/loans/${maintenanceLoan.id}/renewal-preview`,
      () => {
        reads.preview += 1;
        return HttpResponse.json({ ...renewalPreview(body), revision: `calendar-plan-${version}` });
      }
    ),
    http.put('http://library.test/api/library/calendar/settings', () => {
      version += 1;
      return HttpResponse.json({ timeZoneId: 'UTC', source: 'Library', needsConfiguration: false });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const active = [
    store.dispatch(libraryLoansApi.endpoints.getLibraryLoan.initiate(maintenanceLoan.id)),
    store.dispatch(libraryLoansApi.endpoints.getLibraryRenewalPlan.initiate(input)),
  ];
  try {
    await Promise.all(active.map((query) => query.unwrap()));
    await store
      .dispatch(
        libraryCalendarApi.endpoints.updateLibraryCalendarSettings.initiate({ timeZoneId: 'UTC' })
      )
      .unwrap();
    await waitFor(() => expect(reads).toEqual({ loan: 2, preview: 2 }));
    expect(
      libraryLoansApi.endpoints.getLibraryLoan.select(maintenanceLoan.id)(store.getState()).data
        ?.schoolContext?.isConfirmed
    ).toBe(true);
    expect(
      libraryLoansApi.endpoints.getLibraryRenewalPlan.select(input)(store.getState()).data?.revision
    ).toBe('calendar-plan-1');
  } finally {
    active.forEach((query) => query.unsubscribe());
  }
});
