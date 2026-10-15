import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { it, vi, expect, describe } from 'vitest';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import {
  runAssessmentBatch,
  assessmentBatchWriteIntent,
  validateAssessmentBatchValue,
  assessmentBatchIntentApplied,
} from './assessment-batch-model';

import type { AssessmentBatchValue } from './assessment-batch-model';

const row = (id = 'stage-1', totalMarks = 100): AssessmentRosterItem => ({
  applicationId: `application-${id}`,
  applicationNumber: `ADM-${id}`,
  applicantId: `applicant-${id}`,
  applicantName: `Applicant ${id}`,
  stageInstanceId: id,
  stageName: 'Assessment',
  applicationStatus: 1,
  stageStatus: 1,
  isActive: true,
  queue: 'result',
  assessment: {
    ...assessmentResponse,
    policy: { ...assessmentResponse.policy!, totalMarks },
  },
});
const values = (override: Partial<AssessmentBatchValue> = {}): AssessmentBatchValue => ({
  attendance: '',
  marks: '',
  outcome: '',
  notes: '',
  ...override,
});

describe('assessment batch validation', () => {
  it('reconciles lost responses only against exact values and notes on the same persisted attempt', () => {
    const intent = assessmentBatchWriteIntent(
      'result',
      row(),
      'attempt-1',
      values({ marks: 60, notes: ' Exam ' })
    );
    const saved: AssessmentAttempt = {
      id: 'attempt-1',
      attemptNumber: 1,
      attendance: 'present',
      status: 'completed',
      outcome: 'passed',
      marks: 60,
      notes: 'Exam',
      concurrencyStamp: 'new-stamp',
      createdAt: '2026-10-14T04:30:00Z',
    };
    expect(assessmentBatchIntentApplied(intent, saved)).toBe(true);
    expect(assessmentBatchIntentApplied(intent, { ...saved, id: 'attempt-2' })).toBe(false);
    expect(assessmentBatchIntentApplied(intent, { ...saved, marks: 61 })).toBe(false);
    expect(assessmentBatchIntentApplied(intent, { ...saved, notes: 'Another result' })).toBe(false);
    expect(assessmentBatchIntentApplied(intent, { ...saved, status: 'cancelled' })).toBe(false);
    expect(assessmentBatchIntentApplied(intent, { ...saved, outcome: 'retake' })).toBe(false);
  });

  it.each(['present', 'absent'] as const)(
    'reconciles explicit saved %s attendance without inventing absence',
    (attendance) => {
      const intent = assessmentBatchWriteIntent(
        'attendance',
        row(),
        'attempt-1',
        values({ attendance })
      );
      const saved: AssessmentAttempt = {
        id: 'attempt-1',
        attemptNumber: 1,
        attendance,
        status: attendance === 'absent' ? 'completed' : 'pending',
        outcome: attendance === 'absent' ? 'absent' : 'pending',
        concurrencyStamp: 'new-stamp',
        createdAt: '2026-10-14T04:30:00Z',
      };
      expect(assessmentBatchIntentApplied(intent, saved)).toBe(true);
      expect(assessmentBatchIntentApplied(intent, { ...saved, attendance: 'pending' })).toBe(false);
    }
  );

  it('reconciles non-scoring outcomes without comparing unrelated marks', () => {
    const interview = row();
    interview.assessment.policy = { ...interview.assessment.policy!, scoringEnabled: false };
    const intent = assessmentBatchWriteIntent(
      'result',
      interview,
      'attempt-1',
      values({ outcome: 'passed' })
    );
    const saved: AssessmentAttempt = {
      id: 'attempt-1',
      attemptNumber: 1,
      attendance: 'present',
      status: 'pendingReview',
      outcome: 'passed',
      concurrencyStamp: 'new-stamp',
      createdAt: '2026-10-14T04:30:00Z',
    };
    expect(intent.marks).toBeUndefined();
    expect(assessmentBatchIntentApplied(intent, saved)).toBe(true);
    expect(assessmentBatchIntentApplied(intent, { ...saved, outcome: 'failed' })).toBe(false);
  });

  it('requires explicit attendance without treating an untouched value as absent', () => {
    const untouched = values();
    expect(validateAssessmentBatchValue('attendance', row(), untouched)).toBe(
      'Select Present or Absent.'
    );
    expect(untouched.attendance).toBe('');
    expect(
      validateAssessmentBatchValue('attendance', row(), values({ attendance: 'present' }))
    ).toBe('');
    expect(
      validateAssessmentBatchValue('attendance', row(), values({ attendance: 'absent' }))
    ).toBe('');
  });

  it('uses each applicant policy instead of a shared session marks limit', () => {
    const entered = values({ marks: 60 });
    expect(validateAssessmentBatchValue('result', row('exam-100', 100), entered)).toBe('');
    expect(validateAssessmentBatchValue('result', row('exam-50', 50), entered)).toBe(
      'Enter marks between 0 and 50.'
    );
    expect(validateAssessmentBatchValue('result', row('exam-50', 50), values({ marks: 0 }))).toBe(
      ''
    );
    expect(validateAssessmentBatchValue('result', row('exam-50', 50), values({ marks: 50 }))).toBe(
      ''
    );
  });

  it.each(['', -1, Number.NaN, Number.POSITIVE_INFINITY, 101] as const)(
    'rejects missing, non-finite or out-of-range scoring marks: %s',
    (marks) =>
      expect(validateAssessmentBatchValue('result', row(), values({ marks }))).toBe(
        'Enter marks between 0 and 100.'
      )
  );

  it('requires an explicit interview outcome when scoring is disabled', () => {
    const interview = row();
    interview.assessment.policy = { ...interview.assessment.policy!, scoringEnabled: false };
    expect(validateAssessmentBatchValue('result', interview, values({ marks: 80 }))).toBe(
      'Select Passed or Failed.'
    );
    expect(validateAssessmentBatchValue('result', interview, values({ outcome: 'passed' }))).toBe(
      ''
    );
    expect(validateAssessmentBatchValue('result', interview, values({ outcome: 'failed' }))).toBe(
      ''
    );
  });

  it.each(['attendance', 'result', 'continue'] as const)(
    'refuses %s for read-only history or an unmanaged stage',
    (action) => {
      const history = { ...row(), isActive: false, stageStatus: 2 };
      const unmanaged = { ...row(), assessment: { ...assessmentResponse, policy: null } };
      expect(
        validateAssessmentBatchValue(action, history, values({ attendance: 'present', marks: 50 }))
      ).toBe('This assessment is read-only.');
      expect(
        validateAssessmentBatchValue(
          action,
          unmanaged,
          values({ attendance: 'present', marks: 50 })
        )
      ).toBe('This assessment is read-only.');
    }
  );

  it('rejects oversized notes without changing the draft', () => {
    const draft = values({ attendance: 'present', notes: 'n'.repeat(1025) });
    expect(validateAssessmentBatchValue('attendance', row(), draft)).toBe(
      'Notes cannot exceed 1,024 characters.'
    );
    expect(draft.notes).toHaveLength(1025);
    expect(
      validateAssessmentBatchValue('attendance', row(), { ...draft, notes: 'n'.repeat(1024) })
    ).toBe('');
  });
});

describe('assessment batch recovery', () => {
  it('continues after a failed write and reports saved and failed items independently', async () => {
    const rows = [row('first'), row('stale'), row('last')];
    const execute = vi
      .fn<(item: AssessmentRosterItem) => Promise<unknown>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce({
        status: 409,
        data: { detail: 'This record changed. Refresh before retrying.' },
      })
      .mockResolvedValueOnce(undefined);
    const report = vi.fn();
    const results = await runAssessmentBatch(rows, execute, report);
    expect(execute.mock.calls.map(([item]) => item.stageInstanceId)).toEqual([
      'first',
      'stale',
      'last',
    ]);
    expect(results).toEqual([
      { stageInstanceId: 'first', success: true, message: 'Saved' },
      {
        stageInstanceId: 'stale',
        success: false,
        message: 'This record changed. Refresh before retrying.',
      },
      { stageInstanceId: 'last', success: true, message: 'Saved' },
    ]);
    expect(report.mock.calls.map(([result]) => result)).toEqual(results);
    const failedIds = new Set(
      results.filter((result) => !result.success).map((result) => result.stageInstanceId)
    );
    const retry = vi.fn(async () => undefined);
    await runAssessmentBatch(
      rows.filter((item) => failedIds.has(item.stageInstanceId)),
      retry,
      vi.fn()
    );
    expect(retry).toHaveBeenCalledOnce();
    expect(retry).toHaveBeenCalledWith(rows[1]);
  });

  it('keeps writes sequential rather than overlapping commands against the same application', async () => {
    let inFlight = 0;
    let maximum = 0;
    await runAssessmentBatch(
      [row('one'), row('two')],
      async () => {
        inFlight += 1;
        maximum = Math.max(maximum, inFlight);
        await Promise.resolve();
        inFlight -= 1;
      },
      vi.fn()
    );
    expect(maximum).toBe(1);
  });

  it('rejects a batch over 100 before any write but accepts the limit', async () => {
    const execute = vi.fn(async () => undefined);
    const report = vi.fn();
    const rows = Array.from({ length: 101 }, (_, index) => row(`stage-${index}`));
    await expect(runAssessmentBatch(rows, execute, report)).rejects.toThrow(
      'Select at most 100 applicants per batch.'
    );
    expect(execute).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
    expect(await runAssessmentBatch(rows.slice(0, 100), execute, report)).toHaveLength(100);
    expect(execute).toHaveBeenCalledTimes(100);
  });

  it('does not write anything when no applicants were selected', async () => {
    const execute = vi.fn();
    const report = vi.fn();
    expect(await runAssessmentBatch([], execute, report)).toEqual([]);
    expect(execute).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });
});
