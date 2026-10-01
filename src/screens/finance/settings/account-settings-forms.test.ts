import { it, expect, describe } from 'vitest';

import { getBankAccountInitialValues } from './BankAccManagement/Components/bankInitialValues';
import { bankAccountValidationSchema } from './BankAccManagement/Components/BankValidationSchema';
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
    const values = { ...initialValues(), name: 'School Fees', tags: [], defaultAccountHeadId: 'head-1' };
    await expect(schema(new Set()).validate(values)).resolves.toBeDefined();
    ['code', 'effectiveFrom', 'effectiveTo'].forEach((key) => expect(values).not.toHaveProperty(key));
    await expect(schema(new Set()).validate({ ...values, defaultAccountHeadId: '' })).rejects.toThrow('account head is required');
  });

  it('creates a bank account without asking for an internal code, while requiring bank and asset details', async () => {
    const values = {
      ...getBankAccountInitialValues(),
      bankName: 'School Bank',
      branchName: 'Main Branch',
      accountHolderName: 'Example School',
      accountNumber: '123456789012',
      ifscCode: 'SBIN0123456',
      accountHeadId: 'head-1',
    };
    expect(values).not.toHaveProperty('code');
    await expect(bankAccountValidationSchema.validate(values)).resolves.toBeDefined();
    await expect(bankAccountValidationSchema.validate({ ...values, accountHeadId: '' })).rejects.toThrow('Asset account head is required');
  });
});
