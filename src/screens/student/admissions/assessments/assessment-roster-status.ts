import type { LabelColor } from 'src/components/label/types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentAttempt,
  AssessmentDisplayStatus,
  AssessmentDisplayAttendance,
} from 'src/redux/student/admissions/admission-assessment-types';

export const assessmentStatusLabels = {
  notBooked: 'Not booked',
  scheduled: 'Scheduled',
  attendancePending: 'Attendance pending',
  resultPending: 'Result pending',
  reviewPending: 'Review pending',
  ongoing: 'In progress',
  passed: 'Pass',
  failed: 'Failed',
  absent: 'Absent',
  waived: 'Waived',
  retakeRequired: 'Retake required',
  unavailable: 'Unavailable',
};
export const assessmentAttendanceLabels = {
  pending: 'Pending',
  present: 'Present',
  absent: 'Absent',
  notMarked: 'Not marked',
  notRequired: 'Not required',
  notApplicable: '—',
};

export function assessmentStatusColor(status: AssessmentDisplayStatus): LabelColor {
  if (status === 'passed') return 'success';
  if (status === 'failed' || status === 'absent') return 'error';
  if (['attendancePending', 'resultPending', 'reviewPending', 'retakeRequired'].includes(status))
    return 'warning';
  return ['scheduled', 'ongoing', 'waived'].includes(status) ? 'info' : 'default';
}

// Prefer the server projection used by filters/counts. Evidence-based fallback supports older hosts.
export function getAssessmentRosterDisplay(row: AssessmentRosterItem, attempt?: AssessmentAttempt) {
  const required = row.assessment.policy?.attendanceRequired !== false;
  const future =
    !!(attempt?.slotStartsAt ?? attempt?.sessionStartsAt) &&
    Date.parse((attempt?.slotStartsAt ?? attempt?.sessionStartsAt)!) > Date.now();
  let status: AssessmentDisplayStatus;
  if (!attempt || attempt.status === 'cancelled') status = 'notBooked';
  else if (attempt.outcome === 'waived') status = 'waived';
  else if (attempt.outcome === 'retake') status = 'retakeRequired';
  else if (future) status = 'scheduled';
  else if (attempt.status === 'pendingReview') status = 'reviewPending';
  else if (required && attempt.attendance === 'pending') status = 'attendancePending';
  else if (row.status === 'complete' && ['passed', 'failed', 'absent'].includes(attempt.outcome))
    status = attempt.outcome as AssessmentDisplayStatus;
  else if (attempt.status === 'completed') status = 'ongoing';
  else status = 'resultPending';
  const attendance: AssessmentDisplayAttendance =
    attempt?.attendance === 'present' || attempt?.attendance === 'absent'
      ? attempt.attendance
      : !attempt || attempt.status === 'cancelled'
        ? 'notApplicable'
        : attempt.outcome === 'waived' || !required
          ? 'notRequired'
          : future
            ? 'notMarked'
            : 'pending';
  return {
    status:
      row.displayStatus && Object.hasOwn(assessmentStatusLabels, row.displayStatus)
        ? row.displayStatus
        : status,
    attendance:
      row.displayAttendance && Object.hasOwn(assessmentAttendanceLabels, row.displayAttendance)
        ? row.displayAttendance
        : attendance,
  };
}
