import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { reviewableReturn, maintenanceTarget } from './loan-maintenance-data.fixture';
import {
  base,
  enterSchoolDate,
  mountMaintenance,
  serveMaintenance,
} from './loan-maintenance.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('reviews only an eligible legacy return date without replacing confirmed issue/due evidence', async () => {
  serveMaintenance(reviewableReturn);
  const commands: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${base}/${maintenanceTarget.loanId}/dates/review`, async ({ request }) => {
      commands.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ detail: 'Date review requires another check.' }, { status: 400 });
    })
  );
  await mountMaintenance('reviewDates');
  await screen.findByLabelText('School return date');
  expect(screen.getByLabelText('School return date')).toHaveValue('');
  expect(screen.queryByLabelText('School issue date')).toBeNull();
  expect(screen.queryByLabelText('School due date')).toBeNull();
  expect(screen.getByText(reviewableReturn.rawReturnDate)).toBeVisible();
  enterSchoolDate('School return date', '2026-11-18');
  await userEvent.type(screen.getByLabelText(/Review reason/), 'C');
  await userEvent.paste('onfirmed the school return register.');
  await userEvent.click(screen.getByRole('button', { name: 'Confirm dates' }));
  await screen.findByText('Date review requires another check.');
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({
    schoolReturnDate: '2026-11-18',
    reason: 'Confirmed the school return register.',
    revision: 'saved-loan-revision',
    idempotencyKey: expect.any(String),
  });
  expect(commands[0]).not.toHaveProperty('schoolIssueDate');
  expect(commands[0]).not.toHaveProperty('schoolDueDate');
  expect(commands[0]).not.toHaveProperty('originalSchoolDueDate');
  expect(screen.getByLabelText('School return date')).toHaveValue('2026-11-18');
});

it('fails closed on a current false date-review capability despite the exact local grant', async () => {
  const requests = serveMaintenance();
  await mountMaintenance('reviewDates');
  await waitFor(() => expect(requests.some((entry) => entry.method === 'GET')).toBe(true));
  await screen.findByText(/No school dates are available for review/);
  expect(screen.getByRole('button', { name: 'Confirm dates' })).toBeDisabled();
  expect(screen.queryByLabelText('School return date')).toBeNull();
});
