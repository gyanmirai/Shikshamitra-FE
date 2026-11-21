import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';

import { libraryCalendarApi } from './calendar-api';
import { libraryCirculationMembersApi } from './circulation-members-api';
import { memberManagementApi } from './libraryMembers/memberManagementApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('refreshes subscribed member and borrower statistics after a completed Library timezone save', async () => {
  const counts = { list: 0, details: 0, borrower: 0 };
  let confirmed = false;
  const statistics = () => ({
    currentIssue: 1,
    overdueReturnBooks: confirmed ? 1 : 0,
    reservedBooks: 0,
    overdueClassificationAvailable: confirmed,
    unknownDueDateCount: 0,
    overdueAsOfDate: confirmed ? '2026-11-18' : null,
    overdueDateSource: confirmed ? 'ConfirmedLibraryClock' : 'Unavailable',
  });
  const member = () => ({
    id: 'member-id',
    memberName: 'Recorded Member',
    role: 'Student',
    statistics: statistics(),
  });
  mswServer.use(
    http.get('http://library.test/api/library/members', () => {
      counts.list += 1;
      return HttpResponse.json({ items: [member()], totalCount: 1, currentPage: 1, pageSize: 20 });
    }),
    http.get('http://library.test/api/library/members/member-id', () => {
      counts.details += 1;
      return HttpResponse.json(member());
    }),
    http.get('http://library.test/api/library/circulation/members/resolve', () => {
      counts.borrower += 1;
      return HttpResponse.json({ ...member(), role: 0, isEligibleForIssue: true });
    }),
    http.put('http://library.test/api/library/calendar/settings', () => {
      confirmed = true;
      return HttpResponse.json({ timeZoneId: 'UTC', source: 'Library', needsConfiguration: false });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const active = [
    store.dispatch(memberManagementApi.endpoints.getLibraryMembers.initiate({})),
    store.dispatch(
      memberManagementApi.endpoints.getMemberDetails.initiate({ memberId: 'member-id' })
    ),
    store.dispatch(
      libraryCirculationMembersApi.endpoints.resolveCirculationMember.initiate({
        identifier: 'S42',
      })
    ),
  ];
  try {
    await Promise.all(active.map((request) => request.unwrap()));
    await store
      .dispatch(
        libraryCalendarApi.endpoints.updateLibraryCalendarSettings.initiate({ timeZoneId: 'UTC' })
      )
      .unwrap();
    await waitFor(() => Object.values(counts).forEach((count) => expect(count).toBe(2)));
    expect(
      memberManagementApi.endpoints.getMemberDetails.select({ memberId: 'member-id' })(
        store.getState()
      ).data?.overdueClassificationAvailable
    ).toBe(true);
    expect(
      libraryCirculationMembersApi.endpoints.resolveCirculationMember.select({ identifier: 'S42' })(
        store.getState()
      ).data?.statistics.overdueReturnBooks
    ).toBe(1);
  } finally {
    active.forEach((request) => request.unsubscribe());
  }
});
