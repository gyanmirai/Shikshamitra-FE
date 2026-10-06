import { describe, expect, it } from 'vitest';

import {
  academicYearMonthsFromDates,
  applySelectionFilter,
  createSelectionOwnership,
  reconcileLedgerSelection,
  recordManualSelection,
} from './feeLedgerSelection';

import type { LedgerSelection } from './feeLedgerSelection';

describe('Fee Collection refreshed selection', () => {
  it('updates existing balances and prunes settled ownership without selecting newly added rows', () => {
    const ownership = createSelectionOwnership();
    const fee = { dueFeeId: 'fee', feeHeadId: 'tuition', period: '2026-11', dueAmount: 2000 };
    const manual = { ...fee, dueFeeId: 'manual' };
    const empty = { items: [], charges: [] };
    const selected: LedgerSelection = { items: [manual], charges: ['manual-charge'] };
    recordManualSelection(ownership, empty, selected);
    const combined = applySelectionFilter(ownership, selected, 'allPending', true, {
      items: [fee],
      charges: [],
    });
    const refreshed = reconcileLedgerSelection(ownership, combined, {
      items: [
        { ...fee, dueAmount: 500 },
        { ...fee, dueFeeId: 'new' },
      ],
      charges: ['new-charge'],
    });
    expect(refreshed).toEqual({ items: [{ ...fee, dueAmount: 500 }], charges: [] });
    expect(ownership.manual.items.size).toBe(0);
    expect(ownership.manual.charges.size).toBe(0);
    expect(applySelectionFilter(ownership, refreshed, 'allPending', false, empty)).toEqual(empty);
  });

  it('preserves existing row objects and order when a refresh does not change selected values', () => {
    const ownership = createSelectionOwnership();
    const item = { dueFeeId: 'fee', feeHeadId: 'tuition', period: '2026-11', dueAmount: 2000 };
    const selected = { items: [item], charges: ['charge'] };
    const next = reconcileLedgerSelection(ownership, selected, {
      items: [{ ...item }],
      charges: ['charge'],
    });
    expect(next.items[0]).toBe(item);
    expect(next.charges).toEqual(selected.charges);
  });
});

describe('Fee Collection academic calendar boundaries', () => {
  it('includes every June-May month even when the student has no ledger row in a month', () => {
    const months = academicYearMonthsFromDates({ startDate: '2026-06-15', endDate: '2027-05-02' });
    expect(months).toEqual([
      { month: 5, year: 2026 },
      { month: 6, year: 2026 },
      { month: 7, year: 2026 },
      { month: 8, year: 2026 },
      { month: 9, year: 2026 },
      { month: 10, year: 2026 },
      { month: 11, year: 2026 },
      { month: 0, year: 2027 },
      { month: 1, year: 2027 },
      { month: 2, year: 2027 },
      { month: 3, year: 2027 },
      { month: 4, year: 2027 },
    ]);
  });

  it('preserves all thirteen months when the configured end month extends beyond one year', () => {
    const months = academicYearMonthsFromDates({ startDate: '2026-06-01', endDate: '2027-06-30' });
    expect(months).toHaveLength(13);
    expect(months?.[12]).toEqual({ month: 5, year: 2027 });
  });

  it('supports short academic periods and same-month boundaries without padding', () => {
    expect(academicYearMonthsFromDates({ startDate: '2026-11-15', endDate: '2027-01-02' })).toEqual(
      [
        { month: 10, year: 2026 },
        { month: 11, year: 2026 },
        { month: 0, year: 2027 },
      ]
    );
    expect(academicYearMonthsFromDates({ startDate: '2026-06-15', endDate: '2026-06-30' })).toEqual(
      [{ month: 5, year: 2026 }]
    );
  });

  it('uses calendar date components without shifting offset timestamps across a month', () => {
    expect(
      academicYearMonthsFromDates({
        startDate: '2026-06-01T00:00:00+14:00',
        endDate: '2026-06-30T23:59:59-12:00',
      })
    ).toEqual([{ month: 5, year: 2026 }]);
  });

  it.each([
    {},
    { startDate: null, endDate: null },
    { startDate: '2026-06-01' },
    { startDate: 'invalid', endDate: '2027-05-31' },
    { startDate: '2026-02-30', endDate: '2027-05-31' },
    { startDate: '2026-06-01Tinvalid', endDate: '2027-05-31' },
    { startDate: '2026-06-01', endDate: '2026-05-31' },
    { startDate: '2026-06-20', endDate: '2026-06-10' },
    { startDate: '2026-06-01', endDate: '2027-13-31' },
  ])('does not invent academic months for missing or invalid boundaries %j', (year) => {
    expect(academicYearMonthsFromDates(year)).toBeUndefined();
  });

  it('validates leap-day boundaries', () => {
    expect(academicYearMonthsFromDates({ startDate: '2028-02-29', endDate: '2028-03-01' })).toEqual(
      [
        { month: 1, year: 2028 },
        { month: 2, year: 2028 },
      ]
    );
    expect(
      academicYearMonthsFromDates({ startDate: '2027-02-29', endDate: '2027-03-01' })
    ).toBeUndefined();
  });
});
