import { it, expect, describe } from 'vitest';

import {
  getInitialAdmissionIntakeSetupValues,
  getAdmissionIntakeSetupStepSchema,
} from './admission-intake-setup-editor';

describe('admission intake setup editor', () => {
  it('starts with recommended inquiry timing defaults', () => {
    const values = getInitialAdmissionIntakeSetupValues(null);

    expect(values.inquiryRules.firstContactDueInHours).toBe(24);
    expect(values.inquiryRules.qualificationDueInDays).toBe(7);
    expect(values.inquiryRules.followUpDueInDays).toBe(3);
    expect(values.inquiryRules.maxOpenFollowUps).toBe(3);
  });

  it('requires a setup name before leaving inquiry handling', async () => {
    await expect(
      getAdmissionIntakeSetupStepSchema(0).validate(getInitialAdmissionIntakeSetupValues(null))
    ).rejects.toThrow('Enter a setup name');
  });

  it('requires a counsellor pool and fallback manager', async () => {
    const values = getInitialAdmissionIntakeSetupValues(null);
    values.name = 'General intake';

    await expect(getAdmissionIntakeSetupStepSchema(1).validate(values)).rejects.toThrow();

    values.counsellorAssignmentRules.counsellorUserIds = ['counsellor-1'];
    await expect(getAdmissionIntakeSetupStepSchema(1).validate(values)).rejects.toThrow(
      'Choose a fallback manager'
    );
  });
});
