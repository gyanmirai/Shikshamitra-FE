import { http } from 'msw';
import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { screen, within } from '@testing-library/react';

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

it('retains absent, null, unposted and review evidence without inventing currency or canonical zeros', async () => {
  const { financePosition: omitted, ...legacy } = chargeRecord;
  mswServer.use(
    http.get(chargeRoute, () =>
      chargePage([
        {
          ...legacy,
          id: 'old',
          bookTitle: 'Old server row',
          recordedCurrency: null,
          paymentStatus: 1,
        },
        {
          ...legacy,
          id: 'null',
          bookTitle: 'Null position row',
          recordedCurrency: null,
          financePosition: null,
        },
        {
          ...legacy,
          id: 'unposted',
          bookTitle: 'Unposted row',
          recordedCurrency: null,
          financePosition: {
            evidence: 0,
            approvalStatus: null,
            currency: null,
            amounts: null,
            reviewIssues: [],
          },
        },
        {
          ...legacy,
          id: 'review',
          bookTitle: 'Review row',
          recordedCurrency: null,
          paymentStatus: 2,
          financePosition: {
            evidence: 2,
            approvalStatus: null,
            currency: null,
            amounts: null,
            reviewIssues: ['Recorded source evidence needs review.'],
          },
        },
      ])
    )
  );
  mountMemberCharges();
  await screen.findByRole('row', { name: /Old server row/ });
  ['Old server row', 'Null position row', 'Unposted row', 'Review row'].forEach((title) => {
    const row = within(screen.getByRole('row', { name: new RegExp(title) }));
    expect(row.getByText(/Currency unconfirmed/i)).toBeVisible();
    expect(row.queryByText(/₹|INR|0\.00|Verified/)).toBeNull();
  });
  expect(
    within(screen.getByRole('row', { name: /Old server row/ })).getByText(
      /Finance position unavailable/i
    )
  ).toBeVisible();
  expect(
    within(screen.getByRole('row', { name: /Null position row/ })).getByText(
      /Finance position unavailable/i
    )
  ).toBeVisible();
  expect(
    within(screen.getByRole('row', { name: /Unposted row/ })).getByText('Unposted')
  ).toBeVisible();
  expect(
    within(screen.getByRole('row', { name: /Review row/ })).getByText('Needs review')
  ).toBeVisible();
  expect(screen.getByText('Recorded source evidence needs review.')).toBeVisible();
});
