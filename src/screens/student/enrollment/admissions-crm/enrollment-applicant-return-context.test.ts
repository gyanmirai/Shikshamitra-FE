import { it, expect, describe } from 'vitest';

import { isSafeApplicantReturnPath, parseApplicantReturnContext } from './applicant-return-context';

const validContext = {
  version: 2,
  expiresAt: Date.now() + 60_000,
  returnTo: '/student/enrollment/pipeline?cycle=cycle-1&view=board&page=3',
  scrollTop: 480,
  scrollLeft: 24,
  focusLeadId: 'lead-1',
};

describe('applicant return context', () => {
  it('restores a versioned pipeline location, scroll position, and focus target', () => {
    expect(parseApplicantReturnContext(JSON.stringify(validContext))).toEqual(validContext);
  });

  it('expires old state and rejects applicant or external return locations', () => {
    expect(
      parseApplicantReturnContext(JSON.stringify({ ...validContext, expiresAt: Date.now() - 1 }))
    ).toBeUndefined();
    expect(
      parseApplicantReturnContext(
        JSON.stringify({
          ...validContext,
          returnTo: '/student/enrollment/applicants/lead-2?tab=inquiry',
        })
      )
    ).toBeUndefined();
    expect(
      parseApplicantReturnContext(
        JSON.stringify({ ...validContext, returnTo: 'https://example.com' })
      )
    ).toBeUndefined();
    expect(
      parseApplicantReturnContext(
        JSON.stringify({
          ...validContext,
          returnTo: '/student/enrollment/%2e%2e/login',
        })
      )
    ).toBeUndefined();
  });

  it('falls back safely for malformed and unsupported versions', () => {
    expect(parseApplicantReturnContext('{broken')).toBeUndefined();
    expect(
      parseApplicantReturnContext(JSON.stringify({ ...validContext, version: 1 }))
    ).toBeUndefined();
  });

  it('accepts only normalized internal enrollment workspace paths', () => {
    expect(isSafeApplicantReturnPath('/student/enrollment/pipeline?view=board')).toBe(true);
    expect(isSafeApplicantReturnPath('//example.com/student/enrollment/pipeline')).toBe(false);
    expect(isSafeApplicantReturnPath('/student/enrollment/applicants/lead-2')).toBe(false);
  });

  it('normalizes invalid scroll coordinates without discarding the return location', () => {
    expect(
      parseApplicantReturnContext(
        JSON.stringify({ ...validContext, scrollTop: -20, scrollLeft: 'invalid' })
      )
    ).toMatchObject({ scrollTop: 0, scrollLeft: 0 });
  });
});
