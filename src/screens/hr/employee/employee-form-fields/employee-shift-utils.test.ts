import { it, expect, describe } from 'vitest';

import {
  STALE_SHIFT_ERROR,
  isStaleSelectedShift,
  resolveSelectedShiftOption,
} from './employee-shift-utils';

describe('employee shift utilities', () => {
  const shifts = [
    { id: 'shift-1', shiftName: 'Morning' },
    { id: 'shift-2', shiftName: 'Full Day' },
  ];

  it('resolves the selected shift when it exists in options', () => {
    expect(resolveSelectedShiftOption(shifts, 'shift-2')).toEqual(shifts[1]);
  });

  it('marks a selected shift as stale when it is missing after options load', () => {
    expect(isStaleSelectedShift(shifts, 'deleted-shift')).toBe(true);
  });

  it('does not mark a selected shift stale while options are loading', () => {
    expect(isStaleSelectedShift([], 'shift-1', true)).toBe(false);
  });

  it('does not mark empty shift values as stale', () => {
    expect(isStaleSelectedShift(shifts, '')).toBe(false);
    expect(resolveSelectedShiftOption(shifts, '')).toBeNull();
  });

  it('exposes the stale shift field error copy', () => {
    expect(STALE_SHIFT_ERROR).toBe(
      'Selected shift is no longer available. Please choose another shift.'
    );
  });
});
