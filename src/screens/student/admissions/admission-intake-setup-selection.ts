import type { AdmissionIntakeSetup } from 'src/redux/student/admissions/admission-intake-profiles-api';

export const findSelectedIntakeSetup = (
  setups: AdmissionIntakeSetup[],
  inquiryProfileId: string | null | undefined,
  assignmentProfileId: string | null | undefined,
  startsWithInquiry: boolean
) =>
  setups.find(
    (setup) =>
      setup.counsellorAssignmentProfileId === assignmentProfileId &&
      (!startsWithInquiry || setup.inquiryIntakeProfileId === inquiryProfileId)
  ) ?? null;

export const getIntakeSetupSelection = (
  setup: AdmissionIntakeSetup,
  startsWithInquiry: boolean
) => ({
  inquiryIntakeProfileId: startsWithInquiry ? setup.inquiryIntakeProfileId : null,
  counsellorAssignmentProfileId: setup.counsellorAssignmentProfileId,
});

export const hasLegacyIntakeSelection = (
  selectedSetup: AdmissionIntakeSetup | null,
  inquiryProfileId: string | null | undefined,
  assignmentProfileId: string | null | undefined,
  startsWithInquiry: boolean
) => !selectedSetup && Boolean(assignmentProfileId || (startsWithInquiry && inquiryProfileId));

export const shouldAutoOpenInquiryLinkCreate = (
  view: 'setups' | 'links',
  preselectedSetupId: string | null,
  lastAutoOpenedSetupId: string | null
) =>
  view === 'links' && Boolean(preselectedSetupId) && preselectedSetupId !== lastAutoOpenedSetupId;
