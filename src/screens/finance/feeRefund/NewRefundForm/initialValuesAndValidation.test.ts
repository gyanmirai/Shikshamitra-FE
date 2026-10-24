import { it, expect, describe } from 'vitest';

import {
  buildRefundInitialValues,
  buildRefundValidationSchema,
} from './initialValuesAndValidation';

const request = (amount: string | number) => ({
  ...buildRefundInitialValues({
    boardId: 'board',
    mediumId: 'medium',
    standardId: 'class',
    divisionId: 'division',
    studentId: 'student',
    refundMethod: 'Cash',
    paymentDetails: { receivedBy: 'Parent' },
  }),
  feeHeadRefunds: [
    {
      feeHeadId: 'FH1',
      months: [{ month: 'June', dueFeeId: 'due-1', sourceReceiptId: 'receipt', amount: 500 }],
    },
    {
      feeHeadId: 'FH2',
      months: [{ month: 'June', dueFeeId: 'due-2', sourceReceiptId: 'receipt', amount }],
    },
  ],
});

describe('refund selected installment validation', () => {
  const schema = buildRefundValidationSchema({});
  it.each(['', ' ', 0, '0', -1, 'invalid', Infinity, NaN])(
    'blocks an invalid selected amount %s even when another head has a valid amount',
    async (amount) => {
      await expect(schema.validate(request(amount))).rejects.toThrow(
        'Enter a refund amount greater than zero for every selected installment'
      );
    }
  );
  it('allows positive decimal amounts for every selected installment', async () => {
    await expect(schema.validate(request('0.10'))).resolves.toMatchObject({
      feeHeadRefunds: request('0.10').feeHeadRefunds,
    });
  });
  it('allows submission when an incomplete installment is explicitly deselected', async () => {
    const values = request('');
    values.feeHeadRefunds.pop();
    await expect(schema.validate(values)).resolves.toBeDefined();
  });
});
