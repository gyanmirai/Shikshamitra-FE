import type {
  ReviewDraft,
  ReviewStatus,
  ReviewSummary,
  ReviewRecommendation,
  ReviewDecisionCapabilities,
} from 'src/redux/student/admissions/admission-review-types';

import * as Yup from 'yup';

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  notStarted: 'Not started',
  draft: 'Draft',
  submitted: 'Awaiting decision',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  correctionRequested: 'Corrections requested',
  stale: 'Review needed again',
};
export const recommendationLabels: Record<ReviewRecommendation, string> = {
  approve: 'Recommend approval',
  waitlist: 'Recommend waitlist',
  reject: 'Recommend rejection',
  requestCorrection: 'Request application corrections',
};
export function reviewDraftValues(summary: ReviewSummary): ReviewDraft {
  const record = summary.latestRecord?.status === 'assignment' ? null : summary.latestRecord;
  return {
    notes: record?.notes ?? '',
    reason: record?.reason ?? '',
    recommendation: record?.recommendation ?? null,
    checklist: (summary.policy?.checklist ?? []).map((item) => {
      const answer = record?.checklist.find((value) => value.code === item.code);
      return { code: item.code, checked: answer?.checked ?? false, notes: answer?.notes ?? '' };
    }),
  };
}
export const reviewDraftSchema = Yup.object({
  notes: Yup.string().nullable().max(1024, 'Use 1,024 characters or fewer.'),
  reason: Yup.string().nullable().max(1024, 'Use 1,024 characters or fewer.'),
  recommendation: Yup.string().nullable().oneOf(Object.keys(recommendationLabels)),
  checklist: Yup.array().of(
    Yup.object({ notes: Yup.string().nullable().max(1024, 'Use 1,024 characters or fewer.') })
  ),
});
export function reviewSubmitIssue(values: ReviewDraft, summary: ReviewSummary): string | null {
  if (!values.recommendation) return 'Choose a recommendation before submitting.';
  if (!values.reason?.trim()) return 'Explain the reason for your recommendation.';
  if (
    summary.policy?.checklist.some(
      (item) =>
        item.required && !values.checklist.find((answer) => answer.code === item.code)?.checked
    )
  )
    return 'Confirm every required checklist item before submitting.';
  return null;
}
export function managedReviewAllowsDecision(
  capabilities: ReviewDecisionCapabilities | null | undefined,
  action: string
) {
  if (!capabilities?.managedReviewEnabled) return true;
  if (action === 'approve') return capabilities.canApprove;
  if (action === 'reject') return capabilities.canReject;
  if (action === 'waitlist') return capabilities.canWaitlist;
  if (action === 'offer' || action === 'accept' || action === 'finalize')
    return capabilities.isSatisfied;
  return true;
}
