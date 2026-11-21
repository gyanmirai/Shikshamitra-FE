import { http } from 'msw';
import { it, vi, expect } from 'vitest';
import { mswServer } from 'src/test/mswServer';
import { formatNumber } from 'src/utils/formate_number';
import { screen, within, fireEvent } from '@testing-library/react';

import { chargePage, chargeRoute, mountMemberCharges } from './member-charge-position.fixture';
import {
  chargeRecord,
  cashPosition,
  bankPosition,
  amountLabels,
} from './member-charge-position.data';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => null,
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('keeps all eight supplied cash/waiver and bank position amounts distinct without Finance queries', async () => {
  mswServer.use(
    http.get(chargeRoute, () =>
      chargePage([
        {
          ...chargeRecord,
          id: 'cash',
          bookTitle: 'Cash position',
          financePosition: cashPosition,
        },
        {
          ...chargeRecord,
          id: 'bank',
          bookTitle: 'Bank position',
          financePosition: bankPosition,
        },
      ])
    )
  );
  const fixture = mountMemberCharges();
  await screen.findByRole('row', { name: /Cash position/ });
  [
    ['Cash position', cashPosition],
    ['Bank position', bankPosition],
  ].forEach(([title, value]) => {
    const position = value as typeof cashPosition;
    const row = within(screen.getByRole('row', { name: new RegExp(String(title)) }));
    ['collectibleAmountText', 'pendingVerificationAmountText'].forEach((key) => {
      const field = row.getByText(amountLabels[key as keyof typeof amountLabels]).parentElement!;
      expect(
        within(field).getByText(
          formatNumber(position.amounts[key as keyof typeof amountLabels], 'INR', {
            fractionDigits: 2,
          })
        )
      ).toBeVisible();
    });
    expect(row.getByText('Original amount')).not.toBeVisible();
    const disclosure = row.getByText('More amounts');
    expect(disclosure.tagName).toBe('SUMMARY');
    fireEvent.click(disclosure);
    Object.entries(amountLabels).forEach(([key, label]) => {
      const field = row.getByText(label).parentElement!;
      expect(
        within(field).getByText(
          formatNumber(position.amounts[key as keyof typeof amountLabels], 'INR', {
            fractionDigits: 2,
          })
        )
      ).toBeVisible();
    });
    expect(row.getByText('Verified')).toBeVisible();
    expect(row.getByText(chargeRecord.chargeType)).toBeVisible();
  });
  expect(fixture.forbidden).toEqual([]);
  expect(
    screen.queryByRole('button', {
      name: /Collect|Waive|Refund|Receipt|Post/i,
    })
  ).toBeNull();
});
