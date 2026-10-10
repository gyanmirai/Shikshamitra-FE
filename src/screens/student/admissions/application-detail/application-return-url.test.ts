import { it, expect, describe } from 'vitest';

import {
  getApplicationReturnUrl,
  getApplicationWorkspaceUrl,
  getApplicationPhaseReturnUrl,
} from './application-return-url';

describe('application return navigation', () => {
  it('moves the workspace and return menu together without carrying Pipeline queue filters', () => {
    const pipeline = '/student/admissions/pipeline?page=2&stage=form&owner=mine';
    expect(getApplicationPhaseReturnUrl(pipeline, true)).toBe('/student/admissions/applications');
    expect(getApplicationWorkspaceUrl('app/1', pipeline, true)).toBe(
      '/student/admissions/applications/app%2F1?returnTo=%2Fstudent%2Fadmissions%2Fapplications'
    );
  });
  it('repairs an early-stage Applications link while retaining safe same-phase context', () => {
    expect(getApplicationPhaseReturnUrl('/student/admissions/applications?search=Jay', false)).toBe(
      '/student/admissions/pipeline'
    );
    expect(getApplicationPhaseReturnUrl('/student/admissions/applications?search=Jay', true)).toBe(
      '/student/admissions/applications?search=Jay'
    );
  });
  it('keeps an assessment return across the decision handoff and strips legacy application selection', () => {
    const url = getApplicationWorkspaceUrl(
      'app-1',
      '/student/admissions/assessments?assessmentTab=applicants&application=app-1',
      true
    );
    expect(url).toContain('/student/admissions/applications/app-1?');
    expect(new URLSearchParams(url.split('?')[1]).get('returnTo')).toBe(
      '/student/admissions/assessments?assessmentTab=applicants'
    );
  });
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
