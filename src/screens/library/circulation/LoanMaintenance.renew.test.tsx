import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import {
  renewalPreview,
  maintenanceLoan,
  maintenanceTarget,
} from './loan-maintenance-data.fixture';
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

it('renews an exact staff loan with an independently selected year and explicit dates, retaining a rejected draft', async () => {
  const requests = serveMaintenance();
  const commands: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${base}/${maintenanceTarget.loanId}/renew`, async ({ request }) => {
      commands.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ detail: 'The saved renewal plan changed.' }, { status: 409 });
    })
  );
  await mountMaintenance('renew');
  await screen.findByLabelText('School renewal date');
  expect(screen.getByLabelText('School renewal date')).toHaveValue('');
  expect(screen.getByRole('combobox', { name: /Renewal academic year/ })).not.toHaveTextContent(
    '2026–2027'
  );
  expect(screen.getByRole('combobox', { name: /Renewal academic year/ })).not.toHaveTextContent(
    '2027–2028'
  );
  await fillManualRenewal();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Renew' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Renew' }));
  await screen.findByText('The saved renewal plan changed.');
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({
    academicYearId: 'renewal-year',
    schoolRenewalDate: '2026-11-18',
    requestedDueDate: '2026-12-05',
    revision: 'reviewed-renewal-plan',
    idempotencyKey: expect.any(String),
  });
  expect(screen.getByLabelText('New due date')).toHaveValue('2026-12-05');
  expect(requests.some((entry) => entry.method === 'GET')).toBe(true);
  expect(screen.getByRole('button', { name: 'Renew' })).toBeDisabled();
});

it('uses an automatic server preview and requires its changed-calendar explanation', async () => {
  const loan = {
    ...maintenanceLoan,
    role: 0,
    schoolContext: {
      ...maintenanceLoan.schoolContext,
      isConfirmed: true,
      requiresExplicitDate: false,
      schoolToday: '2026-11-18',
      confirmedTimeZoneId: 'Asia/Kolkata',
    },
    policy: {
      ...maintenanceLoan.policy,
      role: 0,
      terms: { ...maintenanceLoan.policy.terms, dueDateMode: 1 },
    },
  } satisfies LibraryLoan;
  serveMaintenance(loan);
  const commands: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${base}/${maintenanceTarget.loanId}/renewal-preview`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        ...renewalPreview(body),
        loan,
        canRenew: true,
        newSchoolDueDate: '2026-12-01',
        currentSchoolTimeZoneId: 'Asia/Kolkata',
        requiresCalendarChangeAcknowledgment: true,
      });
    }),
    http.post(`${base}/${maintenanceTarget.loanId}/renew`, async ({ request }) => {
      commands.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ loan, wasReplay: false, assessmentIds: [] });
    })
  );
  await mountMaintenance('renew');
  await screen.findByLabelText(/Calendar change reason/);
  expect(screen.getByLabelText('School renewal date')).toHaveValue('2026-11-18');
  expect(screen.queryByLabelText('New due date')).toBeNull();
  expect(screen.getByRole('button', { name: 'Renew' })).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/Calendar change reason/), 'R');
  await userEvent.paste('eviewed the current school calendar.');
  await userEvent.click(screen.getByRole('button', { name: 'Renew' }));
  await waitFor(() => expect(commands).toHaveLength(1));
  expect(commands[0]).toMatchObject({
    schoolRenewalDate: '2026-11-18',
    requestedDueDate: null,
    revision: 'reviewed-renewal-plan',
    calendarChangeReason: 'Reviewed the current school calendar.',
  });
  expect(commands[0]).not.toHaveProperty('academicYearId', 'recorded-year');
});
