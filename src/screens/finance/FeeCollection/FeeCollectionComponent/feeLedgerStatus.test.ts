import { describe, expect, it } from 'vitest';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import { normalizeLedgerStatus } from './feeLedgerStatus';

describe('ledger API status compatibility', () => {
  it.each([
    [0, FeeCollectionStatusType.Pending],
    ['0', FeeCollectionStatusType.Pending],
    ['Paid', FeeCollectionStatusType.Paid],
    ['overdue', FeeCollectionStatusType.Overdue],
    ['Reversed', FeeCollectionStatusType.Reversed],
    ['Partial Pending', FeeCollectionStatusType.Partial],
    ['Partial Paid', FeeCollectionStatusType.Partial],
    ['In Reconciliation', FeeCollectionStatusType.InReconciliation],
    ['InReconciliation', FeeCollectionStatusType.InReconciliation],
    ['Waived', FeeCollectionStatusType.Waived],
  ])('preserves server state %s regardless of fallback balances', (input, expected) => {
    expect(normalizeLedgerStatus(input, 0, 0)).toBe(expected);
  });

  it('uses balances only for an absent or invalid legacy state', () => {
    expect(normalizeLedgerStatus(undefined, 0, 100)).toBe(FeeCollectionStatusType.Pending);
    expect(normalizeLedgerStatus('', 50, 100)).toBe(FeeCollectionStatusType.Partial);
    expect(normalizeLedgerStatus('unknown', 100, 0)).toBe(FeeCollectionStatusType.Paid);
  });
});
