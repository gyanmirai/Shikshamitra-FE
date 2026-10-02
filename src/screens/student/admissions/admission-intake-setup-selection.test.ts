import { it, expect, describe } from 'vitest';

import type { AdmissionIntakeSetup } from 'src/redux/student/admissions/admission-intake-profiles-api';

import {
  getIntakeSetupSelection,
  hasLegacyIntakeSelection,
  findSelectedIntakeSetup,
  shouldAutoOpenInquiryLinkCreate,
} from './admission-intake-setup-selection';

const setup = {
  id: 'setup-1',
  name: 'General intake',
  inquiryIntakeProfileId: 'inquiry-1',
  counsellorAssignmentProfileId: 'assignment-1',
} as AdmissionIntakeSetup;

describe('admission intake setup selection', () => {
  it('maps both profile ids for an inquiry-first Offering', () => {
    expect(getIntakeSetupSelection(setup, true)).toEqual({
      inquiryIntakeProfileId: 'inquiry-1',
      counsellorAssignmentProfileId: 'assignment-1',
    });
  });

  it('maps only assignment for direct registration', () => {
    expect(getIntakeSetupSelection(setup, false)).toEqual({
      inquiryIntakeProfileId: null,
      counsellorAssignmentProfileId: 'assignment-1',
    });
    expect(findSelectedIntakeSetup([setup], null, 'assignment-1', false)).toBe(setup);
  });

  it('preserves an unmatched legacy selection until the admin replaces it', () => {
    const selected = findSelectedIntakeSetup([setup], 'legacy-inquiry', 'legacy-assignment', true);

    expect(selected).toBeNull();
    expect(hasLegacyIntakeSelection(selected, 'legacy-inquiry', 'legacy-assignment', true)).toBe(
      true
    );
  });

  it('opens a prefilled inquiry-link drawer once per selected setup', () => {
    expect(shouldAutoOpenInquiryLinkCreate('links', 'setup-1', null)).toBe(true);
    expect(shouldAutoOpenInquiryLinkCreate('links', 'setup-1', 'setup-1')).toBe(false);
    expect(shouldAutoOpenInquiryLinkCreate('links', 'setup-2', 'setup-1')).toBe(true);
    expect(shouldAutoOpenInquiryLinkCreate('setups', 'setup-2', 'setup-1')).toBe(false);
  });
});
