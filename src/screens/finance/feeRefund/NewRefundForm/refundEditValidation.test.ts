import { it, expect, describe } from 'vitest';

import {
  buildRefundInitialValues,
  buildRefundValidationSchema,
} from './initialValuesAndValidation';

describe('refund edit validation', () => {
  const method = 'Bank Transfer (NEFT/RTGS/IMPS)';
  const details = {
    beneficiaryName: 'Test Parent',
    beneficiaryBankName: 'Test Bank',
    beneficiaryAccountNumber: '********9012',
    ifscCode: 'TEST0001234',
  };
  const values = () => ({
    ...buildRefundInitialValues({ refundType: 'partial' }),
    boardId: 'board',
    mediumId: 'medium',
    standardId: 'class',
    divisionId: 'division',
    studentId: 'student',
    refundMethod: method,
    notes: 'Corrected refund',
    paymentDetails: details,
    feeHeadRefunds: [
      {
        feeHeadId: 'fee',
        months: [
          {
            month: 'June',
            dueFeeId: 'due',
            sourceReceiptId: 'receipt',
            sourceAllocationId: 'allocation',
            amount: 200,
          },
        ],
      },
    ],
  });

  it('retains a saved partial refund type', () => {
    expect(buildRefundInitialValues({ refundType: 'partial' }).refundType).toBe('partial');
    expect(buildRefundInitialValues().refundType).toBe('full');
  });

  it('accepts an unchanged masked account only for the same saved payment method', async () => {
    await expect(
      buildRefundValidationSchema({}, { method, paymentDetails: details }).validate(values())
    ).resolves.toMatchObject({ paymentDetails: details });
    await expect(buildRefundValidationSchema({}).validate(values())).rejects.toThrow();
    await expect(
      buildRefundValidationSchema({}, { method: 'UPI', paymentDetails: details }).validate(values())
    ).rejects.toThrow();
  });

  it('validates replacements instead of accepting a changed masked identifier', async () => {
    const schema = buildRefundValidationSchema({}, { method, paymentDetails: details });
    await expect(
      schema.validate({
        ...values(),
        paymentDetails: { ...details, beneficiaryAccountNumber: '********0000' },
      })
    ).rejects.toThrow();
    await expect(
      schema.validate({
        ...values(),
        paymentDetails: { ...details, beneficiaryAccountNumber: '123456789012' },
      })
    ).resolves.toMatchObject({ paymentDetails: { beneficiaryAccountNumber: '123456789012' } });
  });
});
