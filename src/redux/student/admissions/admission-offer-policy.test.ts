import { it, expect, describe } from 'vitest';

import {
  DEFAULT_OFFER_POLICY,
  readAdmissionOfferPolicy,
  writeAdmissionOfferPolicy,
  getAdmissionOfferConfigurationError,
} from './admission-offer-policy';

describe('managed Offer stage policy', () => {
  it('keeps an existing basic Offer stage compatible', () => {
    expect(readAdmissionOfferPolicy(undefined)).toBeNull();
    expect(getAdmissionOfferConfigurationError(undefined)).toBeUndefined();
  });

  it('preserves unrelated stage configuration', () => {
    const json = writeAdmissionOfferPolicy(
      JSON.stringify({ custom: { kept: true } }),
      DEFAULT_OFFER_POLICY
    );
    expect(JSON.parse(json)).toMatchObject({ custom: { kept: true }, offer: DEFAULT_OFFER_POLICY });
  });

  it('supports a fully managed conditional offer', () => {
    const policy = {
      ...DEFAULT_OFFER_POLICY,
      offerType: 'conditional' as const,
      conditions: 'Submit the transfer certificate.',
      requireConditionsConfirmation: true,
      allowedCompletionOutcomes: ['accepted', 'declined', 'expired'] as const,
    };
    const json = JSON.stringify({ offer: policy });
    expect(readAdmissionOfferPolicy(json)).toEqual(policy);
    expect(getAdmissionOfferConfigurationError(json)).toBeUndefined();
  });

  it('rejects conditional offers without conditions', () => {
    const json = JSON.stringify({ offer: { ...DEFAULT_OFFER_POLICY, offerType: 'conditional' } });
    expect(getAdmissionOfferConfigurationError(json)).toContain('conditional offer requirements');
  });

  it('rejects duplicate or unsupported completion outcomes', () => {
    const duplicate = JSON.stringify({
      offer: { ...DEFAULT_OFFER_POLICY, allowedCompletionOutcomes: ['accepted', 'accepted'] },
    });
    expect(getAdmissionOfferConfigurationError(duplicate)).toContain('unique supported');
  });
});
