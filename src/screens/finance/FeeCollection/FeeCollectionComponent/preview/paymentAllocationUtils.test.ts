import { it, expect, describe } from 'vitest';

import { allocatePayment } from './paymentAllocationUtils';

describe('allocatePayment', () => {
  const selectedItem = {
    dueFeeId: 'due-1',
    feeHeadId: 'head-1',
    period: '2026-04',
    dueAmount: 1000,
    lateFeeAmount: 100,
  };

  it('allocates principal before late fee and exposes both backend allocations', () => {
    const result = allocatePayment([selectedItem], [], { 'head-1': 'Tuition' }, 1050);
    const row = result.allocatedRows[0];

    expect(row.type).toBe('fee');
    if (row.type !== 'fee') throw new Error('Expected fee row');
    expect(row.principalPaidAmount).toBe(1000);
    expect(row.lateFeePaidAmount).toBe(50);
    expect(row.originalAmount).toBe(1100);
    expect(row.remainingAmount).toBe(50);
  });

  it('does not allocate late fee until principal is fully allocated', () => {
    const result = allocatePayment([selectedItem], [], { 'head-1': 'Tuition' }, 600);
    const row = result.allocatedRows[0];

    expect(row.type).toBe('fee');
    if (row.type !== 'fee') throw new Error('Expected fee row');
    expect(row.principalPaidAmount).toBe(600);
    expect(row.lateFeePaidAmount).toBe(0);
  });

  it('keeps a system late-fee charge linked to its due-fee source', () => {
    const result = allocatePayment(
      [],
      [
        {
          chargeId: 'due-1',
          sourceId: 'due-1',
          sourceType: 'LateFee',
          isSystemGenerated: true,
          chargeName: 'Late Fee - Tuition (April 2026)',
          amount: 100,
        },
      ],
      {},
      100
    );
    const row = result.allocatedRows[0];

    expect(row.type).toBe('charge');
    if (row.type !== 'charge') throw new Error('Expected charge row');
    expect(row.sourceType).toBe('LateFee');
    expect(row.sourceId).toBe('due-1');
    expect(row.paidAmount).toBe(100);
  });
});
