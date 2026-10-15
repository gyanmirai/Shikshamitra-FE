import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { assessmentErrorMessage } from './assessment-utils';

export type AssessmentBatchAction = 'attendance' | 'result' | 'continue';
export type AssessmentBatchValue = {
  attendance: '' | 'present' | 'absent';
  marks: number | '';
  outcome: '' | 'passed' | 'failed';
  notes: string;
};
export type AssessmentBatchResult = { stageInstanceId: string; success: boolean; message: string };

export type AssessmentBatchWriteIntent = {
  action: 'attendance' | 'result';
  attemptId: string;
  attendance?: 'present' | 'absent';
  marks?: number;
  outcome?: 'passed' | 'failed';
  notes: string;
};

export function assessmentBatchWriteIntent(
  action: 'attendance' | 'result',
  row: AssessmentRosterItem,
  attemptId: string,
  value: AssessmentBatchValue
): AssessmentBatchWriteIntent {
  return {
    action,
    attemptId,
    notes: value.notes.trim(),
    ...(action === 'attendance'
      ? { attendance: value.attendance as 'present' | 'absent' }
      : row.assessment.policy?.scoringEnabled
        ? { marks: Number(value.marks) }
        : { outcome: value.outcome as 'passed' | 'failed' }),
  };
}

/** Reconcile only previously sent, unchanged intent against the same persisted attempt. */
export function assessmentBatchIntentApplied(
  intent: AssessmentBatchWriteIntent,
  attempt: AssessmentAttempt
) {
  if (intent.attemptId !== attempt.id || attempt.status === 'cancelled') return false;
  if ((attempt.notes ?? '').trim() !== intent.notes) return false;
  return intent.action === 'attendance'
    ? attempt.attendance === intent.attendance
    : ['completed', 'pendingReview'].includes(attempt.status) &&
        (intent.marks !== undefined
          ? attempt.marks === intent.marks && ['passed', 'failed'].includes(attempt.outcome)
          : attempt.outcome === intent.outcome);
}

export function validateAssessmentBatchValue(
  action: AssessmentBatchAction,
  row: AssessmentRosterItem,
  value: AssessmentBatchValue
) {
  if (!row.isActive || !row.assessment.policy) return 'This assessment is read-only.';
  if (value.notes.trim().length > 1024) return 'Notes cannot exceed 1,024 characters.';
  if (action === 'attendance' && !['present', 'absent'].includes(value.attendance))
    return 'Select Present or Absent.';
  if (action === 'result') {
    const { policy } = row.assessment;
    if (
      policy.scoringEnabled &&
      (value.marks === '' ||
        !Number.isFinite(value.marks) ||
        value.marks < 0 ||
        value.marks > policy.totalMarks)
    )
      return `Enter marks between 0 and ${policy.totalMarks}.`;
    if (!policy.scoringEnabled && !['passed', 'failed'].includes(value.outcome))
      return 'Select Passed or Failed.';
  }
  return '';
}

/** Each item is independently governed; failed writes stay available for an explicit retry. */
export async function runAssessmentBatch(
  rows: AssessmentRosterItem[],
  execute: (row: AssessmentRosterItem) => Promise<unknown>,
  report: (result: AssessmentBatchResult) => void
) {
  if (rows.length > 100) throw new Error('Select at most 100 applicants per batch.');
  const results: AssessmentBatchResult[] = [];
  await rows.reduce<Promise<void>>(
    (previous, row) =>
      previous.then(async () => {
        let result: AssessmentBatchResult;
        try {
          const response = await execute(row);
          result = {
            stageInstanceId: row.stageInstanceId,
            success: true,
            message:
              response &&
              typeof response === 'object' &&
              'reconciled' in response &&
              response.reconciled
                ? 'Verified saved values'
                : 'Saved',
          };
        } catch (error) {
          result = {
            stageInstanceId: row.stageInstanceId,
            success: false,
            message: assessmentErrorMessage(error),
          };
        }
        results.push(result);
        report(result);
      }),
    Promise.resolve()
  );
  return results;
}
