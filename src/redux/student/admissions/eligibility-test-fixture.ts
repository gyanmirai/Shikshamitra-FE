import type {
  EligibilitySummary,
  EligibilityException,
  EligibilityEvaluation,
} from './admission-eligibility-types';

export const eligibilityKey = { applicationId: 'application-1', stageId: 'eligibility-1' };
export const eligibilityPath =
  '*/api/student/enrollment/admissions/eligibility/applications/application-1/stages/eligibility-1';
export const eligibilityEvaluation: EligibilityEvaluation = {
  id: 'evaluation-1',
  sequenceNumber: 1,
  outcome: 'ineligible',
  evaluatedBy: 'staff-1',
  evaluatedAt: '2026-09-10T10:00:00Z',
  isStale: false,
  criteria: [
    {
      code: 'MINIMUM_AGE',
      name: 'Minimum age',
      kind: 'age',
      outcome: 'failed',
      expected: 'At least 60 months on 1 June 2026',
      actual: '59 months',
      source: 'Applicant date of birth',
      message: 'The applicant is younger than the configured minimum age.',
    },
  ],
  exceptions: [],
};
export const eligibilityException: EligibilityException = {
  id: 'exception-1',
  evaluationId: 'evaluation-1',
  reason: 'Review the transfer circumstances.',
  requestedBy: 'staff-1',
  requestedAt: '2026-09-10T11:00:00Z',
  status: 'pending',
  reviewReason: null,
  reviewedBy: null,
  reviewedAt: null,
  canReview: true,
};
export const eligibilitySummary: EligibilitySummary = {
  ...eligibilityKey,
  eligibilityEnabled: true,
  isActive: true,
  concurrencyStamp: 'application-stamp',
  status: 'notChecked',
  isStale: false,
  canEvaluate: true,
  canRequestException: false,
  canReviewException: false,
  canComplete: false,
  blockers: ['Run the eligibility check.'],
  latestEvaluation: null,
  policy: {
    version: 1,
    enabled: true,
    allowExceptions: true,
    exceptionApprovalRole: 'Admissions reviewer',
    requireIndependentReviewer: true,
    criteria: [
      {
        code: 'MINIMUM_AGE',
        name: 'Minimum age',
        kind: 'age',
        cutoffDate: '2026-06-01',
        minAgeMonths: 60,
      },
    ],
  },
};
