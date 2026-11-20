import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { libraryLoansApi } from 'src/redux/library/loans-api';
import { guardAcademicContextChange } from 'src/hooks/academic-context-change';

import { reviewableReturn, maintenanceTarget } from './loan-maintenance-data.fixture';
import {
  base,
  enterSchoolDate,
  mountMaintenance,
  serveMaintenance,
  fillManualRenewal,
} from './loan-maintenance.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('waits for a fresh exact-loan read and retains the opened revision and dirty values after a background change', async () => {
  serveMaintenance(reviewableReturn);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get(`${base}/${maintenanceTarget.loanId}`, async () => {
      await gate;
      return HttpResponse.json({ ...reviewableReturn, revision: 'fresh-opening' });
    })
  );
  const sent: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${base}/${maintenanceTarget.loanId}/dates/review`, async ({ request }) => {
      sent.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json(
        { detail: 'Keep the entered evidence for review.' },
        { status: 400 }
      );
    })
  );
  const { store } = await mountMaintenance('reviewDates', undefined, async (targetStore) => {
    await targetStore.dispatch(
      libraryLoansApi.util.upsertQueryData('getLibraryLoan', maintenanceTarget.loanId, {
        ...reviewableReturn,
        revision: 'old-warm-cache',
      })
    );
  });
  expect(screen.queryByLabelText('School return date')).toBeNull();
  await act(async () => {
    release();
  });
  await screen.findByLabelText('School return date');
  enterSchoolDate('School return date', '2026-11-18');
  await userEvent.type(screen.getByLabelText(/Review reason/), 'School register evidence.');
  await userEvent.click(screen.getByRole('button', { name: 'Confirm dates' }));
  await screen.findByText('Keep the entered evidence for review.');
  expect(sent[0]).toMatchObject({ revision: 'fresh-opening' });
  mswServer.use(
    http.get(`${base}/${maintenanceTarget.loanId}`, () =>
      HttpResponse.json({ ...reviewableReturn, revision: 'other-operator' })
    )
  );
  await act(async () => {
    await store
      .dispatch(
        libraryLoansApi.endpoints.getLibraryLoan.initiate(maintenanceTarget.loanId, {
          forceRefetch: true,
        })
      )
      .unwrap();
  });
  expect(screen.getByLabelText('School return date')).toHaveValue('2026-11-18');
  expect(screen.getByLabelText(/Review reason/)).toHaveValue('School register evidence.');
  expect(screen.getByRole('button', { name: 'Confirm dates' })).toBeDisabled();
  expect(sent).toHaveLength(1);
});

it('retains a complete uncertain renewal for unchanged replay and blocks dismissal and context loss', async () => {
  serveMaintenance();
  const sent: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${base}/${maintenanceTarget.loanId}/renew`, async ({ request }) => {
      sent.push((await request.json()) as Record<string, unknown>);
      return sent.length === 1
        ? HttpResponse.error()
        : HttpResponse.json({
            loan: { id: maintenanceTarget.loanId },
            wasReplay: true,
            assessmentIds: [],
          });
    })
  );
  await mountMaintenance('renew');
  await fillManualRenewal();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Renew' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Renew' }));
  await screen.findByText(/previous submission could not be confirmed/i);
  expect(screen.getByLabelText('New due date')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  const leave = vi.fn();
  expect(guardAcademicContextChange(leave)).toBe(true);
  expect(leave).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Retry same submission' }));
  await waitFor(() => expect(sent).toHaveLength(2));
  expect(sent[1]).toEqual(sent[0]);
  expect(sent[0].idempotencyKey).toEqual(expect.any(String));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
