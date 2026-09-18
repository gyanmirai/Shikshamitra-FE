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
});
