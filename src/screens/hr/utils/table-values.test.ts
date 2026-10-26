import { it, expect } from 'vitest';

import { durationHours } from './table-values';

it('compares attendance durations numerically without treating a missing duration as zero', () => {
  expect(durationHours('02:30:00')).toBe(2.5);
  expect(durationHours('12:00')).toBe(12);
  expect(durationHours(0)).toBe(0);
  expect(durationHours('1.25')).toBe(1.25);
  [null, undefined, '', '-', '01:75', '-1'].forEach((value) => {
    expect(durationHours(value)).toBeNull();
  });
});
