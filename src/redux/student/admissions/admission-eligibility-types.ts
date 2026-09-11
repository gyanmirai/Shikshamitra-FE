import type { AdmissionEligibilityPolicy } from './admission-eligibility-policy';

export type EligibilityStageKey = { applicationId: string; stageId: string };
export type EligibilityOutcome = 'eligible' | 'ineligible' | 'needsInformation';
export type EligibilityStatus = EligibilityOutcome | 'notChecked' | 'exceptionApproved';
export type EligibilityCriterionResult = {
  code: string;
  name: string;
  kind: string;
  outcome: 'passed' | 'failed' | 'unknown';
  expected: string;
  actual: string;
  source: string;
  message: string;
};
export type EligibilityException = {
  id: string;
  evaluationId: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  canReview: boolean;
};
export type EligibilityEvaluation = {
  id: string;
  sequenceNumber: number;
  outcome: EligibilityOutcome;
  evaluatedBy: string;
  evaluatedAt: string;
  isStale: boolean;
  criteria: EligibilityCriterionResult[];
  exceptions: EligibilityException[];
};
export type EligibilitySummary = EligibilityStageKey & {
  eligibilityEnabled: boolean;
  policy: AdmissionEligibilityPolicy | null;
  isActive: boolean;
  concurrencyStamp: string;
  status: EligibilityStatus;
  isStale: boolean;
  canEvaluate: boolean;
  canRequestException: boolean;
  canReviewException: boolean;
  canComplete: boolean;
  blockers: string[];
  latestEvaluation: EligibilityEvaluation | null;
};
export type EligibilityCommand = EligibilityStageKey & { concurrencyStamp: string };
export const ELIGIBILITY_URL = '/student/enrollment/admissions/eligibility';
export const eligibilityStageUrl = ({ applicationId, stageId }: EligibilityStageKey) =>
  `${ELIGIBILITY_URL}/applications/${applicationId}/stages/${stageId}`;
export function unwrapEligibility<T>(response: T | { data: T }): T {
  return typeof response === 'object' && response !== null && 'data' in response
    ? response.data
    : response;
}
