import { it, expect, describe } from 'vitest';

import { onboardingDivisionInput, onboardingDivisionSchema } from './onboarding-division-model';

describe('onboarding division creation', () => {
  it('submits only the division name, strength and parent standard', () => {
    const legacyValues = { name: ' B ', strength: '50', roomId: 'legacy-room' };
    expect(onboardingDivisionInput(legacyValues, 'standard-1')).toEqual({
      name: 'B',
      strength: 50,
      standardId: 'standard-1',
    });
  });

  it('requires a name and positive whole-number strength without a room assignment', async () => {
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 50 })).toBe(true);
    expect(await onboardingDivisionSchema.isValid({ name: '', strength: 50 })).toBe(false);
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 0 })).toBe(false);
    expect(await onboardingDivisionSchema.isValid({ name: 'B', strength: 1.5 })).toBe(false);
  });
});
