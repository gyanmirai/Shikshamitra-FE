import { http } from 'msw';
import { it, vi, expect } from 'vitest';
import { fDate } from 'src/utils/format-time';
import { mswServer } from 'src/test/mswServer';
import { formatNumber } from 'src/utils/formate_number';
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

it('renders exact local assessment declarations and confirmed dates while preserving raw review evidence', async () => {
  mswServer.use(
    http.get(chargeRoute, () =>
      chargePage([
        {
          ...chargeRecord,
          id: 'paid',
          bookTitle: 'Paid local record',
          paymentStatus: 1,
          financePosition: null,
        },
        {
          ...chargeRecord,
          id: 'waived',
          bookTitle: 'Waived local record',
          paymentStatus: 2,
          amount: -2.125,
          amountText: '-2.125',
          recordedCurrency: null,
          schoolChargeDate: null,
          schoolDueDate: null,
          chargeDateProvenance: 0,
          dueDateProvenance: 0,
          financePosition: null,
        },
      ])
    )
  );
  mountMemberCharges();
  const paid = within(await screen.findByRole('row', { name: /Paid local record/ }));
  expect(paid.getByText('Paid declaration')).toBeVisible();
  expect(paid.getByText(formatNumber('100.75', 'INR', { fractionDigits: 2 }))).toBeVisible();
  expect(paid.getByText(fDate('2026-11-17')!)).toBeVisible();
  expect(paid.getByText(fDate('2026-11-24')!)).toBeVisible();
  const raw = within(screen.getByRole('row', { name: /Waived local record/ }));
  expect(raw.getByText('Waived declaration')).toBeVisible();
  expect(raw.getByText('-2.125')).toBeVisible();
  expect(raw.getByText(/Currency unconfirmed/i)).toBeVisible();
  expect(raw.getByText(/Assessment needs review/i)).toBeVisible();
  expect(raw.getByText('Unconfirmed')).toBeVisible();
  expect(raw.queryByText(/₹|INR|100.75/)).toBeNull();
});
