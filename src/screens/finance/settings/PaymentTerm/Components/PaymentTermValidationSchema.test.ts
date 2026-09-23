import { it, expect, describe } from 'vitest';

import { paymentTermValidationSchema } from './PaymentTermValidationSchema';

const board = {
  id: 'board-1',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
};

const validPaymentTerm = {
  boardId: board.id,
  paymentTermName: 'Annual Fees',
  paymentTermCode: 'ANNUAL-01',
  description: '',
  status: 'Draft',
  isDefaultTerm: false,
  invoiceCreationEnabled: true,
  demandGenerationRule: 'SpecificDate',
  demandOffsetDays: null,
  installments: [
    {
      sequence: 1,
      installmentName: 'Installment 1',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      demandDate: '2026-04-01',
      dueDate: '2026-04-15',
      allocationPercentage: 100,
      demandEnabled: true,
      gracePeriod: null,
    },
  ],
};

describe('paymentTermValidationSchema invoice creation', () => {
  it('requires an invoice date when schedule-wide invoice creation is enabled', async () => {
    const value = {
      ...validPaymentTerm,
      installments: [{ ...validPaymentTerm.installments[0], demandDate: null }],
    };

    await expect(paymentTermValidationSchema([board]).validate(value)).rejects.toThrow(
      'An invoice date on or before the due date is required when invoice creation is enabled'
    );
  });

  it('does not require an invoice date when schedule-wide invoice creation is disabled', async () => {
    const value = {
      ...validPaymentTerm,
      invoiceCreationEnabled: false,
      installments: [{ ...validPaymentTerm.installments[0], demandDate: null }],
    };

    await expect(paymentTermValidationSchema([board]).validate(value)).resolves.toBeDefined();
  });
});
