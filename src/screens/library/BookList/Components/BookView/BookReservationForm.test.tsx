import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import ReservationBookModal from './BookReservationForm';
import { reservationMember, reservationWrapper } from './reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('finds an eligible borrower with Reserve access without member-management or circulation-view grants', async () => {
  const requests: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/members', () => {
      requests.push('unrelated-members');
      return HttpResponse.json({ detail: 'Member management is not authorized.' }, { status: 403 });
    }),
    http.get('http://library.test/api/library/books/book-id/reservations', () =>
      HttpResponse.json([])
    ),
    http.get('http://library.test/api/library/reservations/members', ({ request }) => {
      const query = new URL(request.url).searchParams;
      requests.push(`reservation:${query.get('academicYearId')}:${query.get('search')}`);
      return HttpResponse.json({ items: [reservationMember], totalCount: 1 });
    })
  );
  render(
    <ReservationBookModal editData={{ id: 'book-id', title: 'Stories' }} onClose={vi.fn()} />,
    reservationWrapper()
  );
  const user = userEvent.setup();
  await user.type(screen.getByRole('combobox', { name: /Library member/i }), 'S/42#?');
  await user.click(await screen.findByRole('option', { name: /Asha Patel.*S\/42#\?.*Student/ }));
  expect(requests).toContain('reservation:year-id:S/42#?');
  expect(requests).not.toContain('unrelated-members');
});
