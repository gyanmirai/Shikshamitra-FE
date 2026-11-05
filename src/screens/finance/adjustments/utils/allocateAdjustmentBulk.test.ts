import { describe, expect, it } from 'vitest';

import { allocateAdjustmentBulk } from './allocateAdjustmentBulk';

const lines = [
  { dueFeeId: 'june', capacity: 100 },
  { dueFeeId: 'july', capacity: 400 },
  { dueFeeId: 'august', capacity: 400 },
];

describe('adjustment bulk amounts', () => {
  it('sets the same amount on checked installments only', () => {
    const result = allocateAdjustmentBulk(lines, ['june', 'july'],
      { june: '10', july: '20', august: '30' }, '75', 'perInstallment');
    expect(result.amounts).toEqual({ june: '75', july: '75', august: '30' });
  });

  it('distributes an overall amount exactly and respects each line capacity', () => {
    expect(allocateAdjustmentBulk(lines, ['june'], {}, '500', 'equalTotal'))
      .toEqual({ amounts: { june: '100', july: '200', august: '200' } });
    expect(allocateAdjustmentBulk(lines, [], {}, '1', 'equalTotal'))
      .toEqual({ amounts: { june: '0.33', july: '0.33', august: '0.34' } });
  });

  it('selects additional unpaid sources while reserving one destination', () => {
    expect(allocateAdjustmentBulk([
      { dueFeeId: 'project', capacity: 250, kind: 1 },
      { dueFeeId: 'school', capacity: 20000, kind: 1 },
      { dueFeeId: 'destination', capacity: 200, kind: 1 },
      { dueFeeId: 'credit', capacity: 500, kind: 0 },
    ], ['project'], {}, '10000', 'equalTotal')).toEqual({
      amounts: { project: '250', school: '9750' },
    });
  });

  it('leaves a destination when every unpaid installment was checked', () => {
    expect(allocateAdjustmentBulk([
      { dueFeeId: 'june', capacity: 500, kind: 1 },
      { dueFeeId: 'july', capacity: 500, kind: 1 },
      { dueFeeId: 'destination', capacity: 500, kind: 1 },
    ], ['june', 'july', 'destination'], {}, '600', 'equalTotal')).toEqual({
      amounts: { june: '300', july: '300' },
    });
  });

  it('does not mix unpaid fees with paid credit during automatic distribution', () => {
    const mixed = [
      { dueFeeId: 'pending', capacity: 250, kind: 1 },
      { dueFeeId: 'credit', capacity: 500, kind: 0 },
    ];
    expect(allocateAdjustmentBulk(mixed, ['pending'], {}, '300', 'equalTotal').error)
      .toMatch(/at least two pending or overdue installments/i);
    expect(allocateAdjustmentBulk(mixed, [], {}, '100', 'equalTotal').error)
      .toMatch(/select one/i);
  });

  it('rejects an amount above the selected available balance without changing values', () => {
    const existing = { june: '10', july: '20' };
    expect(allocateAdjustmentBulk(lines, ['june', 'july'], existing, '101', 'perInstallment').error)
      .toMatch(/available/i);
    expect(allocateAdjustmentBulk(lines, ['june', 'july'], existing, '901', 'equalTotal').error)
      .toMatch(/available/i);
    expect(existing).toEqual({ june: '10', july: '20' });
  });
});
