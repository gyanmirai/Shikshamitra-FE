import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { fDate } from 'src/utils/format-time';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { libraryLoansApi } from 'src/redux/library/loans-api';
import { libraryCalendarApi } from 'src/redux/library/calendar-api';

import { maintenanceLoan, maintenanceTarget } from './loan-maintenance-data.fixture';
import {
  base,
  mountMaintenance,
  serveMaintenance,
  fillManualRenewal,
} from './loan-maintenance.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('refreshes the confirmed school-day action while retaining dirty renewal dates and the opening loan', async () => {
  serveMaintenance();
  let updated = false;
  mswServer.use(
    http.get(`${base}/${maintenanceTarget.loanId}`, () =>
      HttpResponse.json({
        ...maintenanceLoan,
        schoolContext: {
          ...maintenanceLoan.schoolContext,
          isConfirmed: true,
          requiresExplicitDate: false,
          unavailableReason: null,
          schoolToday: updated ? '2026-11-19' : '2026-11-18',
          confirmedTimeZoneId: updated ? 'Asia/Kolkata' : 'UTC',
        },
      })
    ),
    http.put('http://library.test/api/library/calendar/settings', () => {
      updated = true;
      return HttpResponse.json({
        timeZoneId: 'Asia/Kolkata',
        source: 'Library',
        needsConfiguration: false,
      });
    })
  );
  const { store } = await mountMaintenance('renew');
  await fillManualRenewal();
  await userEvent.type(screen.getByLabelText('Renewal reason'), 'R');
  await userEvent.paste('etain my entered dates.');
  await act(async () => {
    await store
      .dispatch(
        libraryCalendarApi.endpoints.updateLibraryCalendarSettings.initiate({
          timeZoneId: 'Asia/Kolkata',
        })
      )
      .unwrap();
  });
  await waitFor(() =>
    expect(
      libraryLoansApi.endpoints.getLibraryLoan.select(maintenanceTarget.loanId)(store.getState())
        .data?.schoolContext?.schoolToday
    ).toBe('2026-11-19')
  );
  expect(
    screen.getByText(`Confirmed school date: ${fDate('2026-11-19')} (Asia/Kolkata).`)
  ).toBeVisible();
  expect(screen.getByLabelText('School renewal date')).toHaveValue('2026-11-18');
  expect(screen.getByLabelText('New due date')).toHaveValue('2026-12-05');
  expect(screen.getByLabelText('Renewal reason')).toHaveValue('Retain my entered dates.');
  expect(
    libraryLoansApi.endpoints.getLibraryLoan.select(maintenanceTarget.loanId)(store.getState()).data
      ?.revision
  ).toBe(maintenanceLoan.revision);
  await userEvent.click(screen.getByRole('button', { name: 'Use school date' }));
  expect(screen.getByLabelText('School renewal date')).toHaveValue('2026-11-19');
  expect(screen.getByLabelText('New due date')).toHaveValue('2026-12-05');
  expect(screen.getByLabelText('Renewal reason')).toHaveValue('Retain my entered dates.');
});
