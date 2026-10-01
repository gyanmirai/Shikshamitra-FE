import { it, expect, describe } from 'vitest';

import { getIncomeFormSchema } from './IncomeValidationSchema';

const schema = getIncomeFormSchema({ startDate: '2026-04-01', endDate: '2027-03-31' });

describe('income entry validation', () => {
  it('allows an empty optional category tag list', async () => {
    await expect(schema.validateAt('categoryTags', { categoryTags: [] })).resolves.toEqual([]);
  });

  it('accepts paise but rejects fractions smaller than a paisa', async () => {
    await expect(schema.validateAt('amount', { amount: 100.25 })).resolves.toBe(100.25);
    await expect(schema.validateAt('amount', { amount: 100.255 })).rejects.toThrow(
      'Use no more than two decimal places'
    );
  });
});
