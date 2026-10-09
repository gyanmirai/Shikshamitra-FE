import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { it, expect, describe } from 'vitest';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { validateAssessmentAction } from './assessment-action-model';

import type { AssessmentActionValues } from './assessment-action-model';

const assessment: ManagedApplicationAssessment = {
  ...assessmentResponse,
  policy: DEFAULT_ASSESSMENT_POLICY,
};
const values: AssessmentActionValues = {
  sessionId: '',
  attendance: 'present',
  outcome: '',
  approved: true,
  marks: '',
  notes: '',
};

describe('assessment action validation', () => {
  it('allows a below-pass score to be recorded for retake or a failure route', () => {
    expect(validateAssessmentAction('result', { ...values, marks: 12 }, assessment)).toEqual({});
  });

  it('requires an explicit result when the stage does not use marks', () => {
    const manual = { ...assessment, policy: { ...assessment.policy, scoringEnabled: false } };
    expect(validateAssessmentAction('result', values, manual)).toEqual({
      outcome: 'Choose a result',
    });
    expect(validateAssessmentAction('result', { ...values, outcome: 'failed' }, manual)).toEqual(
      {}
    );
  });

  it('requires a session only for scheduled assessments', () => {
    expect(validateAssessmentAction('book', values, assessment)).toEqual({});
    expect(
      validateAssessmentAction('book', values, {
        ...assessment,
        policy: { ...assessment.policy, schedulingEnabled: true },
      })
    ).toEqual({ sessionId: 'Choose a session' });
  });

  it.each(['waive', 'retake', 'cancel'] as const)('requires an audit reason to %s', (action) => {
    expect(
      validateAssessmentAction(action, { ...values, notes: '  ' }, assessment).notes
    ).toBeTruthy();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 101])('rejects invalid marks %s', (marks) => {
    expect(validateAssessmentAction('result', { ...values, marks }, assessment).marks).toBeTruthy();
  });
});
