import { it, expect, describe } from 'vitest';

import { formatApplicantNumber, getDistinctAdmissionIntent } from './enrollment-display';

describe('Student Enrollment display helpers', () => {
  it('formats the persistent applicant number as a short communication ID', () => {
    expect(formatApplicantNumber(7)).toBe('#0007');
    expect(formatApplicantNumber(12450)).toBe('#12450');
    expect(formatApplicantNumber(0)).toBe('Not assigned');
  });

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
