import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { libraryModuleType } from 'src/redux/tagTypes';
import { act, render, screen, waitFor } from '@testing-library/react';

import { ReservationCancelDialog } from './ReservationCancelDialog';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('keeps the opened revision and reason after a background refresh followed by a conflict', async () => {
  let revision = 'opened-revision';
  let sent: unknown;
  mswServer.use(
    http.get('http://library.test/api/library/reservations/reservation-id', () =>
      HttpResponse.json({ id: 'reservation-id', revision, canCancel: true })
    ),
    http.post(
      'http://library.test/api/library/reservations/reservation-id/cancel',
      async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json(
          { detail: 'Another operator changed this request.' },
          { status: 409 }
        );
      }
    )
  );
  const close = vi.fn();
  const harness = reservationWrapper();
  render(<ReservationCancelDialog reservationId="reservation-id" onClose={close} />, harness);
  const user = userEvent.setup();
  await waitFor(() => expect(screen.getByLabelText(/^Reason/)).toBeEnabled());
  await user.type(screen.getByLabelText(/^Reason/), 'Family no longer needs this request');
  revision = 'refreshed-revision';
  act(() => {
    harness.store.dispatch(api.util.invalidateTags([libraryModuleType.bookReservation]));
  });
  await waitFor(() =>
    expect(JSON.stringify(harness.store.getState()[api.reducerPath].queries)).toContain(
      'refreshed-revision'
    )
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/Another operator changed/)).toBeInTheDocument();
  expect(sent).toEqual({
    academicYearId: 'year-id',
    revision: 'opened-revision',
    reason: 'Family no longer needs this request',
  });
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('Family no longer needs this request');
  expect(close).not.toHaveBeenCalled();
  await act(async () => {
    await Promise.all(harness.store.dispatch(api.util.getRunningQueriesThunk()));
  });
});

it('blocks duplicate submission and every dismissal while cancellation is pending', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  mswServer.use(
    http.get('http://library.test/api/library/reservations/reservation-id', () =>
      HttpResponse.json({ id: 'reservation-id', revision: 'opened-revision', canCancel: true })
    ),
    http.post('http://library.test/api/library/reservations/reservation-id/cancel', async () => {
      requests += 1;
      await pending;
      return HttpResponse.json(
        { detail: 'Please retry after reviewing the request.' },
        { status: 409 }
      );
    })
  );
  const close = vi.fn();
  const harness = reservationWrapper();
  render(<ReservationCancelDialog reservationId="reservation-id" onClose={close} />, harness);
  const user = userEvent.setup();
  await waitFor(() => expect(screen.getByLabelText(/^Reason/)).toBeEnabled());
  await user.type(screen.getByLabelText(/^Reason/), 'Keep this cancellation reason');
  try {
    await user.dblClick(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(requests).toBe(1));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(close).not.toHaveBeenCalled();
  } finally {
    release();
  }
  expect(await screen.findByText(/Please retry after reviewing/)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Reason/)).toHaveValue('Keep this cancellation reason');
  await act(async () => {
    await Promise.all(harness.store.dispatch(api.util.getRunningQueriesThunk()));
  });
});
