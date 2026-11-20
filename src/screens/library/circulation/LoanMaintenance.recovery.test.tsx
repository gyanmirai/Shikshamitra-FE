import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { libraryLoansApi } from 'src/redux/library/loans-api';

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

it('retries a failed current-record read without losing evidence or adopting another revision', async () => {
  serveMaintenance(reviewableReturn);
  let state = 'ready';
  const commands: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(`${base}/${maintenanceTarget.loanId}`, () =>
      state === 'failed'
        ? HttpResponse.json(
            { detail: 'The current loan read is temporarily unavailable.' },
            { status: 503 }
          )
        : HttpResponse.json({
            ...reviewableReturn,
            revision: state === 'changed' ? 'other-operator' : reviewableReturn.revision,
          })
    ),
    http.post(`${base}/${maintenanceTarget.loanId}/dates/review`, async ({ request }) => {
      commands.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ detail: 'Keep this school register evidence.' }, { status: 400 });
    })
  );
  const { store } = await mountMaintenance('reviewDates');
  await screen.findByLabelText('School return date');
  enterSchoolDate('School return date', '2026-11-18');
  await userEvent.type(screen.getByLabelText(/Review reason/), 'E');
  await userEvent.paste('vidence from the school register.');
  state = 'failed';
  await act(async () => {
    await expect(
      store
        .dispatch(
          libraryLoansApi.endpoints.getLibraryLoan.initiate(maintenanceTarget.loanId, {
            subscribe: false,
            forceRefetch: true,
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 503 });
  });
  await screen.findByText('The current loan read is temporarily unavailable.');
  expect(screen.getByRole('button', { name: 'Confirm dates' })).toBeDisabled();
  state = 'ready';
  await userEvent.click(screen.getByRole('button', { name: 'Retry current record' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm dates' })).toBeEnabled());
  expect(screen.getByLabelText('School return date')).toHaveValue('2026-11-18');
  expect(screen.getByLabelText(/Review reason/)).toHaveValue('Evidence from the school register.');
  await userEvent.click(screen.getByRole('button', { name: 'Confirm dates' }));
  await screen.findByText('Keep this school register evidence.');
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({
    revision: reviewableReturn.revision,
    schoolReturnDate: '2026-11-18',
  });
  state = 'failed';
  await act(async () => {
    await expect(
      store
        .dispatch(
          libraryLoansApi.endpoints.getLibraryLoan.initiate(maintenanceTarget.loanId, {
            subscribe: false,
            forceRefetch: true,
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 503 });
  });
  state = 'changed';
  await userEvent.click(screen.getByRole('button', { name: 'Retry current record' }));
  await screen.findByRole('button', { name: 'Reload for review' });
  expect(screen.getByRole('button', { name: 'Confirm dates' })).toBeDisabled();
  expect(screen.getByLabelText('School return date')).toHaveValue('2026-11-18');
  expect(screen.getByLabelText(/Review reason/)).toHaveValue('Evidence from the school register.');
  expect(commands).toHaveLength(1);
});
