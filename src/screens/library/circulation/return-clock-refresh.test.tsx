import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, waitFor, renderHook } from '@testing-library/react';
import { libraryCalendarApi } from 'src/redux/library/calendar-api';

import { useReturnDraft } from './useReturnDraft';
import { canonicalReturn } from './canonical-test-fixtures';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it('refreshes confirmed school context while keeping the entered date and opened loan revision frozen', async () => {
  let updated = false;
  mswServer.use(
    http.get('http://library.test/api/library/circulation/lookups/return', () => {
      const schoolContext = {
        ...canonicalReturn.schoolContext,
        schoolToday: updated ? '2026-11-18' : '2026-11-17',
        confirmedTimeZoneId: 'UTC',
        isConfirmed: true,
        requiresExplicitDate: false,
        unavailableReason: null,
      };
      return HttpResponse.json({
        ...canonicalReturn,
        schoolContext,
        copy: { ...canonicalReturn.copy, schoolContext },
        loan: {
          ...canonicalReturn.loan,
          revision: updated ? 'latest-revision' : 'opened-revision',
        },
      });
    }),
    http.put('http://library.test/api/library/calendar/settings', () => {
      updated = true;
      return HttpResponse.json({ timeZoneId: 'UTC', source: 'Library', needsConfiguration: false });
    })
  );
  const fixture = makeCirculationTestWrapper();
  const { result } = renderHook(() => useReturnDraft('scan', true, vi.fn()), fixture);
  await waitFor(() =>
    expect(result.current.lookup.currentData?.schoolContext.schoolToday).toBe('2026-11-17')
  );
  await act(async () => {
    await result.current.formik.setFieldValue('returnDate', dayjs('2026-11-17'));
  });
  await act(async () => {
    await fixture.store
      .dispatch(
        libraryCalendarApi.endpoints.updateLibraryCalendarSettings.initiate({ timeZoneId: 'UTC' })
      )
      .unwrap();
  });
  await waitFor(() =>
    expect(result.current.lookup.data?.schoolContext.schoolToday).toBe('2026-11-18')
  );
  expect(result.current.lookup.currentData?.schoolContext.schoolToday).toBe('2026-11-18');
  expect(result.current.lookup.currentData?.loan.revision).toBe('opened-revision');
  expect(result.current.formik.values.returnDate?.format('YYYY-MM-DD')).toBe('2026-11-17');
  expect(result.current.formik.dirty).toBe(true);
});
