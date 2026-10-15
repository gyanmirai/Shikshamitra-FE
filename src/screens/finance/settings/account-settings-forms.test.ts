import { it, expect, describe } from 'vitest';

import { getBankAccountInitialValues } from './BankAccManagement/Components/bankInitialValues';
import { bankAccountValidationSchema } from './BankAccManagement/Components/BankValidationSchema';
import { getIncomeCategoryInitialValues } from './IncomeCategories/Components/IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategories/Components/IncomeCategoryValidationSchema';
import { getExpenseCategoryInitialValues } from './ExpenseCategories/Components/ExpenseCategoryInitialValues';
import { expenseCategoryValidationSchema } from './ExpenseCategories/Components/ExpenseCategoryValidationSchema';

describe('simplified Accounts forms', () => {
  it.each([
    ['Income', incomeCategoryValidationSchema, 40],
    ['Expense', expenseCategoryValidationSchema, 128],
  ] as const)(
    'enforces %s category limits and preserves business text',
    async (_kind, schema, max) => {
      await expect(schema(new Set()).validate({ name: '   ', tags: [] })).rejects.toThrow(
        'required'
      );
      await expect(
        schema(new Set()).validate({ name: 'A'.repeat(max), tags: [] })
      ).resolves.toBeDefined();
      await expect(
        schema(new Set()).validate({ name: 'A'.repeat(max + 1), tags: [] })
      ).rejects.toThrow('at most');
      const result = await schema(new Set()).validate({
        name: '  Class 10 शुल्क & Fees  ',
        tags: [],
      });
      expect(result.name).toBe('Class 10 शुल्क & Fees');
    }
  );

  it('blocks case/space duplicate edits while allowing the unchanged name', async () => {
    const schema = incomeCategoryValidationSchema(new Set(['fees', 'transport']), {
      name: 'Fees',
    } as any);
    await expect(schema.validate({ name: ' fees ', tags: [] })).resolves.toBeDefined();
    await expect(schema.validate({ name: ' TRANSPORT ', tags: [] })).rejects.toThrow(
      'already exists'
    );
  });

  it.each(['bankName', 'branchName', 'accountHolderName', 'purpose'])(
    'validates the %s save boundary beyond HTML maxlength',
    async (field) => {
      const limit = field === 'purpose' ? 500 : 100;
      const values = {
        ...getBankAccountInitialValues(),
        bankName: 'School Bank 10 बैंक',
        branchName: 'Main',
        accountHolderName: 'School',
        accountNumber: '000001',
        ifscCode: 'SBIN0123456',
      };
      await expect(
        bankAccountValidationSchema.validate({ ...values, [field]: 'A'.repeat(limit) })
      ).resolves.toBeDefined();
      await expect(
        bankAccountValidationSchema.validate({ ...values, [field]: 'A'.repeat(limit + 1) })
      ).rejects.toThrow('at most');
    }
  );
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
