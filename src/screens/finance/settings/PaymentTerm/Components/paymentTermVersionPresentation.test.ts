import type { PaymentTermVersionResponse } from 'src/redux/finance/paymentTerm';

import { it, expect, describe } from 'vitest';

import { paymentTermVersionPresentation } from './paymentTermVersionPresentation';

const version = (number: number): PaymentTermVersionResponse => ({
  id: `version-${number}`,
  versionNumber: number,
  status: 'Published',
  holidayShiftingMethod: 'None',
  demandGenerationRule: 'OnDueDate',
  demandOffsetDays: null,
  effectiveFrom: '2026-06-01',
  publishedAt: '2026-05-20T10:30:00Z',
  installments: [
    {
      id: `row-${number}`,
      sequence: 1,
      name: 'Annual',
      coverageStartDate: '2026-06-01',
      coverageEndDate: '2027-05-31',
      demandDate: '2027-05-31',
      dueDate: '2027-05-31',
      allocationPercentage: 100,
      demandEnabled: true,
      reminderEnabled: false,
    },
  ],
});

describe('payment term recorded-version comparisons', () => {
  it('compares consecutive versions and ignores regenerated installment identifiers', () => {
    const first = version(1);
    const second = version(2);
    const input = [first, second];
    const result = paymentTermVersionPresentation(input);
    expect(result.map((v) => v.versionNumber)).toEqual([2, 1]);
    expect(input.map((v) => v.versionNumber)).toEqual([1, 2]);
    expect(result[0].changedFields).toEqual([{ field: 'Version', oldValue: 1, newValue: 2 }]);
  });
  it('retains allocation fractions, changed dates and added installments as before/after facts', () => {
    const first = version(1);
    const second = version(2);
    second.installments = [
      { ...second.installments[0], allocationPercentage: 33.33, dueDate: '2027-05-15' },
      {
        ...second.installments[0],
        id: 'second-row',
        sequence: 2,
        name: 'Second',
        allocationPercentage: 66.67,
      },
    ];
    const diff = paymentTermVersionPresentation([first, second])[0].changedFields;
    expect(diff).toContainEqual({
      field: 'Installment 1 · Allocation percentage',
      oldValue: 100,
      newValue: 33.33,
    });
    expect(diff).toContainEqual({
      field: 'Installment 1 · Due date',
      oldValue: '31-05-2027',
      newValue: '15-05-2027',
    });
    expect(diff).toContainEqual({
      field: 'Installment 2 · Name',
      oldValue: null,
      newValue: 'Second',
    });
  });
  it('does not attribute current term identity/defaults or a missing author to historical versions', () => {
    const result = paymentTermVersionPresentation([version(1)])[0];
    expect(result.actor).toBe('Author unavailable');
    expect(result.changedFields.every((f) => f.oldValue === null)).toBe(true);
    expect(result.changedFields.some((f) => /(^id$|default|board|code)/i.test(f.field))).toBe(
      false
    );
    expect(result.snapshotAfter?.InvoiceDateRule).toBe('On Due Date');
  });
  it('does not compare across a missing intermediate version', () => {
    const result = paymentTermVersionPresentation([version(1), version(3)])[0];
    expect(result.changedFields.find((f) => f.field === 'Version')).toEqual({
      field: 'Version',
      oldValue: null,
      newValue: 3,
    });
  });
});
