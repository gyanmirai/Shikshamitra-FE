import { http } from 'msw';
import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';

import { chargeRecord } from './member-charge-position.data';
import { chargePage, chargeRoute, mountMemberCharges } from './member-charge-position.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => null,
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('pages the actual requested member charge history with server totals and no unsupported controls', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get(chargeRoute, ({ request, params }) => {
      const url = new URL(request.url);
      requests.push(url);
      expect(params.memberId).toBe('canonical-member');
      const page = Number(url.searchParams.get('page') || 1);
      return chargePage(
        page === 1
          ? Array.from({ length: 20 }, (_, index) => ({
              ...chargeRecord,
              id: `first-${index}`,
              bookTitle: `First page ${index + 1}`,
            }))
          : [
              {
                ...chargeRecord,
                id: 'last-assessment',
                bookTitle: 'Last recorded assessment',
              },
            ],
        21,
        page
      );
    })
  );
  const fixture = mountMemberCharges();
  await screen.findByText('First page 1');
  expect(screen.getByText(/of 21/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(await screen.findByRole('row', { name: /Last recorded assessment/ })).toBeVisible();
  expect(screen.queryByRole('row', { name: /First page 1 / })).toBeNull();
  expect(requests.map((url) => url.searchParams.get('page'))).toEqual(['1', '2']);
  expect(requests.every((url) => url.searchParams.get('pageSize') === '20')).toBe(true);
  expect(requests.every((url) => !url.searchParams.has('academicYearId'))).toBe(true);
  expect(screen.queryByPlaceholderText(/Search/i)).toBeNull();
  expect(screen.queryByRole('button', { name: /Export|Filter/i })).toBeNull();
  expect(
    screen.queryByRole('button', {
      name: /Collect|Waive|Refund|Receipt|Post/i,
    })
  ).toBeNull();
  expect(fixture.forbidden).toEqual([]);
});

it('keeps saved assessment-year history when global context changes without inventing a year filter', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get(chargeRoute, ({ request }) => {
      requests.push(new URL(request.url));
      return chargePage([{ ...chargeRecord }]);
    })
  );
  const fixture = mountMemberCharges();
  await screen.findByRole('row', { name: /Recorded Library Title/ });
  expect(screen.getByText(/History spans authorized recorded academic years/i)).toBeVisible();
  expect(screen.getByText('recorded-assessment-year')).toBeVisible();
  expect(requests[0].searchParams.has('academicYearId')).toBe(false);
  await act(async () => {
    fixture.store.dispatch({ type: 'member-charge-test/change-year' });
  });
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(screen.getByText('recorded-assessment-year')).toBeVisible();
});
