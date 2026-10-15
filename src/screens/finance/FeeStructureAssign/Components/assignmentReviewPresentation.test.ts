import type { AssignmentLine } from 'src/redux/finance/studentFeeAssignment';

import { it, expect, describe } from 'vitest';

import {
  assignmentCurrencyTotals,
  groupAssignmentInstallments,
} from './assignmentReviewPresentation';

const line = (changes: Partial<AssignmentLine> = {}): AssignmentLine => ({
  feeHeadId: 'tuition',
  feeHeadName: 'Tuition',
  sequence: 1,
  installmentLabel: 'Term 1',
  dueDate: '2026-06-10',
  demandDate: '2026-06-01',
  allocationPercentage: 60,
  scheduledAmount: 1200,
  proratedAmount: 900,
  paidAmount: 200,
  outstandingAmount: 700,
  ...changes,
});

describe('assignment ledger presentation', () => {
  it('groups only matching terms and dates while preserving every recorded line and balance', () => {
    const lines = [
      line(),
      line({ feeHeadId: 'exam', proratedAmount: 100, paidAmount: 0, outstandingAmount: 100 }),
      line({
        sequence: 2,
        installmentLabel: 'Term 2',
        dueDate: '2026-12-10',
        demandDate: '2026-12-01',
        allocationPercentage: 40,
      }),
    ];
    const original = structuredClone(lines);
    const groups = groupAssignmentInstallments(lines);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ obligation: 1000, paid: 200, outstanding: 800 });
    expect(groups[0].lines).toEqual(lines.slice(0, 2));
    expect(groups[1].lines[0].allocationPercentage).toBe(40);
    expect(lines).toEqual(original);
  });

  it('keeps different demand dates, due dates, sequences and terms separate', () => {
    expect(
      groupAssignmentInstallments([
        line(),
        line({ demandDate: undefined }),
        line({ dueDate: '2026-06-11' }),
        line({ sequence: 2 }),
        line({ installmentLabel: 'Monthly 1' }),
      ])
    ).toHaveLength(5);
    expect(groupAssignmentInstallments([])).toEqual([]);
  });

  it('never combines batch totals across currencies or rounds source amounts', () => {
    expect(
      assignmentCurrencyTotals([
        { currency: 'INR', proratedTotal: 10.25 },
        { currency: 'INR', proratedTotal: 2.5 },
        { currency: 'USD', proratedTotal: 3 },
      ])
    ).toEqual([
      { currency: 'INR', total: 12.75 },
      { currency: 'USD', total: 3 },
    ]);
    expect(assignmentCurrencyTotals([])).toEqual([]);
  });
});
