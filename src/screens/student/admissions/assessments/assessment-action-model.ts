import type {
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

import {
  assessmentResultProfile,
  validateAssessmentSubjectValues,
} from './assessment-subject-results';

import type { AssessmentSubjectValues } from './assessment-subject-results';

export type AssessmentAction =
  'book' | 'attendance' | 'result' | 'resultDraft' | 'retake' | 'cancel' | 'waive';
export type AssessmentActionValues = {
  sessionId: string;
  slotStartsAt?: string;
  requiresSlot?: boolean;
  attendance: 'present' | 'absent';
  outcome: 'passed' | 'failed' | '';
  approved: boolean;
  marks: number | '';
  notes: string;
  subjectScores?: AssessmentSubjectValues;
};
export const assessmentActionLabels: Record<AssessmentAction, string> = {
  book: 'Start assessment',
  attendance: 'Record attendance',
  result: 'Record result',
  resultDraft: 'Save draft',
  retake: 'Allow retake',
  cancel: 'Cancel attempt',
  waive: 'Waive assessment',
};

export function latestAssessmentAttempt(assessment: ApplicationAssessment) {
  return assessment.attempts
    .filter((attempt) => attempt.status !== 'cancelled')
    .reduce<ApplicationAssessment['attempts'][number] | undefined>(
      (latest, attempt) =>
        !latest || attempt.attemptNumber > latest.attemptNumber ? attempt : latest,
      undefined
    );
}

export function validateAssessmentAction(
  action: AssessmentAction,
  values: AssessmentActionValues,
  assessment: ManagedApplicationAssessment
) {
  const errors: Partial<Record<keyof AssessmentActionValues, string>> = {};
  const profile = assessmentResultProfile(assessment, latestAssessmentAttempt(assessment));
  if (
    (action === 'result' || action === 'resultDraft') &&
    assessment.policy.scoringMode === 'subjects' &&
    !profile
  ) {
    errors.subjectScores =
      'The class assessment profile is unavailable. Refresh before recording results.';
    return errors;
  }
  if ((action === 'result' || action === 'resultDraft') && profile) {
    const subjectErrors = validateAssessmentSubjectValues(
      profile,
      values.subjectScores,
      action === 'resultDraft'
    );
    if (Object.keys(subjectErrors).length) errors.subjectScores = Object.values(subjectErrors)[0];
  }
  if (action === 'book' && assessment.policy.schedulingEnabled && !values.sessionId)
    errors.sessionId = 'Choose a session';
  if (action === 'book' && values.requiresSlot && !values.slotStartsAt)
    errors.slotStartsAt = 'Choose an interview time slot';
  if (
    action === 'result' &&
    !profile &&
    assessment.policy.scoringEnabled &&
    (values.marks === '' ||
      !Number.isFinite(values.marks) ||
      values.marks < 0 ||
      values.marks > assessment.policy.totalMarks)
  ) {
    errors.marks = `Enter marks between 0 and ${assessment.policy.totalMarks}`;
  }
  if ((action === 'waive' || action === 'retake' || action === 'cancel') && !values.notes.trim()) {
    errors.notes = 'Enter a reason for this action';
  }
  if (action === 'result' && !profile && !assessment.policy.scoringEnabled && !values.outcome)
    errors.outcome = 'Choose a result';
  if (values.notes.trim().length > 1024) errors.notes = 'Notes cannot exceed 1,024 characters';
  return errors;
}
