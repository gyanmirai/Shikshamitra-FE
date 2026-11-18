import { describe, expect, it } from 'vitest';

import { policyVersionRequest } from './policyVersionQuery';

describe('policy version paging requests', () => {
  it('keeps policy-ID callers compatible', () => {
    expect(policyVersionRequest('refund', 'policy')).toEqual({
      url: '/finance/refund-policies/policy/versions', method: 'GET', params: {},
    });
  });
  it('sends an explicit offset and bounded page including the predecessor', () => {
    expect(policyVersionRequest('collection', { id: 'policy', skipCount: 20, maxResultCount: 21 })).toEqual({
      url: '/finance/collection-policies/policy/versions', method: 'GET',
      params: { skipCount: 20, maxResultCount: 21 },
    });
  });
});
