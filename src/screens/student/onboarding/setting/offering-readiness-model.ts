import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { createAllAcademicApplicability } from '../onboarding-settings-model';

import type { OnboardingProfile, ReadinessAccessRules } from '../onboarding-settings-model';

export const hasOfferingReadinessConflict = (
  profiles: OnboardingProfile[],
  profileId: string,
  offeringIds: string[]
) =>
  profiles.some(
    (profile) =>
      profile.id !== profileId && profile.offeringIds?.some((id) => offeringIds.includes(id))
  );

export const buildOfferingReadinessProfile = (
  profile: OnboardingProfile,
  name: string,
  offerings: AdmissionOfferingListItem[],
  rules: ReadinessAccessRules
): OnboardingProfile => ({
  ...profile,
  name: name.trim(),
  offeringIds: offerings.map((offering) => offering.id),
  admissionRoutes: [],
  applicability: {
    ...createAllAcademicApplicability(),
    boardMode: 'selected',
    boardIds: [...new Set(offerings.map((offering) => offering.boardId))],
    mediumMode: 'selected',
    academicMediumIds: [...new Set(offerings.map((offering) => offering.mediumId))],
    classMode: 'selected',
    standardIds: [...new Set(offerings.map((offering) => offering.standardId))],
  },
  rules: {
    ...rules,
    requireDocuments: true,
    requireIdentifiers: true,
    blockActivation: true,
    requireApproval: rules.approvalMode !== 'none',
    studentAccount: rules.sendStudentCredentialEmail,
    guardianAccount: rules.sendGuardianCredentialEmail,
    deliveryTiming: 'after-activation',
    credentialSendingTime: 'activation',
    checks: rules.checks.map((check) => ({
      ...check,
      required:
        check.key === 'accounts'
          ? rules.sendStudentCredentialEmail || rules.sendGuardianCredentialEmail
          : true,
      blocking: check.key !== 'accounts',
    })),
  },
});
