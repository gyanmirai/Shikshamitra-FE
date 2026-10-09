import { it, expect, describe } from 'vitest';

import { getApplicationReturnUrl } from './application-return-url';

describe('application return navigation', () => {
  it('retains Applications filters for drawer links and saved applicant recovery', () => {
    const url = '/student/admissions/applications?counsellor=mine&page=2';
    expect(getApplicationReturnUrl(url)).toBe(url);
    expect(getApplicationReturnUrl('/student/admissions/applications-other')).toBe(
      '/student/admissions/applications'
    );
  });
  it('retains the originating assessment scope and applicant filters', () => {
    const value =
      '/student/admissions/assessments?assessmentTab=applicants&assessmentScope=offering%3Astage&assessmentQueue=ready';
    expect(getApplicationReturnUrl(value)).toBe(value);
    expect(getApplicationReturnUrl('/student/admissions/assessments-other')).toBe(
      '/student/admissions/applications'
    );
  });
  it('retains the exact Pipeline list and encoded filters', () => {
    const value = '/student/admissions/pipeline?page=2&search=Jay%20Patel&owner=mine';
    expect(getApplicationReturnUrl(value)).toBe(value);
    expect(getApplicationReturnUrl('/student/admissions/pipeline')).toBe(
      '/student/admissions/pipeline'
    );
  });

  it.each([
    null,
    '',
    'https://example.com/student/admissions/pipeline',
    '//example.com',
    ['javascript', ':alert(1)'].join(''),
    '/student/admissions/pipeline-other',
    '/student/admissions/pipeline/../inquiries',
    '/student/admissions/pipeline#outside',
    '/student/admissions/pipeline?search=x\n',
    '/student/admissions/pipeline?\\evil',
  ])('returns to Applications for unsafe or unrelated destinations: %s', (value) => {
    expect(getApplicationReturnUrl(value)).toBe('/student/admissions/applications');
  });
});
