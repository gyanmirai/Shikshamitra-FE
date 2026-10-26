import { it, vi, expect, describe } from 'vitest';

import { hrSetupReviewPath } from './hr-setup-review-api';

const captured = vi.hoisted(() => ({ endpoints: {} as Record<string, any> }));
vi.mock('src/redux/service', () => ({
  api: {
    injectEndpoints: ({ endpoints }: any) => {
      captured.endpoints = endpoints({
        query: (value: any) => value,
        mutation: (value: any) => value,
      });
      return {};
    },
  },
}));

describe('setup review API contract', () => {
  const args = {
    academicYearId: 'year/1',
    section: 'sample' as const,
    employeeId: 'staff-1',
    date: '2026-10-26',
  };
  it('encodes the year route segment and scopes the sample query explicitly', () => {
    expect(hrSetupReviewPath(args)).toBe('/hr/setup-review/year%2F1/sample');
    expect(captured.endpoints.getHrSetupReview.query(args)).toEqual({
      url: '/hr/setup-review/year%2F1/sample',
      params: { employeeId: 'staff-1', date: '2026-10-26', newSample: undefined },
    });
  });
  it('sends only acknowledgement evidence and sample context, leaving identity and time to the server', () => {
    const request = captured.endpoints.recordHrSetupReview.query({
      ...args,
      fingerprint: 'f'.repeat(64),
      concurrencyStamp: 'revision',
      actorId: 'forged',
      tenantId: 'forged',
      reviewedAt: '1990-01-01',
    });
    expect(request).toEqual({
      url: '/hr/setup-review/year%2F1/sample',
      method: 'POST',
      body: {
        fingerprint: 'f'.repeat(64),
        concurrencyStamp: 'revision',
        employeeId: 'staff-1',
        date: '2026-10-26',
      },
    });
  });
});
