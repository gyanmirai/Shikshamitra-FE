import type {
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

export type AssessmentAction =
  'book' | 'attendance' | 'result' | 'review' | 'retake' | 'cancel' | 'waive';
export type AssessmentActionValues = {
  sessionId: string;
  attendance: 'present' | 'absent';
  outcome: 'passed' | 'failed' | '';
  approved: boolean;
  marks: number | '';
  notes: string;
};
export const assessmentActionLabels: Record<AssessmentAction, string> = {
  book: 'Start assessment',
  attendance: 'Record attendance',
  result: 'Record result',
  review: 'Review result',
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
  if (action === 'book' && assessment.policy.schedulingEnabled && !values.sessionId)
    errors.sessionId = 'Choose a session';
  if (
    action === 'result' &&
    assessment.policy.scoringEnabled &&
    (values.marks === '' ||
      !Number.isFinite(values.marks) ||
      values.marks < 0 ||
      values.marks > assessment.policy.totalMarks)
  ) {
    errors.marks = `Enter marks between 0 and ${assessment.policy.totalMarks}`;
  }
  if (
    (action === 'waive' ||
      action === 'retake' ||
      action === 'cancel' ||
      (action === 'review' && !values.approved)) &&
    !values.notes.trim()
  ) {
    errors.notes = 'Enter a reason for this action';
  }
  if (action === 'result' && !assessment.policy.scoringEnabled && !values.outcome)
    errors.outcome = 'Choose a result';
  if (values.notes.trim().length > 1024) errors.notes = 'Notes cannot exceed 1,024 characters';
  return errors;
}
