import { it, expect, describe } from 'vitest';

import { getDistinctAdmissionIntent } from './enrollment-display';

describe('Student Enrollment display helpers', () => {
  it('hides an admission intent that only repeats the captured pathway', () => {
    expect(getDistinctAdmissionIntent(' Fresh   Admission ', 'fresh admission')).toBeUndefined();
  });

  it('keeps distinct intent notes and legacy intent values', () => {
    expect(
      getDistinctAdmissionIntent('Family needs an accessible campus tour.', 'Fresh admission')
    ).toBe('Family needs an accessible campus tour.');
    expect(getDistinctAdmissionIntent('Legacy inquiry context', undefined)).toBe(
      'Legacy inquiry context'
    );
  });

  it('omits an empty admission intent', () => {
    expect(getDistinctAdmissionIntent('   ', 'Fresh admission')).toBeUndefined();
  });
});
