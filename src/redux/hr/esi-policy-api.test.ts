import { it, expect, describe } from 'vitest';

import { type EsiPolicy, effectiveEsiPolicyVersion } from './esi-policy-api';

describe('effective ESIC policy versions', () => {
  const policy = {
    id: 'one',
    versions: [
      { version: 1, effectiveFrom: '2026-01-01', effectiveTo: '2026-03-31' },
      { version: 2, effectiveFrom: '2026-05-01', effectiveTo: '2026-06-30' },
      { version: 3, effectiveFrom: '2026-08-01', effectiveTo: null },
    ],
  } as EsiPolicy;
  it('selects the version for the month without mutating history', () => {
    expect(effectiveEsiPolicyVersion(policy, '2026-02')?.version).toBe(1);
    expect(effectiveEsiPolicyVersion(policy, '2026-05')?.version).toBe(2);
    expect(effectiveEsiPolicyVersion(policy, '2026-09')?.version).toBe(3);
    expect(policy.versions.map((version) => version.version)).toEqual([1, 2, 3]);
  });
  it('reports a missing version before the policy begins and in effective-date gaps', () => {
    expect(effectiveEsiPolicyVersion(policy, '2025-12')).toBeUndefined();
    expect(effectiveEsiPolicyVersion(policy, '2026-04')).toBeUndefined();
    expect(effectiveEsiPolicyVersion(policy, '2026-07')).toBeUndefined();
    expect(effectiveEsiPolicyVersion(undefined, '2026-10')).toBeUndefined();
  });
});
