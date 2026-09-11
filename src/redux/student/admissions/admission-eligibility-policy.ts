import { readStageConfiguration } from './admission-assessment-policy';

export type AdmissionEligibilityKind =
  'age' | 'application' | 'inquiry' | 'assessment' | 'documents';
export type AdmissionEligibilityCriterion = {
  code: string;
  name: string;
  kind: AdmissionEligibilityKind;
  failureMessage?: string | null;
  minAgeMonths?: number | null;
  maxAgeMonths?: number | null;
  cutoffDate?: string | null;
  formDefinitionId?: string | null;
  conditionJson?: string | null;
  sourceStageCode?: string | null;
  minimumPercentage?: number | null;
  requiredOutcome?: 'passed' | 'waived' | 'verified' | null;
};
export type AdmissionEligibilityPolicy = {
  version: 1;
  enabled: boolean;
  allowExceptions: boolean;
  exceptionApprovalRole?: string | null;
  requireIndependentReviewer: boolean;
  criteria: AdmissionEligibilityCriterion[];
};
export const ELIGIBILITY_KINDS = [
  'age',
  'application',
  'inquiry',
  'assessment',
  'documents',
] as const;
export const DEFAULT_ELIGIBILITY_POLICY: AdmissionEligibilityPolicy = {
  version: 1,
  enabled: true,
  allowExceptions: false,
  requireIndependentReviewer: true,
  exceptionApprovalRole: null,
  criteria: [],
};
export const createEligibilityCriterion = (code: string): AdmissionEligibilityCriterion => ({
  code,
  name: '',
  kind: 'age',
  minAgeMonths: null,
  cutoffDate: '',
});

function isCriterion(value: unknown): value is AdmissionEligibilityCriterion {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.code === 'string' &&
    typeof item.name === 'string' &&
    ELIGIBILITY_KINDS.some((kind) => kind === item.kind) &&
    [
      'failureMessage',
      'cutoffDate',
      'formDefinitionId',
      'conditionJson',
      'sourceStageCode',
      'requiredOutcome',
    ].every((key) => item[key] == null || typeof item[key] === 'string') &&
    ['minAgeMonths', 'maxAgeMonths', 'minimumPercentage'].every(
      (key) => item[key] == null || (typeof item[key] === 'number' && Number.isFinite(item[key]))
    )
  );
}

export function readAdmissionEligibilityPolicy(json?: string): AdmissionEligibilityPolicy | null {
  const value = readStageConfiguration(json)?.eligibility;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const policy = value as Record<string, unknown>;
  if (
    policy.version !== 1 ||
    ['enabled', 'allowExceptions', 'requireIndependentReviewer'].some(
      (key) => typeof policy[key] !== 'boolean'
    ) ||
    (policy.exceptionApprovalRole != null && typeof policy.exceptionApprovalRole !== 'string') ||
    !Array.isArray(policy.criteria) ||
    !policy.criteria.every(isCriterion)
  )
    return null;
  return policy as AdmissionEligibilityPolicy;
}

export function writeAdmissionEligibilityPolicy(
  json: string | undefined,
  policy: AdmissionEligibilityPolicy
) {
  const configuration = readStageConfiguration(json);
  if (!configuration) throw new Error('The stage settings could not be read. Reopen the stage.');
  const previous = readAdmissionEligibilityPolicy(json);
  if (configuration.eligibility !== undefined && !previous) {
    throw new Error(
      'These eligibility settings are unsupported or incomplete. Reload the workflow.'
    );
  }
  return JSON.stringify({ ...configuration, eligibility: { ...previous, ...policy } });
}
