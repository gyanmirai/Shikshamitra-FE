import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';
import { DEFAULT_REVIEW_POLICY } from 'src/redux/student/admissions/admission-review-policy';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { getReviewStageError } from './review-stage-prerequisites';

const source: AdmissionWorkflowStage = {
  id: 'exam',
  code: 'EXAM',
  name: 'Entrance assessment',
  stageType: 2,
  displayOrder: 1,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  configurationJson: JSON.stringify({ assessment: DEFAULT_ASSESSMENT_POLICY }),
};
const review: AdmissionWorkflowStage = {
  ...source,
  id: 'review',
  code: 'REVIEW',
  name: 'Admissions review',
  stageType: 6,
  displayOrder: 2,
  configurationJson: JSON.stringify({
    review: {
      ...DEFAULT_REVIEW_POLICY,
      prerequisites: [{ kind: 'assessment', sourceStageCode: 'EXAM' }],
    },
  }),
};

describe('review evidence configuration constraints', () => {
  it('accepts an earlier managed source', () => {
    expect(getReviewStageError(review, [source, review])).toBeUndefined();
  });

  it('describes a missing prerequisite without exposing its internal stage code', () => {
    const message = getReviewStageError(review, [review]);
    expect(message).toContain('saved assessment prerequisite');
    expect(message).not.toContain(source.code);
  });

  it.each([
    { ...source, displayOrder: 3 },
    { ...source, configurationJson: undefined },
    { ...source, stageType: 5 as const },
  ])('requires the configured source to be earlier, managed and of the matching kind', (stage) => {
    expect(getReviewStageError(review, [stage, review])).toContain('earlier configured stage');
  });

  it('blocks a second managed Review while retaining existing basic Review stages', () => {
    const second = { ...review, id: 'another', code: 'ANOTHER_REVIEW' };
    expect(getReviewStageError(review, [source, review, second])).toContain('one managed Review');
    expect(
      getReviewStageError(review, [source, review, { ...second, configurationJson: undefined }])
    ).toBeUndefined();
  });
});
