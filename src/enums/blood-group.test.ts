import { it, expect, describe } from 'vitest';

import { BloodGroupArray, HrBloodGroupArray } from './blood-group';

describe('blood group options', () => {
  it('uses label values for general medical forms', () => {
    expect(BloodGroupArray[0]).toEqual({ label: 'A+', value: 'A+' });
  });

  it('uses the one-based HR backend contract for employee personal info', () => {
    expect(HrBloodGroupArray).toEqual([
      { label: 'A+', value: 1 },
      { label: 'A-', value: 2 },
      { label: 'B+', value: 3 },
      { label: 'B-', value: 4 },
      { label: 'AB+', value: 5 },
      { label: 'AB-', value: 6 },
      { label: 'O+', value: 7 },
      { label: 'O-', value: 8 },
    ]);
  });
});
