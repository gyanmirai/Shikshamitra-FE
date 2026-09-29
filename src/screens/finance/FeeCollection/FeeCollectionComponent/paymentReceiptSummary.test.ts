import { describe, expect, it } from 'vitest';

import type { FinanceAuditSummary } from 'src/redux/feeCollection/feeCollection';

import { paymentReceiptSummary } from './paymentReceiptSummary';

const summary: FinanceAuditSummary = {
  headline: 'Fee collected successfully',
  totalAmount: 2200,
  changedFields: [
    { field: 'totalAmount', oldValue: null, newValue: '2200.00' },
    { field: 'status', oldValue: null, newValue: 'Partial' },
    { field: 'FH 1 — Quarterly 1', oldValue: '2500.00', newValue: '300.00' },
  ],
  allocationLines: [
    {
      dueFeeId: 'due-1',
      feeHeadId: 'head-1',
      feeHeadName: 'FH 1',
      installmentLabel: 'Quarterly 1',
      amountPaid: 2200,
      pendingBefore: 2500,
      pendingAfter: 300,
    },
  ],
};

describe('paymentReceiptSummary', () => {
  it('shows readable paid, status, and pending values for a partial fee payment', () => {
    expect(paymentReceiptSummary(summary, 2200, true)).toBe(
      'Paid: ₹2,200.00 | Status: Partial | Pending: ₹300.00'
    );
  });

  it('does not show fee pending balance on a charge receipt', () => {
    expect(paymentReceiptSummary(summary, 500, false)).toBe('Paid: ₹500.00 | Status: Partial');
  });

  it('uses a readable verification status and omits absent fields', () => {
    expect(
      paymentReceiptSummary(
        {
          ...summary,
          changedFields: [{ field: 'status', newValue: 'InReconciliation' }],
          allocationLines: [],
        },
        100,
        true
      )
    ).toBe('Paid: ₹100.00 | Status: Pending verification');
  });
});
