import { describe, expect, it } from 'vitest';

import { manualEntrySchema } from './accounts/Registers/manualEntrySchema';
import { getIncomeFormSchema } from './IncomeTracking/Components/IncomeValidationSchema';
import { getExpenseFormSchema } from './ExpenseTracking/component/ExpenseValidationSchema';
import { receiptBookValidationSchema } from './settings/receipt-book/validationSchema';
import { feeHeadValidationSchema } from './settings/feeHead/Components/FeeHeadValidationSchema';
import { bankAccountValidationSchema } from './settings/BankAccManagement/Components/BankValidationSchema';
import { feeCategoryValidationSchema } from './settings/FeeCategory/Components/FeeCategoryValidation';
import { paymentTermValidationSchema } from './settings/PaymentTerm/Components/PaymentTermValidationSchema';
import { incomeCategoryValidationSchema } from './settings/IncomeCategories/Components/IncomeCategoryValidationSchema';
import { expenseCategoryValidationSchema } from './settings/ExpenseCategories/Components/ExpenseCategoryValidationSchema';
import { concessionTypeValidationSchema } from './settings/ConcessionTypeSetting/Components/ConcessionValidationSchema';
import { createUpdateChargeValidationSchema } from './ChargesManagement/Components/UpdateChargeForm/UpdateChargeValidation';

const year = { startDate: '2026-04-01', endDate: '2027-03-31' };
const cases = [
  [
    'concession type',
    concessionTypeValidationSchema(new Set()),
    'name',
    (name: string) => ({ name }),
  ],
  [
    'document requirement',
    concessionTypeValidationSchema(new Set()),
    'documents[0].documentName',
    (name: string) => ({ documents: [{ documentName: name }] }),
  ],
  [
    'income category',
    incomeCategoryValidationSchema(new Set()),
    'name',
    (name: string) => ({ name }),
  ],
  [
    'expense category',
    expenseCategoryValidationSchema(new Set()),
    'name',
    (name: string) => ({ name }),
  ],
  ['fee category', feeCategoryValidationSchema(new Set()), 'name', (name: string) => ({ name })],
  ['fee head', feeHeadValidationSchema(new Set()), 'name', (name: string) => ({ name })],
  ['receipt book', receiptBookValidationSchema, 'name', (name: string) => ({ name })],
  ['bank', bankAccountValidationSchema, 'bankName', (name: string) => ({ bankName: name })],
  [
    'bank branch',
    bankAccountValidationSchema,
    'branchName',
    (name: string) => ({ branchName: name }),
  ],
  [
    'account holder',
    bankAccountValidationSchema,
    'accountHolderName',
    (name: string) => ({ accountHolderName: name }),
  ],
  [
    'payment term',
    paymentTermValidationSchema(),
    'paymentTermName',
    (name: string) => ({ paymentTermName: name }),
  ],
  [
    'installment',
    paymentTermValidationSchema(),
    'installments[0].installmentName',
    (name: string) => ({ installments: [{ installmentName: name }] }),
  ],
  [
    'charge',
    createUpdateChargeValidationSchema(year, false),
    'chargeName',
    (name: string) => ({ chargeName: name }),
  ],
  ['income', getIncomeFormSchema(year), 'name', (name: string) => ({ name })],
  ['expense', getExpenseFormSchema(year), 'name', (name: string) => ({ name })],
  ['manual entry', manualEntrySchema, 'name', (name: string) => ({ name })],
] as const;

describe.each(cases)('%s name validation', (_label, schema, path, values) => {
  it.each(['School @ Fees', 'Tuition-Fee', 'Bus_Fee', 'Fee 🎓', 'Fees (2026)'])(
    'blocks special characters before submission: %s',
    async (name) => {
      await expect(schema.validateAt(path, values(name))).rejects.toThrow(
        'can only contain letters, numbers, and spaces'
      );
    }
  );

  it.each(['School Fees 2026', 'शिक्षा शुल्क २', 'École Fees'])(
    'allows supported names: %s',
    async (name) => {
      await expect(schema.validateAt(path, values(name))).resolves.toBe(name);
    }
  );
});

it('keeps identifier and description formats separate from name validation', async () => {
  await expect(
    paymentTermValidationSchema().validateAt('paymentTermCode', {
      paymentTermCode: 'ANNUAL-01',
    })
  ).resolves.toBe('ANNUAL-01');
  await expect(
    concessionTypeValidationSchema(new Set()).validateAt('description', {
      description: 'Fees (2026): 50% concession.',
    })
  ).resolves.toBe('Fees (2026): 50% concession.');
  await expect(
    bankAccountValidationSchema.validateAt('upiId', {
      upiId: 'school.fees@bank',
    })
  ).resolves.toBe('school.fees@bank');
});
