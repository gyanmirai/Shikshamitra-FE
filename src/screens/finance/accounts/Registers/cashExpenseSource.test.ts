import { it, expect, describe } from 'vitest';

import { manualEntrySchema } from './manualEntrySchema';

const entry = {
  name: 'Supplies',
  counterparty: 'Vendor',
  categoryId: 'category',
  amount: '12.34',
  paymentMethod: 0,
  paymentDate: '2026-10-20',
  cashPaymentDateTime: '2026-10-20T15:45:00+05:30',
  bankAccountId: '',
  paymentReference: 'BILL-1',
};
describe('pooled cash expense validation', () => {
  it.each(['', '   '])(
    'allows cash expenses without a payment reference (%j)',
    async (paymentReference) => {
      const cashExpense = { ...entry, cashCollectionId: 'collection' };
      expect(
        await manualEntrySchema.isValid(
          { ...cashExpense, paymentReference },
          { context: { direction: 'expense' } }
        )
      ).toBe(true);
      expect(
        await manualEntrySchema.isValid(
          { ...entry, paymentReference },
          { context: { direction: 'income' } }
        )
      ).toBe(true);
      expect(
        await manualEntrySchema.isValid(
          { ...entry, paymentReference, paymentMethod: 3, bankAccountId: 'bank' },
          { context: { direction: 'expense' } }
        )
      ).toBe(true);
    }
  );
  it('allows cash expenses without selecting a receipt', async () => {
    expect(await manualEntrySchema.isValid(entry, { context: { direction: 'expense' } })).toBe(
      true
    );
    expect(
      await manualEntrySchema.isValid(
        { ...entry, cashCollectionId: 'collection' },
        { context: { direction: 'expense' } }
      )
    ).toBe(true);
    expect(await manualEntrySchema.isValid(entry, { context: { direction: 'income' } })).toBe(true);
    expect(
      await manualEntrySchema.isValid(
        { ...entry, paymentMethod: 3, bankAccountId: 'bank' },
        { context: { direction: 'expense' } }
      )
    ).toBe(true);
  });
});
