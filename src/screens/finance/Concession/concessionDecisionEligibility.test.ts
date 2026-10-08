import { describe, expect, it } from 'vitest';

import { canDecideConcession } from './concessionDecisionEligibility';

describe('concession decision eligibility', () => {
  it('requires both the signed-in identity and immutable requester identity', () => {
    expect(canDecideConcession(undefined, 'maker')).toBe(false);
    expect(canDecideConcession('checker', undefined)).toBe(false);
    expect(canDecideConcession('checker', 'maker')).toBe(true);
  });

  it('blocks the maker and submitter even if they have approval permission', () => {
    expect(canDecideConcession('MAKER', 'maker')).toBe(false);
    expect(canDecideConcession('submitter', 'maker', 'submitter')).toBe(false);
    expect(canDecideConcession('checker', 'maker', 'submitter')).toBe(true);
  });
});
