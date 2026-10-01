import { it, expect, describe } from 'vitest';

import {
  toPaise,
  roundUpToRupee,
  allocatePayment,
  safeRoundingDifference,
} from './paymentAllocationUtils';

describe('roundUpToRupee (Whole Rupee Round-Up Ceiling Rule)', () => {
  it('correctly rounds up amounts with fractions to next whole rupee', () => {
    expect(roundUpToRupee(1499.99)).toBe(1500);
    expect(roundUpToRupee(1499.01)).toBe(1500);
    expect(roundUpToRupee(1499.49)).toBe(1500);
    expect(roundUpToRupee(1499.5)).toBe(1500);
    expect(roundUpToRupee(3799.98)).toBe(3800);
    expect(roundUpToRupee(7599.96)).toBe(7600);
    expect(roundUpToRupee(550.5)).toBe(551);
  });

  it('preserves exact whole rupee amounts without rounding up further', () => {
    expect(roundUpToRupee(1500.0)).toBe(1500);
    expect(roundUpToRupee(250.0)).toBe(250);
    expect(roundUpToRupee(0)).toBe(0);
  });

  it('handles edge numbers and NaN gracefully', () => {
    expect(roundUpToRupee(0)).toBe(0);
    expect(roundUpToRupee(-50)).toBe(0);
    expect(roundUpToRupee(Number.NaN)).toBe(0);
  });
});

describe('safeRoundingDifference', () => {
  it('calculates the exact rounding adjustment difference', () => {
    expect(safeRoundingDifference(1499.99)).toBe(0.01);
    expect(safeRoundingDifference(1499.01)).toBe(0.99);
    expect(safeRoundingDifference(1499.5)).toBe(0.5);
    expect(safeRoundingDifference(1500.0)).toBe(0);
    expect(safeRoundingDifference(250.0)).toBe(0);
  });
});

describe('Multi-Installment Collection Calculations', () => {
  it('calculates multi-installment sum with whole rupee rounding without floating point noise', () => {
    const installmentA = 1499.99;
    const installmentB = 1499.99;
    const installmentC = 250.0;

    const roundedA = roundUpToRupee(installmentA);
    const roundedB = roundUpToRupee(installmentB);
    const roundedC = roundUpToRupee(installmentC);

    expect(roundedA).toBe(1500);
    expect(roundedB).toBe(1500);
    expect(roundedC).toBe(250);

    const totalCollection = roundedA + roundedB + roundedC;
    expect(totalCollection).toBe(3250);
    expect(String(totalCollection)).toBe('3250');
    expect(String(totalCollection)).not.toContain('.');
  });

  it('calculates complex multi-installment combinations consistently', () => {
    const items = [1499.99, 1499.99, 250.0, 550.5];
    const totalCollection = items.reduce((sum, item) => sum + roundUpToRupee(item), 0);
    // 1500 + 1500 + 250 + 551 = 3801
    expect(totalCollection).toBe(3801);
  });
});

describe('allocatePayment', () => {
  const selectedItem = {
    dueFeeId: 'due-1',
    feeHeadId: 'head-1',
    period: '2026-04',
    dueAmount: 1499.99,
    lateFeeAmount: 100,
  };

  it('rounds principal up to whole rupee for allocation and allocates principal before late fee', () => {
    // 1499.99 rounded to 1500. Total = 1500 + 100 = 1600.
    const result = allocatePayment([selectedItem], [], { 'head-1': 'Tuition' }, 1550);
    const row = result.allocatedRows[0];

    expect(row.type).toBe('fee');
    if (row.type !== 'fee') throw new Error('Expected fee row');
    expect(row.originalAmount).toBe(1600);
    expect(row.principalPaidAmount).toBe(1500);
    expect(row.lateFeePaidAmount).toBe(50);
    expect(row.paidAmount).toBe(1550);
    expect(row.remainingAmount).toBe(50);
  });

  it('supports partial payment allocation against rounded whole-rupee obligation', () => {
    // 1499.99 rounded to 1500. Total = 1500 + 100 = 1600.
    const result = allocatePayment([selectedItem], [], { 'head-1': 'Tuition' }, 500);
    const row = result.allocatedRows[0];

    expect(row.type).toBe('fee');
    if (row.type !== 'fee') throw new Error('Expected fee row');
    expect(row.originalAmount).toBe(1600);
    expect(row.principalPaidAmount).toBe(500);
    expect(row.lateFeePaidAmount).toBe(0);
    expect(row.remainingAmount).toBe(1100);
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
