import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { useAssessmentActions } from './use-assessment-actions';

import type { AssessmentActionValues } from './assessment-action-model';

const mocks = vi.hoisted(() => ({ attendance: vi.fn(), result: vi.fn(), other: vi.fn() }));
vi.mock('src/redux/student/admissions/admission-assessments-api', () => ({
  useBookAssessmentAttemptMutation: () => [mocks.other],
  useAllowAssessmentRetakeMutation: () => [mocks.other],
  useRecordAssessmentResultMutation: () => [mocks.result],
  useCancelAssessmentAttemptMutation: () => [mocks.other],
  useRecordAssessmentAttendanceMutation: () => [mocks.attendance],
  useWaiveApplicationAssessmentMutation: () => [mocks.other],
}));

const reviewed = {
  applicationId: 'application',
  stageInstanceId: 'stage',
  concurrencyStamp: 'stage-reviewed',
  policy: DEFAULT_ASSESSMENT_POLICY,
  attempts: [
    { id: 'attempt', attemptNumber: 1, concurrencyStamp: 'attempt-reviewed', status: 'pending' },
  ],
} as ManagedApplicationAssessment;
const values: AssessmentActionValues = {
  sessionId: '',
  attendance: 'present',
  outcome: '',
  approved: true,
  marks: 69.25,
  notes: '',
};
beforeEach(() => {
  vi.clearAllMocks();
  Object.values(mocks).forEach((mutation) =>
    mutation.mockReturnValue({ unwrap: () => Promise.resolve() })
  );
});
it('sends the reviewed attempt stamp and unrounded marks despite newer query state', async () => {
  const current = {
    ...reviewed,
    attempts: [{ ...reviewed.attempts[0], concurrencyStamp: 'newer-stamp' }],
  };
  const { result } = renderHook(() => useAssessmentActions(current));
  await result.current('result', values, reviewed);
  expect(mocks.result).toHaveBeenCalledWith({
    attemptId: 'attempt',
    concurrencyStamp: 'attempt-reviewed',
    marks: 69.25,
    notes: undefined,
  });
});
it('preserves default attendance payloads and optional notes for existing dialog callers', async () => {
  const { result } = renderHook(() => useAssessmentActions(reviewed));
  await result.current('attendance', {
    ...values,
    attendance: 'absent',
    notes: '  Parent informed  ',
  });
  expect(mocks.attendance).toHaveBeenCalledWith({
    attemptId: 'attempt',
    concurrencyStamp: 'attempt-reviewed',
    attendance: 'absent',
    notes: 'Parent informed',
  });
});
it('sends an outcome without marks for a non-scoring reviewed policy', async () => {
  const { result } = renderHook(() => useAssessmentActions(reviewed));
  await result.current(
    'result',
    { ...values, outcome: 'passed' },
    { ...reviewed, policy: { ...reviewed.policy, scoringEnabled: false } }
  );
  expect(mocks.result).toHaveBeenCalledWith({
    attemptId: 'attempt',
    concurrencyStamp: 'attempt-reviewed',
    outcome: 'passed',
    notes: undefined,
  });
});
