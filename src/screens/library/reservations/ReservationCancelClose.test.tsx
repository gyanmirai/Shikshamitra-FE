import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ReservationCancelDialog } from './ReservationCancelDialog';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('keeps a dirty reason until the operator explicitly discards it', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/reservations/reservation-id', () =>
      HttpResponse.json({ id: 'reservation-id', revision: 'opened-revision', canCancel: true })
    )
  );
  const close = vi.fn();
  render(
    <ReservationCancelDialog reservationId="reservation-id" onClose={close} />,
    reservationWrapper()
  );
  const user = userEvent.setup();
  await waitFor(() => expect(screen.getByLabelText(/^Reason/)).toBeEnabled());
  await user.type(screen.getByLabelText(/^Reason/), 'Retain this reason');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(
    await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' })
  ).toBeInTheDocument();
  expect(close).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('Retain this reason');
  await user.click(screen.getByRole('button', { name: 'close' }));
  await user.click(await screen.findByRole('button', { name: 'Discard changes' }));
  expect(close).toHaveBeenCalledOnce();
});
