import { it, expect, describe } from 'vitest';

import { getAccountHeadInitialValues } from './AccountHeadMaster/Components/AccountHeadInitialValues';
import { AccountHeadValidationSchema } from './AccountHeadMaster/Components/AccountHeadValidationSchema';
import { getIncomeCategoryInitialValues } from './IncomeCategories/Components/IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategories/Components/IncomeCategoryValidationSchema';
import { getExpenseCategoryInitialValues } from './ExpenseCategories/Components/ExpenseCategoryInitialValues';
import { expenseCategoryValidationSchema } from './ExpenseCategories/Components/ExpenseCategoryValidationSchema';

describe('simplified Accounts forms', () => {
  it('accepts an Account Head with only name and type', async () => {
    const values = { ...getAccountHeadInitialValues(), headName: 'Tuition Income', headType: 'Income' };
    await expect(AccountHeadValidationSchema.validate(values)).resolves.toBeDefined();
    ['headCode', 'currencyCode', 'postingAllowed', 'isControlAccount', 'effectiveFrom', 'effectiveTo'].forEach((key) => {
      expect(values).not.toHaveProperty(key);
    });
  });

  it.each([
    ['Income', getIncomeCategoryInitialValues, incomeCategoryValidationSchema],
    ['Expense', getExpenseCategoryInitialValues, expenseCategoryValidationSchema],
  ] as const)('accepts %s categories without code or dates, but still requires a default head', async (_kind, initialValues, schema) => {
    const values = { ...initialValues(), name: 'School Fees', tags: ['Fees'], defaultAccountHeadId: 'head-1' };
    await expect(schema(new Set()).validate(values)).resolves.toBeDefined();
    ['code', 'effectiveFrom', 'effectiveTo'].forEach((key) => expect(values).not.toHaveProperty(key));
    await expect(schema(new Set()).validate({ ...values, defaultAccountHeadId: '' })).rejects.toThrow('account head is required');
  });
});
