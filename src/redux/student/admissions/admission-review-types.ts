import type { AdmissionReviewPolicy } from './admission-review-policy';

export type ReviewStageKey = { applicationId: string; stageId: string };
export type ReviewRecommendation = 'approve' | 'waitlist' | 'reject' | 'requestCorrection';
export type ReviewStatus =
  | 'notStarted'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'waitlisted'
  | 'rejected'
  | 'correctionRequested'
  | 'stale';
export type ReviewEvidence = {
  kind: string;
  sourceStageCode: string;
  sourceStageName: string;
  stageId: string | null;
  status: string;
  passed: boolean;
  isStale: boolean;
  summary: string;
};
export type ReviewChecklistAnswer = { code: string; checked: boolean; notes: string | null };
export type ReviewDecisionCapabilities = {
  managedReviewEnabled: boolean;
  isSatisfied: boolean;
  canApprove: boolean;
  canReject: boolean;
  canWaitlist: boolean;
  blockers: string[];
};
export type ReviewDecision = {
  id: string;
  recordId: string;
  decision: ReviewRecommendation;
  reason: string | null;
  decidedBy: string;
  decidedAt: string;
};
export type ReviewRecord = {
  id: string;
  sequenceNumber: number;
  status: 'draft' | 'submitted' | 'assignment';
  notes: string | null;
  reason: string | null;
  recommendation: ReviewRecommendation | null;
  checklist: (ReviewChecklistAnswer & { name: string; required: boolean })[];
  recordedBy: string;
  recordedAt: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  dueAt: string | null;
  isStale: boolean;
  prerequisites: ReviewEvidence[];
  decision: ReviewDecision | null;
};
export type ReviewSummary = ReviewStageKey & {
  reviewEnabled: boolean;
  policy: AdmissionReviewPolicy | null;
  isActive: boolean;
  concurrencyStamp: string;
  status: ReviewStatus;
  isStale: boolean;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  dueAt: string | null;
  isOverdue: boolean;
  canSaveDraft: boolean;
  canSubmit: boolean;
  canAssign: boolean;
  canRequestCorrection: boolean;
  canComplete: boolean;
  blockers: string[];
  prerequisites: ReviewEvidence[];
  latestRecord: ReviewRecord | null;
  decision: ReviewDecisionCapabilities;
};
export type ReviewDraft = {
  notes: string | null;
  recommendation: ReviewRecommendation | null;
  reason: string | null;
  checklist: ReviewChecklistAnswer[];
};
export type ReviewCommand = ReviewStageKey & { concurrencyStamp: string };
export type ReviewQueueItem = ReviewStageKey & {
  applicationNumber: string;
  applicantName: string;
  stageName: string;
  status: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  dueAt: string | null;
  isOverdue: boolean;
  isStale: boolean;
};
export type ReviewQueueInput = {
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  standardIds?: string[];
  overdueOnly?: boolean;
  assignedToMe?: boolean;
  skipCount: number;
  maxResultCount: number;
};
export const REVIEW_URL = '/student/enrollment/admissions/reviews';
export const reviewStageUrl = ({ applicationId, stageId }: ReviewStageKey) =>
  `${REVIEW_URL}/applications/${applicationId}/stages/${stageId}`;
export function unwrapReview<T>(response: T | { data: T }): T {
  return typeof response === 'object' && response !== null && 'data' in response
    ? response.data
    : response;
}
