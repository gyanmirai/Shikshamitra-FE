import { it, expect, describe } from 'vitest';

import { getRefundPrerequisite } from './refundPrerequisites';

describe('refund prerequisite classification', () => {
  it('uses the exact missing assignment code without interpreting other policy failures', () => {
    expect(
      getRefundPrerequisite({ error: { data: { errorCode: 'Finance:FeeRefund:010010' } } })
    ).toBe('refund-policy-assignment');
    expect(
      getRefundPrerequisite({ error: { data: { errorCode: 'Finance:RefundPolicy:010016' } } })
    ).toBeUndefined();
    expect(getRefundPrerequisite({ error: { status: 403 } })).toBeUndefined();
  });

  it('distinguishes unverified receipts from a successful empty eligible balance', () => {
    expect(
      getRefundPrerequisite({ error: { data: { errorCode: 'Finance:FeeRefund:010025' } } })
    ).toBe('receipt-verification');
    expect(getRefundPrerequisite({ currentData: { totalRefundable: 0, feeHeads: [] } })).toBe(
      'paid-receipt'
    );
    expect(
      getRefundPrerequisite({
        currentData: { totalRefundable: 100, feeHeads: [{ months: [{ refundable: 100 }] }] },
      })
    ).toBeUndefined();
  });

  it('never treats pending, skipped, failed or undefined data as missing setup', () => {
    expect(getRefundPrerequisite({})).toBeUndefined();
    expect(
      getRefundPrerequisite({
        isUninitialized: true,
        currentData: { totalRefundable: 0, feeHeads: [] },
      })
    ).toBeUndefined();
    expect(
      getRefundPrerequisite({ isFetching: true, currentData: { totalRefundable: 0, feeHeads: [] } })
    ).toBeUndefined();
    expect(
      getRefundPrerequisite({ isError: true, currentData: { totalRefundable: 0, feeHeads: [] } })
    ).toBeUndefined();
  });
});
