import { describe, expect, it } from 'vitest';

import { isFullWidthSubLayoutRoute } from './full-width-workspace';

describe('isFullWidthSubLayoutRoute', () => {
  it('uses the full workspace for an admission application detail page', () => {
    expect(
      isFullWidthSubLayoutRoute(
        '/student/admissions/applications/3a23c67c-84f9-fc39-6bff-76991e877b6e'
      )
    ).toBe(true);
  });

  it('keeps the Student navigation on list and Applicant 360 pages', () => {
    expect(isFullWidthSubLayoutRoute('/student/admissions/applications')).toBe(false);
    expect(isFullWidthSubLayoutRoute('/student/admissions/applicants/applicant-1')).toBe(false);
  });
});
