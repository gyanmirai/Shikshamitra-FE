import { it, expect, describe } from 'vitest';

import { getApplicantReturnUrl, getApplicantApplicationUrl } from './admission-applicant-route';

describe('applicant compatibility destinations', () => {
  it.each([
    '/student/admissions/applications',
    '/student/admissions/pipeline',
    '/student/admissions/assessments',
  ])('opens the full-page Pipeline workspace and retains safe list filters: %s', (list) => {
    const url = new URL(getApplicantApplicationUrl(`${list}?owner=mine&page=2&application=old`, 'next'), 'https://school.test');
    expect(url.pathname).toBe('/student/admissions/pipeline/applications/next');
    expect(url.searchParams.get('returnTo')).toBe(`${list}?owner=mine&page=2`);
  });
  it.each([
    'https://evil.example',
    '//evil.example',
    '/student/admissions/applications/../inquiries',
    '/student/admissions/applications-other',
  ])('rejects unsafe or unrelated return context: %s', (url) => {
    expect(new URL(getApplicantApplicationUrl(url, 'next'), 'https://school.test').searchParams.get('returnTo')).toBe('/student/admissions/applications');
    expect(getApplicantReturnUrl(url, null)).toBe('/student/admissions/applications');
  });
  it('encodes inquiry identity as data without accepting route injection', () => {
    expect(getApplicantReturnUrl(null, 'inquiry&application=evil')).toBe(
      '/student/admissions/inquiries?inquiryId=inquiry%26application%3Devil'
    );
  });
});
