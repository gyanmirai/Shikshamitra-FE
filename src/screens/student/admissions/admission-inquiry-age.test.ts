import { it, expect, describe } from 'vitest';

import { getAdmissionInquiryAge } from './admission-inquiry-age';

describe('Inquiry age at academic year start', () => {
  it('uses academic year start and warns without treating the warning as a validation error', () => {
    const result = getAdmissionInquiryAge('2021-07-01T00:00:00+05:30', '2026-04-01', 5);
    expect(result?.helpText).toContain('4 years 9 months');
    expect(result?.warning).toContain('below the minimum age of 5 years');
    expect(result?.warning).toContain('You can still save this inquiry.');
    expect(getAdmissionInquiryAge('2021-07-01', '2027-04-01', 5)?.warning).toBe('');
  });

  it.each([
    ['2021-04-01', '2026-04-01', '5 years 0 months', false],
    ['2021-04-02', '2026-04-01', '4 years 11 months', true],
    ['2021-03-31', '2026-04-01', '5 years 0 months', false],
    ['2024-02-29', '2025-02-28', '1 year 0 months', true],
    ['2022-01-31', '2026-02-28', '4 years 1 month', true],
  ])('handles birthday/month boundaries: %s on %s', (dob, start, age, warns) => {
    const result = getAdmissionInquiryAge(dob, start, 5);
    expect(result?.helpText).toContain(age);
    expect(Boolean(result?.warning)).toBe(warns);
  });

  it.each([undefined, null, 0, -1, Number.NaN])(
    'shows age without imposing an unconfigured minimum (%s)',
    (minimum) => {
      const result = getAdmissionInquiryAge('2022-01-01', '2026-04-01', minimum);
      expect(result?.helpText).toContain('4 years 3 months');
      expect(result?.warning).toBe('');
    }
  );

  it.each(['', '2022-0', '2022-02-30', 'invalid'])(
    'ignores empty/partial/invalid DOB (%s)',
    (dob) => {
      expect(getAdmissionInquiryAge(dob, '2026-04-01', 5)).toBeNull();
    }
  );

  it('does not invent a cutoff or calculate a negative age', () => {
    expect(getAdmissionInquiryAge('2022-04-01', undefined, 5)).toBeNull();
    expect(getAdmissionInquiryAge('2022-04-01', '2026-02-30', 5)).toBeNull();
    expect(getAdmissionInquiryAge('2027-04-01', '2026-04-01', 5)?.helpText).toContain('Not born');
    expect(getAdmissionInquiryAge('2027-04-01', '2026-04-01', 5)?.warning).toContain(
      'after academic year start'
    );
  });
});
