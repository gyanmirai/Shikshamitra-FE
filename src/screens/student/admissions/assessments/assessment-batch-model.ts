import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentAttempt,
  AssessmentSubjectScore,
} from 'src/redux/student/admissions/admission-assessment-types';

import { assessmentErrorMessage } from './assessment-utils';
import { latestAssessmentAttempt } from './assessment-action-model';
import {
  assessmentProfileKey,
  assessmentResultProfile,
  assessmentSubjectPayload,
  validateAssessmentSubjectValues,
} from './assessment-subject-results';

import type { AssessmentSubjectValues } from './assessment-subject-results';

export type AssessmentBatchAction = 'attendance' | 'result' | 'continue';
export type AssessmentBatchValue = {
  attendance: '' | 'present' | 'absent';
  marks: number | '';
  outcome: '' | 'passed' | 'failed';
  notes: string;
  subjectScores?: AssessmentSubjectValues;
};
export type AssessmentBatchResult = {
  stageInstanceId: string;
  success: boolean;
  message: string;
  draft?: boolean;
};

export type AssessmentBatchWriteIntent = {
  action: 'attendance' | 'result' | 'resultDraft';
  attemptId: string;
  attendance?: 'present' | 'absent';
  marks?: number;
  outcome?: 'passed' | 'failed';
  notes: string;
  subjectScores?: AssessmentSubjectScore[];
};

export function assessmentBatchWriteIntent(
  action: 'attendance' | 'result',
  row: AssessmentRosterItem,
  attemptId: string,
  value: AssessmentBatchValue,
  draft = false
): AssessmentBatchWriteIntent {
  const profile = assessmentResultProfile(row.assessment, latestAssessmentAttempt(row.assessment));
  return {
    action: action === 'result' && draft ? 'resultDraft' : action,
    attemptId,
    notes: value.notes.trim(),
    ...(action === 'attendance'
      ? { attendance: value.attendance as 'present' | 'absent' }
      : profile
        ? { subjectScores: assessmentSubjectPayload(profile, value.subjectScores) }
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
  if (intent.subjectScores) {
    const savedScores = attempt.subjectScores ?? [];
    if (
      savedScores.length !== intent.subjectScores.length ||
      intent.subjectScores.some(
        (score) =>
          !savedScores.some((saved) => saved.code === score.code && saved.marks === score.marks)
      )
    )
      return false;
    return intent.action === 'resultDraft'
      ? attempt.status === 'pending' && attempt.outcome === 'pending'
      : ['completed', 'pendingReview'].includes(attempt.status) &&
          ['passed', 'failed'].includes(attempt.outcome);
  }
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
  value: AssessmentBatchValue,
  draft = false
) {
  if (!row.isActive || !row.assessment.policy) return 'This assessment is read-only.';
  if (value.notes.trim().length > 1024) return 'Notes cannot exceed 1,024 characters.';
  if (action === 'attendance' && !['present', 'absent'].includes(value.attendance))
    return 'Select Present or Absent.';
  if (action === 'result') {
    const { policy } = row.assessment;
    const profile = assessmentResultProfile(
      row.assessment,
      latestAssessmentAttempt(row.assessment)
    );
    if (profile)
      return (
        Object.values(validateAssessmentSubjectValues(profile, value.subjectScores, draft))[0] ?? ''
      );
    if (policy.scoringMode === 'subjects')
      return 'The class assessment profile is unavailable. Refresh before recording results.';
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

export function groupAssessmentBatchRows(rows: AssessmentRosterItem[]) {
  const groups = new Map<string, { key: string; label: string; rows: AssessmentRosterItem[] }>();
  rows.forEach((row) => {
    const profile = assessmentResultProfile(
      row.assessment,
      latestAssessmentAttempt(row.assessment)
    );
    const key = `${row.className ?? row.offeringName ?? ''}:${assessmentProfileKey(profile)}`;
    const group = groups.get(key) ?? {
      key,
      label: [row.className ?? row.offeringName, profile?.name ?? 'Single result']
        .filter(Boolean)
        .join(' · '),
      rows: [],
    };
    group.rows.push(row);
    groups.set(key, group);
  });
  return [...groups.values()];
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
