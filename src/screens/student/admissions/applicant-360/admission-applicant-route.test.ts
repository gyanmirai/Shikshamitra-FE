import { it, expect, describe } from 'vitest';

import { getApplicantReturnUrl, getApplicantApplicationUrl } from './admission-applicant-route';

describe('applicant compatibility destinations', () => {
  it.each([
    '/student/admissions/applications',
    '/student/admissions/pipeline',
    '/student/admissions/assessments',
  ])('opens application in the existing list: %s', (list) => {
    expect(getApplicantApplicationUrl(`${list}?owner=mine&page=2&application=old`, 'next')).toBe(
      `${list}?owner=mine&page=2&application=next`
    );
  });
  it.each([
    'https://evil.example',
    '//evil.example',
    '/student/admissions/applications/../inquiries',
    '/student/admissions/applications-other',
  ])('rejects unsafe or unrelated return context: %s', (url) => {
    expect(getApplicantApplicationUrl(url, 'next')).toBe(
      '/student/admissions/applications?application=next'
    );
    expect(getApplicantReturnUrl(url, null)).toBe('/student/admissions/applications');
  });
  it('encodes inquiry identity as data without accepting route injection', () => {
    expect(getApplicantReturnUrl(null, 'inquiry&application=evil')).toBe(
      '/student/admissions/inquiries?inquiryId=inquiry%26application%3Devil'
    );
  });
});
