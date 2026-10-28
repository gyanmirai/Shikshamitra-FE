import type { AssessmentAttempt } from 'src/redux/student/admissions/admission-assessment-types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { it, expect } from 'vitest';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { getAssessmentRosterDisplay } from './assessment-roster-status';

const row = {
  assessment: {
    ...assessmentResponse,
    policy: { ...assessmentResponse.policy!, attendanceRequired: true },
  },
  status: 'ongoing',
} as AssessmentRosterItem;
const attempt = {
  id: 'attempt',
  attemptNumber: 1,
  attendance: 'pending',
  outcome: 'pending',
  status: 'pending',
  concurrencyStamp: 'stamp',
} as AssessmentAttempt;

it.each([
  [undefined, 'pending', 'notBooked', 'notApplicable'],
  [{ ...attempt, sessionStartsAt: '2099-01-01T00:00:00Z' }, 'pending', 'scheduled', 'notMarked'],
  [attempt, 'ongoing', 'attendancePending', 'pending'],
  [{ ...attempt, attendance: 'present' }, 'ongoing', 'resultPending', 'present'],
  [
    { ...attempt, attendance: 'present', status: 'completed', outcome: 'passed' },
    'complete',
    'passed',
    'present',
  ],
  [
    { ...attempt, attendance: 'present', status: 'completed', outcome: 'failed' },
    'complete',
    'failed',
    'present',
  ],
  [
    { ...attempt, attendance: 'absent', status: 'completed', outcome: 'absent' },
    'complete',
    'absent',
    'absent',
  ],
  [{ ...attempt, status: 'completed', outcome: 'waived' }, 'complete', 'waived', 'notRequired'],
  [
    { ...attempt, attendance: 'present', status: 'completed', outcome: 'waived' },
    'complete',
    'waived',
    'present',
  ],
  [
    { ...attempt, attendance: 'absent', status: 'completed', outcome: 'retake' },
    'pending',
    'retakeRequired',
    'absent',
  ],
  [
    { ...attempt, attendance: 'present', status: 'pendingReview', outcome: 'passed' },
    'ongoing',
    'reviewPending',
    'present',
  ],
] as const)(
  'renders evidence-based status and attendance for older hosts: %s',
  (evidence, progress, status, attendance) => {
    expect(getAssessmentRosterDisplay({ ...row, status: progress }, evidence)).toEqual({
      status,
      attendance,
    });
  }
);

it('uses the server state as the authority for selected-session history and filters', () => {
  expect(
    getAssessmentRosterDisplay(
      { ...row, displayStatus: 'failed', displayAttendance: 'present' },
      attempt
    )
  ).toEqual({ status: 'failed', attendance: 'present' });
});
