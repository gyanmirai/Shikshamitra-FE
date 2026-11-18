import type { AttendanceStudent } from 'src/redux/student/take-attendance/attendance-types';

import { AttendanceStatus } from 'src/enums/student-attendace-status';

export const attendanceStudentName = (student: AttendanceStudent) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Student';

export const normalizeAttendanceRows = (rows: AttendanceStudent[]): AttendanceStudent[] =>
  rows.map((row) => ({
    ...row,
    remarks: row.remarks || '',
    late: !!row.late,
    halfDay: !!row.halfDay,
  }));

export const getAttendanceCounts = (rows: AttendanceStudent[]) => {
  const eligible = rows.filter((row) => row.isExpected);
  return {
    expected: eligible.length,
    unmarked: eligible.filter((row) => row.status === AttendanceStatus.Pending).length,
    present: eligible.filter((row) => row.status === AttendanceStatus.Present && !row.halfDay)
      .length,
    halfDay: eligible.filter((row) => row.status === AttendanceStatus.Present && row.halfDay)
      .length,
    absent: eligible.filter((row) => row.status === AttendanceStatus.Absent).length,
  };
};

export type AttendanceCounts = ReturnType<typeof getAttendanceCounts>;

export type AttendanceMarkChoice = 'full' | 'half' | 'absent' | 'pending';

export const canEditAttendanceRow = (row: AttendanceStudent) =>
  row.isExpected && !row.requiresCorrectionApproval && !row.needsCreditCorrection;

export const canBulkMarkAttendanceRow = (row: AttendanceStudent) =>
  canEditAttendanceRow(row) && !row.approvedLeaveId;

export const getAttendanceMarkRestriction = (
  mark: AttendanceMarkChoice,
  allowHalfDay: boolean | undefined,
  submitted: boolean
) => {
  if (mark === 'half' && !allowHalfDay) return 'Half-day attendance is disabled by school policy.';
  if (mark === 'pending' && submitted) return 'Submitted attendance cannot be changed to Pending.';
  return '';
};

export const changeAttendanceStatus = (row: AttendanceStudent, status: AttendanceStatus) => ({
  ...row,
  status,
  late: status === AttendanceStatus.Present ? row.late : false,
  halfDay: status === AttendanceStatus.Present ? row.halfDay : false,
});

export const changeAttendanceMark = (
  row: AttendanceStudent,
  mark: AttendanceMarkChoice
): AttendanceStudent => ({
  ...row,
  status:
    mark === 'absent'
      ? AttendanceStatus.Absent
      : mark === 'pending'
        ? AttendanceStatus.Pending
        : AttendanceStatus.Present,
  halfDay: mark === 'half',
  late: mark === 'full' || mark === 'half' ? row.late : false,
});

export const hasAttendanceChanges = (rows: AttendanceStudent[], original: AttendanceStudent[]) => {
  if (rows.length !== original.length) return true;
  const source = new Map(original.map((row) => [row.studentId, row]));
  return rows.some((row) => {
    const before = source.get(row.studentId);
    return (
      !before ||
      row.enrollmentId !== before.enrollmentId ||
      row.status !== before.status ||
      !!row.late !== !!before.late ||
      !!row.halfDay !== !!before.halfDay ||
      (row.remarks || '') !== (before.remarks || '')
    );
  });
};
