import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionInquiryDuplicateRule = 0 | 1 | 2;
export type AdmissionInquiryApplicationStartRequirement = 0 | 1 | 2;
export type AdmissionInquiryAssignmentMode = 0 | 1;
export type AdmissionInquiryQualificationCriterion = {
  code: string;
  name: string;
  required: boolean;
};

export type AdmissionInquiryPolicy = {
  version: 1;
  enabled: boolean;
  requireLinkedInquiry: boolean;
  applicationStartRequirement: AdmissionInquiryApplicationStartRequirement;
  duplicateRule: AdmissionInquiryDuplicateRule;
  assignmentMode: AdmissionInquiryAssignmentMode;
  defaultCounsellorId: string | null;
  counsellorPoolUserIds: string[];
  restrictActionsToAssignedCounsellor: boolean;
  firstContactDueInHours: number | null;
  qualificationDueInDays: number | null;
  followUpDueInDays: number;
  maxOpenFollowUps: number;
  requireGuardianEmail: boolean;
  requireApplicantDateOfBirth: boolean;
  allowedSources: number[];
  requireSourceDetailFor: number[];
  qualificationChecklist: AdmissionInquiryQualificationCriterion[];
};

export const DEFAULT_INQUIRY_POLICY: AdmissionInquiryPolicy = {
  version: 1,
  enabled: true,
  requireLinkedInquiry: true,
  applicationStartRequirement: 0,
  duplicateRule: 1,
  assignmentMode: 0,
  defaultCounsellorId: null,
  counsellorPoolUserIds: [],
  restrictActionsToAssignedCounsellor: false,
  firstContactDueInHours: 24,
  qualificationDueInDays: 7,
  followUpDueInDays: 3,
  maxOpenFollowUps: 3,
  requireGuardianEmail: false,
  requireApplicantDateOfBirth: false,
  allowedSources: [],
  requireSourceDetailFor: [],
  qualificationChecklist: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

// Retain legacy contract keys, but never revive retired intake requirements.
export function withStandardInquiryBehavior<
  T extends {
    duplicateRule: AdmissionInquiryDuplicateRule;
    applicationStartRequirement: AdmissionInquiryApplicationStartRequirement;
    requireGuardianEmail: boolean;
    requireApplicantDateOfBirth: boolean;
    requireSourceDetailFor: number[];
  },
>(rules: T): T {
  return {
    ...rules,
    duplicateRule: 1,
    applicationStartRequirement: 0,
    requireGuardianEmail: false,
    requireApplicantDateOfBirth: false,
    requireSourceDetailFor: [],
    assignmentMode: 0,
    defaultCounsellorId: null,
    counsellorPoolUserIds: [],
    restrictActionsToAssignedCounsellor: false,
  };
}

export function readAdmissionInquiryPolicy(json?: string): AdmissionInquiryPolicy | null {
  const policy = readStageConfiguration(json)?.inquiry;
  if (
    !isRecord(policy) ||
    policy.version !== 1 ||
    typeof policy.enabled !== 'boolean' ||
    ![0, 1, 2].includes(Number(policy.applicationStartRequirement ?? 2)) ||
    ![0, 1, 2].includes(Number(policy.duplicateRule ?? 1)) ||
    ![0, 1].includes(Number(policy.assignmentMode ?? 0)) ||
    [
      'requireLinkedInquiry',
      'restrictActionsToAssignedCounsellor',
      'requireGuardianEmail',
      'requireApplicantDateOfBirth',
    ].some((key) => policy[key] !== undefined && typeof policy[key] !== 'boolean') ||
    (policy.defaultCounsellorId != null && typeof policy.defaultCounsellorId !== 'string') ||
    !arrayOf(policy.counsellorPoolUserIds, 'string') ||
    !arrayOf(policy.allowedSources, 'number') ||
    !arrayOf(policy.requireSourceDetailFor, 'number') ||
    !criteria(policy.qualificationChecklist)
  )
    return null;
  return withStandardInquiryBehavior({
    ...DEFAULT_INQUIRY_POLICY,
    ...policy,
  } as AdmissionInquiryPolicy);
}

export function writeAdmissionInquiryPolicy(
  json: string | undefined,
  policy: AdmissionInquiryPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = readAdmissionInquiryPolicy(json);
  if (configuration.inquiry !== undefined && !previous)
    throw new Error('These Inquiry settings are unsupported or incomplete. Reload the workflow.');
  return JSON.stringify({
    ...configuration,
    inquiry: withStandardInquiryBehavior({ ...previous, ...policy }),
  });
}

function arrayOf(value: unknown, type: 'string' | 'number') {
  return (
    value === undefined || (Array.isArray(value) && value.every((item) => typeof item === type))
  );
}

function criteria(value: unknown) {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.every(
        (item) =>
          isRecord(item) &&
          typeof item.code === 'string' &&
          typeof item.name === 'string' &&
          (item.required === undefined || typeof item.required === 'boolean')
      ))
  );
}
