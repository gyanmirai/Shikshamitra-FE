import { it, expect, describe } from 'vitest';

import { getOnboardingStatusLabel, isOnboardingStepSatisfied } from './student-onboarding-status';

describe('student onboarding statuses', () => {
  it('labels the operational lifecycle', () => {
    expect(getOnboardingStatusLabel(0)).toBe('Pending');
    expect(getOnboardingStatusLabel(2)).toBe('Ready for activation');
    expect(getOnboardingStatusLabel(3)).toBe('Needs attention');
    expect(getOnboardingStatusLabel(4)).toBe('Completed');
  });

  it('treats completed, waived, and not-required steps as satisfied', () => {
    expect(isOnboardingStepSatisfied(2)).toBe(true);
    expect(isOnboardingStepSatisfied(4)).toBe(true);
    expect(isOnboardingStepSatisfied(5)).toBe(true);
    expect(isOnboardingStepSatisfied(3)).toBe(false);
  });
});
