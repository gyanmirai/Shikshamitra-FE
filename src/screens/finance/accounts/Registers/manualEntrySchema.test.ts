import { it, expect, describe } from 'vitest';

import { manualEntrySchema } from './manualEntrySchema';

const entry = {
  name: 'Donation',
  counterparty: 'Parent association',
  categoryId: 'category',
  amount: '12.34',
  paymentMethod: 0,
  paymentDate: '2026-10-14',
  bankAccountId: '',
  paymentReference: '',
  notes: '',
};
describe('Accounts manual money validation', () => {
  it('accepts exact decimal cash money without a bank', async () => {
    expect(await manualEntrySchema.isValid(entry)).toBe(true);
  });
  it.each(['', '0', '-1', '12.345', '1e3', 'Infinity', '999999999999.999'])(
    'rejects invalid amount %s',
    async (amount) => {
      expect(await manualEntrySchema.isValid({ ...entry, amount })).toBe(false);
    }
  );
  it('requires a bank for every non-cash method', async () => {
    await Promise.all(
      [1, 2, 3, 4, 5, 6].map(async (paymentMethod) => {
        expect(await manualEntrySchema.isValid({ ...entry, paymentMethod })).toBe(false);
        expect(
          await manualEntrySchema.isValid({ ...entry, paymentMethod, bankAccountId: 'bank' })
        ).toBe(true);
      })
    );
  });
  it('rejects unsupported methods and missing payer/category', async () => {
    expect(await manualEntrySchema.isValid({ ...entry, paymentMethod: 7 })).toBe(false);
    expect(await manualEntrySchema.isValid({ ...entry, counterparty: '  ' })).toBe(false);
    expect(await manualEntrySchema.isValid({ ...entry, categoryId: '' })).toBe(false);
  });
});
