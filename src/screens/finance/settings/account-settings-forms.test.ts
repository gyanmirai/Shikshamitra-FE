import { it, expect, describe } from 'vitest';

import { getBankAccountInitialValues } from './BankAccManagement/Components/bankInitialValues';
import { bankAccountValidationSchema } from './BankAccManagement/Components/BankValidationSchema';
import { getIncomeCategoryInitialValues } from './IncomeCategories/Components/IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategories/Components/IncomeCategoryValidationSchema';
import { getExpenseCategoryInitialValues } from './ExpenseCategories/Components/ExpenseCategoryInitialValues';
import { expenseCategoryValidationSchema } from './ExpenseCategories/Components/ExpenseCategoryValidationSchema';

describe('simplified Accounts forms', () => {
  it.each([
    ['Income', getIncomeCategoryInitialValues, incomeCategoryValidationSchema],
    ['Expense', getExpenseCategoryInitialValues, expenseCategoryValidationSchema],
  ] as const)(
    'accepts %s categories without code or dates, without account heads',
    async (_kind, initialValues, schema) => {
      const values = { ...initialValues(), name: 'School Fees', tags: [] };
      await expect(schema(new Set()).validate(values)).resolves.toBeDefined();
      ['code', 'effectiveFrom', 'effectiveTo'].forEach((key) =>
        expect(values).not.toHaveProperty(key)
      );
      expect(values).not.toHaveProperty('defaultAccountHeadId');
    }
  );

  it('creates a bank account without asking for an internal code, while requiring actual bank details', async () => {
    const values = {
      ...getBankAccountInitialValues(),
      bankName: 'School Bank',
      branchName: 'Main Branch',
      accountHolderName: 'Example School',
      accountNumber: '123456789012',
      ifscCode: 'SBIN0123456',
    };
    expect(values).not.toHaveProperty('code');
    await expect(bankAccountValidationSchema.validate(values)).resolves.toBeDefined();
    expect(values).not.toHaveProperty('accountHeadId');
  });
});
