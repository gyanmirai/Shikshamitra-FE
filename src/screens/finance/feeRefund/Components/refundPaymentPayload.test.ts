import { it, expect } from 'vitest';

import { buildRefundPayoutPayload } from './refundPaymentPayload';

import type { IStudentFeeData } from '../type';

const refund = { _approvedAmount: 3750, _payoutReference: '********C58E' } as IStudentFeeData;
const values = {
  method: 'Cash',
  externalReference: '********C58E',
  expenseCategoryId: 'expense-1',
  bankAccountId: 'bank-1',
};

it.each(['Cash', 'Bank Transfer (NEFT/RTGS/IMPS)', 'Cheque'])(
  'omits the masked display reference when resuming a %s payment',
  (method) => {
    const payload = buildRefundPayoutPayload(
      { ...refund, _payoutPending: true },
      { ...values, method },
      'retry-key',
      '2026-10-23T18:18:47.383Z'
    );
    expect(payload).not.toHaveProperty('externalReference');
    expect(JSON.stringify(payload)).not.toContain('*');
    expect(payload).toMatchObject({
      amount: 3750,
      idempotencyKey: 'retry-key',
      bankAccountId: 'bank-1',
      expenseCategoryId: 'expense-1',
      paymentDate: '2026-10-23T18:18:47.383Z',
      method,
    });
  }
);

it('leaves a new cash reference to the server', () => {
  expect(
    buildRefundPayoutPayload(refund, values, 'new-key', '2026-10-24T00:00:00Z')
  ).not.toHaveProperty('externalReference');
});

it('sends the entered reference for a new non-cash payment', () => {
  expect(
    buildRefundPayoutPayload(
      refund,
      { ...values, method: 'Cheque', externalReference: '  CHEQUE-123  ' },
      'new-key',
      '2026-10-24T00:00:00Z'
    )
  ).toHaveProperty('externalReference', 'CHEQUE-123');
});
