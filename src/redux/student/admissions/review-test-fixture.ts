import type { ReviewRecord, ReviewSummary } from './admission-review-types';

export const reviewKey = { applicationId: 'application-1', stageId: 'review-1' };
export const reviewPath =
  '*/api/student/enrollment/admissions/reviews/applications/application-1/stages/review-1';
export const reviewRecord: ReviewRecord = {
  id: 'record-1',
  sequenceNumber: 1,
  status: 'submitted',
  notes: 'Checked the original record.',
  reason: 'All required information is confirmed.',
  recommendation: 'approve',
  checklist: [
    { code: 'IDENTITY', name: 'Identity confirmed', required: true, checked: true, notes: '' },
  ],
  recordedBy: 'reviewer-1',
  recordedAt: '2026-09-11T08:00:00Z',
  assignedReviewerId: 'reviewer-1',
  assignedReviewerName: 'Admissions Reviewer',
  dueAt: '2026-09-12T08:00:00Z',
  isStale: false,
  prerequisites: [],
  decision: null,
};
export const reviewSummary: ReviewSummary = {
  ...reviewKey,
  reviewEnabled: true,
  isActive: true,
  concurrencyStamp: 'application-stamp',
  status: 'notStarted',
  isStale: false,
  assignedReviewerId: 'reviewer-1',
  assignedReviewerName: 'Admissions Reviewer',
  dueAt: '2026-09-12T08:00:00Z',
  isOverdue: false,
  canSaveDraft: true,
  canSubmit: true,
  canAssign: true,
  canRequestCorrection: false,
  canComplete: false,
  blockers: [],
  latestRecord: null,
  decision: {
    managedReviewEnabled: true,
    isSatisfied: false,
    canApprove: false,
    canReject: false,
    canWaitlist: false,
    blockers: ['Submit a fresh recommendation.'],
  },
  prerequisites: [
    {
      kind: 'eligibility',
      sourceStageCode: 'ELIGIBILITY',
      sourceStageName: 'Eligibility check',
      stageId: 'eligibility-1',
      status: 'eligible',
      passed: true,
      isStale: false,
      summary: 'All eligibility criteria passed.',
    },
  ],
  policy: {
    version: 1,
    enabled: true,
    reviewerRole: 'Admission reviewer',
    assignedReviewerId: 'reviewer-1',
    requireIndependentApprover: true,
    approverRole: 'Admission approver',
    dueInDays: 2,
    prerequisites: [{ kind: 'eligibility', sourceStageCode: 'ELIGIBILITY' }],
    checklist: [{ code: 'IDENTITY', name: 'Identity confirmed', required: true }],
  },
};
