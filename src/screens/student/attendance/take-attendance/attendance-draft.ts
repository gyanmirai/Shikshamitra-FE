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
  };
};

export const markRemainingPresent = (rows: AttendanceStudent[]) =>
  rows.map((row) =>
    row.isExpected && row.status === AttendanceStatus.Pending && !row.approvedLeaveId
      ? { ...row, status: AttendanceStatus.Present, late: false, halfDay: false }
      : row
  );

export const changeAttendanceStatus = (row: AttendanceStudent, status: AttendanceStatus) => ({
  ...row,
  status,
  late: status === AttendanceStatus.Present ? row.late : false,
  halfDay: status === AttendanceStatus.Present ? row.halfDay : false,
});

export const changeAttendanceMark = (
  row: AttendanceStudent,
  mark: 'full' | 'half' | 'absent' | 'pending'
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
