import { describe, expect, it } from 'vitest';

import { allocateConcessionBulk } from './concessionBulkAllocation';

const linesFor = (capacities: number[]) =>
  capacities.map((eligibleConcessionAmount, index) => ({
    dueFeeId: `due-${index + 1}`,
    eligibleConcessionAmount,
  }));

const options = () => {
  const lines = linesFor([1000, 1000, 1000, 1000, 1000, 1000]);
  return {
    lines,
    targetIds: lines.map((line) => line.dueFeeId),
    entries: {} as Record<string, number | string>,
    value: '5000',
    mode: 'equalTotal' as const,
    maximum: 10000,
    decimalPlaces: 0 as 0 | 2,
    percentage: false,
  };
};

describe('atomic concession bulk allocation', () => {
  it.each([
    [0, ['833', '833', '833', '833', '833', '835']],
    [2, ['833.33', '833.33', '833.33', '833.33', '833.33', '833.35']],
  ] as const)('preserves the exact 5000 total with precision %s', (decimalPlaces, expected) => {
    const result = allocateConcessionBulk({ ...options(), decimalPlaces });
    expect(result.error).toBeUndefined();
    expect(Object.values(result.entries!)).toEqual(expected);
    const units = Object.values(result.entries!).reduce<number>(
      (sum, value) => sum + Math.round(Number(value) * 10 ** decimalPlaces),
      0
    );
    expect(units).toBe(5000 * 10 ** decimalPlaces);
  });

  it('redistributes equally after an installment reaches its eligible cap', () => {
    const lines = linesFor([100, 3000, 3000]);
    expect(
      allocateConcessionBulk({ ...options(), lines, targetIds: lines.map((line) => line.dueFeeId) })
        .entries
    ).toEqual({ 'due-1': '100', 'due-2': '2450', 'due-3': '2450' });
  });

  it('puts rounding on the last eligible target without exceeding that target cap', () => {
    const settings = options();
    settings.lines[5].eligibleConcessionAmount = 834;
    expect(allocateConcessionBulk(settings).entries).toEqual({
      'due-1': '833',
      'due-2': '833',
      'due-3': '833',
      'due-4': '833',
      'due-5': '834',
      'due-6': '834',
    });
  });

  it('updates only checked rows, retains other manual values exactly, and reuses target budget', () => {
    const settings = {
      ...options(),
      targetIds: ['due-1', 'due-2'],
      entries: { 'due-1': '700', 'due-2': '100', 'due-3': '200', stale: '123.40' },
      maximum: 1000,
      value: '400',
      mode: 'perInstallment' as const,
    };
    const original = JSON.stringify(settings);
    const result = allocateConcessionBulk(settings);
    expect(result.entries).toEqual({
      'due-1': '400',
      'due-2': '400',
      'due-3': '200',
      stale: '123.40',
    });
    expect(JSON.stringify(settings)).toBe(original);
    expect(allocateConcessionBulk({ ...settings, entries: result.entries! })).toEqual(result);
  });

  it('rejects the entire exact per-installment batch when one row cannot accept it', () => {
    const settings = {
      ...options(),
      lines: linesFor([100, 1000]),
      targetIds: ['due-1', 'due-2'],
      entries: { 'due-1': '50', 'due-2': '80' },
      value: '200',
      mode: 'perInstallment' as const,
    };
    const result = allocateConcessionBulk(settings);
    expect(result.entries).toBeUndefined();
    expect(result.error).toMatch(/eligible|installment/i);
    expect(settings.entries).toEqual({ 'due-1': '50', 'due-2': '80' });
  });

  it('rejects an impossible total and never clamps it silently', () => {
    const result = allocateConcessionBulk({ ...options(), value: '6001' });
    expect(result.entries).toBeUndefined();
    expect(result.error).toMatch(/eligible|capacity/i);
  });

  it('includes another selected fee head in the shared request allowance', () => {
    const result = allocateConcessionBulk({
      ...options(),
      targetIds: ['due-1'],
      entries: { 'due-2': '800' },
      value: '201',
      maximum: 1000,
    });
    expect(result.entries).toBeUndefined();
    expect(result.error).toMatch(/request|policy|allowance/i);
  });

  it('ignores stale target IDs and deduplicates checked IDs without increasing the batch', () => {
    const result = allocateConcessionBulk({
      ...options(),
      targetIds: ['stale', 'due-1', 'due-1'],
      mode: 'perInstallment',
      value: '200',
    });
    expect(result.entries).toEqual({ 'due-1': '200' });
    expect(allocateConcessionBulk({ ...options(), targetIds: ['stale'] }).error).toMatch(/select/i);
  });

  it('represents zero allocations as blank so omitted installments remain valid', () => {
    expect(allocateConcessionBulk({ ...options(), value: '2' }).entries).toEqual({
      'due-1': '',
      'due-2': '',
      'due-3': '',
      'due-4': '',
      'due-5': '',
      'due-6': '2',
    });
  });

  it('honors the shared percentage maximum and limits an individual percentage to 100', () => {
    const settings = {
      ...options(),
      percentage: true,
      decimalPlaces: 2 as const,
      targetIds: ['due-1', 'due-2'],
      entries: { 'due-3': '5' },
      maximum: 25,
      value: '20',
    };
    expect(allocateConcessionBulk(settings).entries).toEqual({
      'due-1': '10',
      'due-2': '10',
      'due-3': '5',
    });
    expect(allocateConcessionBulk({ ...settings, value: '21' }).entries).toBeUndefined();
    expect(
      allocateConcessionBulk({
        ...settings,
        targetIds: ['due-1'],
        entries: {},
        maximum: Infinity,
        value: '101',
      }).entries
    ).toBeUndefined();
  });

  it('handles decimal eligible capacities without losing a paise to floating point', () => {
    expect(
      allocateConcessionBulk({
        ...options(),
        lines: linesFor([100.29]),
        targetIds: ['due-1'],
        decimalPlaces: 2,
        value: '100.29',
      }).entries
    ).toEqual({ 'due-1': '100.29' });
  });

  it.each(['12.00', '12.'])(
    'preserves an existing whole-valued untargeted draft %j without changing its raw text',
    (outside) => {
      expect(
        allocateConcessionBulk({
          ...options(),
          targetIds: ['due-1'],
          entries: { 'due-2': outside },
          value: '100',
        }).entries
      ).toEqual({ 'due-1': '100', 'due-2': outside });
    }
  );

  it.each(['', ' ', 'NaN', 'Infinity', '-1', '0', '1e3', '1,000', '1.1', '9007199254740992'])(
    'rejects an invalid whole-rupee bulk value %j without mutation',
    (value) => {
      const entries = { 'due-1': '100' };
      expect(allocateConcessionBulk({ ...options(), value, entries }).entries).toBeUndefined();
      expect(entries).toEqual({ 'due-1': '100' });
    }
  );

  it.each(['1.001', '0.001', 'NaN', '-1'])('rejects invalid paise input %j', (value) => {
    expect(allocateConcessionBulk({ ...options(), decimalPlaces: 2, value }).error).toBeTruthy();
  });

  it.each(['invalid', '0', '-3', '1001', '1.2'])(
    'does not hide invalid untargeted entries (%s) by applying a valid batch',
    (outside) => {
      const result = allocateConcessionBulk({
        ...options(),
        targetIds: ['due-1'],
        entries: { 'due-2': outside },
        value: '100',
      });
      expect(result.entries).toBeUndefined();
      expect(result.error).toMatch(/existing|other|correct/i);
    }
  );

  it('rejects an empty selection and unsafe arithmetic', () => {
    expect(allocateConcessionBulk({ ...options(), targetIds: [] }).error).toMatch(/select/i);
    expect(allocateConcessionBulk({ ...options(), maximum: NaN }).entries).toBeUndefined();
    expect(
      allocateConcessionBulk({
        ...options(),
        mode: 'perInstallment',
        lines: linesFor([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]),
        targetIds: ['due-1', 'due-2'],
        value: String(Number.MAX_SAFE_INTEGER),
      }).entries
    ).toBeUndefined();
  });
});
