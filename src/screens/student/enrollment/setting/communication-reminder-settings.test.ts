import { it, expect, describe } from 'vitest';
import { AdmissionCrmJourneyTrigger } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { admissionReminderSupportsIdleDelay } from './communication-reminder-settings';

describe('communication reminder timing', () => {
  it('allows delay only for states re-evaluated by lifecycle automation', () => {
    expect(
      admissionReminderSupportsIdleDelay(AdmissionCrmJourneyTrigger.RegistrationIncomplete)
    ).toBe(true);
    expect(admissionReminderSupportsIdleDelay(AdmissionCrmJourneyTrigger.FeeFollowUp)).toBe(true);
    expect(admissionReminderSupportsIdleDelay(AdmissionCrmJourneyTrigger.ExamScheduled)).toBe(
      false
    );
    expect(admissionReminderSupportsIdleDelay(AdmissionCrmJourneyTrigger.EligibilityDecided)).toBe(
      false
    );
  });
});
