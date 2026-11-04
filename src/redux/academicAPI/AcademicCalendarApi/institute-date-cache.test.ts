import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { yearApi } from 'src/redux/year/yearApi';
import { it, vi, expect, describe } from 'vitest';
import { boardApi } from 'src/redux/board/boardApi';

import { academicCalendarApi } from './academic-calendar-api';
import { createCalendarCacheStore } from './calendar-cache-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('institute date changes refresh academic calendars', () => {
  it.each(['board', 'year'] as const)(
    '%s update refreshes saved calendar boundaries',
    async (kind) => {
      let endDate = '2027-05-30';
      mswServer.use(
        http.get('*/api/auth/session', () => HttpResponse.json(null)),
        http.get('*/api/academic/calendars', () =>
          HttpResponse.json({ items: [{ id: 'calendar', startDate: '2026-03-01', endDate }] })
        ),
        http.put(
          `*/api/app/${kind === 'board' ? 'education-board' : 'academic-year'}/institute`,
          () => {
            endDate = '2027-06-30';
            return HttpResponse.json({});
          }
        )
      );
      const store = createCalendarCacheStore();
      const args = { academicMediumId: 'english' };
      const subscription = store.dispatch(
        academicCalendarApi.endpoints.getCalendars.initiate(args)
      );
      try {
        await subscription.unwrap();
        expect(
          academicCalendarApi.endpoints.getCalendars.select(args)(store.getState()).data?.items[0]
            .endDate
        ).toBe('2027-05-30');
        const mutation =
          kind === 'board' ? boardApi.endpoints.updateBoard : yearApi.endpoints.updateYear;
        await store
          .dispatch(mutation.initiate({ id: 'institute', body: { endDate: '2027-06-30' } }))
          .unwrap();
        await waitFor(() => {
          expect(
            academicCalendarApi.endpoints.getCalendars.select(args)(store.getState()).data?.items[0]
              .endDate
          ).toBe('2027-06-30');
        });
      } finally {
        subscription.unsubscribe();
        store.dispatch(academicCalendarApi.util.resetApiState());
      }
    }
  );
});
