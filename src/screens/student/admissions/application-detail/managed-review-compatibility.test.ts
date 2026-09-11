import { it, expect } from 'vitest';
import { reviewSummary } from 'src/redux/student/admissions/review-test-fixture';

import { managedReviewAllowsDecision } from '../review/review-model';
import { getStageGuidance, canCompleteStageFromProgress } from './application-progress-model';

const reviewStage = {
  id: 'review',
  definitionStageId: 'definition-review',
  code: 'REVIEW',
  name: 'Review',
  stageType: 6,
  status: 1,
  displayOrder: 3,
  allowManualSkip: false,
  reviewEnabled: true,
};

it('preserves legacy Review completion and gates managed Review through its explicit workspace', () => {
  expect(canCompleteStageFromProgress({ ...reviewStage, reviewEnabled: undefined }, 1, true)).toBe(
    true
  );
  expect(canCompleteStageFromProgress({ ...reviewStage, reviewEnabled: false }, 1, true)).toBe(
    true
  );
  expect(canCompleteStageFromProgress(reviewStage, 6, true)).toBe(false);
  expect(getStageGuidance(reviewStage, 1)).toContain('authorized admission decision');
});

it('uses separate backend decision capabilities and keeps legacy decisions unchanged', () => {
  expect(managedReviewAllowsDecision(undefined, 'approve')).toBe(true);
  expect(
    managedReviewAllowsDecision({ ...reviewSummary.decision, managedReviewEnabled: false }, 'offer')
  ).toBe(true);
  expect(managedReviewAllowsDecision(reviewSummary.decision, 'approve')).toBe(false);
  expect(
    managedReviewAllowsDecision({ ...reviewSummary.decision, canReject: true }, 'reject')
  ).toBe(true);
  ['offer', 'accept', 'finalize'].forEach((action) => {
    expect(managedReviewAllowsDecision(reviewSummary.decision, action)).toBe(false);
    expect(
      managedReviewAllowsDecision({ ...reviewSummary.decision, isSatisfied: true }, action)
    ).toBe(true);
  });
  expect(managedReviewAllowsDecision(reviewSummary.decision, 'decline')).toBe(true);
});
