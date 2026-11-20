import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';

import { ReservationWorkspace } from './ReservationWorkspace';
import {
  reservationItem,
  reservationWrapper,
} from '../BookList/Components/BookView/reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('uses real selected-year server pages and hides write actions from View-only readers', async () => {
  const calls: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/reservations', ({ request }) => {
      const params = new URL(request.url).searchParams;
      calls.push(
        `${params.get('academicYearId')}:${params.get('page')}:${params.get('pageSize')}:${params.get('includeHistory')}`
      );
      const item =
        params.get('page') === '1'
          ? reservationItem
          : { ...reservationItem, id: 'other-request', memberName: 'Ravi Singh' };
      return HttpResponse.json({ items: [item], totalCount: 21 });
    })
  );
  const harness = reservationWrapper(['Library.AllBooks.View']);
  render(
    <ReservationWorkspace book={{ id: 'book-id', title: 'Stories' }} onClose={vi.fn()} />,
    harness
  );
  expect(await screen.findByText(/Asha Patel/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Cancel reservation for/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Reserve book' })).not.toBeInTheDocument();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(await screen.findByText(/Ravi Singh/)).toBeInTheDocument();
  expect(screen.queryByText(/Asha Patel/)).not.toBeInTheDocument();
  expect(calls).toContain('year-id:1:10:false');
  expect(calls).toContain('year-id:2:10:false');
  await user.click(screen.getByLabelText('Include completed and cancelled requests'));
  await waitFor(() => expect(calls).toContain('year-id:1:10:true'));
  await act(async () => {
    await Promise.all(harness.store.dispatch(api.util.getRunningQueriesThunk()));
  });
});
