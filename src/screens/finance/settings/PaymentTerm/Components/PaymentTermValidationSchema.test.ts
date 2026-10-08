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
      'Invoice date is required'
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

  it.each(['2026-03-31', '2026-04-16'])('rejects manually entered invoice date outside start and due bounds: %s', async (demandDate) => {
    const value = { ...validPaymentTerm, installments: [{ ...validPaymentTerm.installments[0], demandDate }] };
    await expect(paymentTermValidationSchema([board]).validateAt('installments', value)).rejects.toMatchObject({
      inner: expect.arrayContaining([expect.objectContaining({ path: 'installments[0].demandDate' })]),
    });
  });

  it('accepts backfilled dates inside the installment period', async () => {
    await expect(paymentTermValidationSchema([board]).validate(validPaymentTerm)).resolves.toBeDefined();
  });

  it('limits offset to the smallest gap and names the affected installment', async () => {
    const value = { ...validPaymentTerm, demandGenerationRule: 'XDaysBeforeDue', demandOffsetDays: 99 };
    await expect(paymentTermValidationSchema([board]).validateAt('demandOffsetDays', value)).rejects.toThrow('Max 14 days for Installment 1');
    await expect(paymentTermValidationSchema([board]).validate({ ...value, demandOffsetDays: 14 })).resolves.toBeDefined();
  });

  it('revalidates offset against changed installment dates', async () => {
    const value = { ...validPaymentTerm, demandGenerationRule: 'XDaysBeforeDue', demandOffsetDays: 14, installments: [{ ...validPaymentTerm.installments[0], startDate: '2026-04-14' }] };
    await expect(paymentTermValidationSchema([board]).validateAt('demandOffsetDays', value)).rejects.toThrow('Max 1 days');
  });

  it('rejects fractional offset days', async () => {
    await expect(paymentTermValidationSchema([board]).validateAt('demandOffsetDays', { ...validPaymentTerm, demandGenerationRule: 'XDaysBeforeDue', demandOffsetDays: 1.5 })).rejects.toThrow('whole number');
  });

  it('continues to allow due dates after coverage ends within the board period', async () => {
    await expect(paymentTermValidationSchema([board]).validate({ ...validPaymentTerm, installments: [{ ...validPaymentTerm.installments[0], endDate: '2026-04-10' }] })).resolves.toBeDefined();
  });

  it('uses academic board start as an additional invoice lower bound', async () => {
    const value = { ...validPaymentTerm, installments: [{ ...validPaymentTerm.installments[0], startDate: '2026-03-01', demandDate: '2026-03-15' }] };
    await expect(paymentTermValidationSchema([board]).validateAt('installments', value, { abortEarly: false })).rejects.toMatchObject({
      inner: expect.arrayContaining([expect.objectContaining({ path: 'installments[0].demandDate', message: 'Invoice date must be on or after 01/04/2026' })]),
    });
  });
});
