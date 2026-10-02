import type { AttendanceStudent } from 'src/redux/student/take-attendance/attendance-types';

import { it, expect, describe } from 'vitest';
import { AttendanceStatus } from 'src/enums/student-attendace-status';

import {
  getAttendanceCounts,
  hasAttendanceChanges,
  markRemainingPresent,
  changeAttendanceStatus,
  normalizeAttendanceRows,
} from './attendance-draft';

const row = (id: string, changes: Partial<AttendanceStudent> = {}): AttendanceStudent => ({
  studentId: id,
  status: AttendanceStatus.Pending,
  isExpected: true,
  late: false,
  halfDay: false,
  ...changes,
});
describe('daily attendance draft', () => {
  it('fills only eligible unmarked students without replacing absences, details or approved leave', () => {
    const original = [
      row('new'),
      row('absent', { status: AttendanceStatus.Absent, remarks: 'Ill' }),
      row('present', { status: AttendanceStatus.Present, late: true }),
      row('leave', { approvedLeaveId: 'leave' }),
      row('not-scheduled', { isExpected: false }),
    ];
    const result = markRemainingPresent(original);
    expect(result.map((item) => item.status)).toEqual([
      AttendanceStatus.Present,
      AttendanceStatus.Absent,
      AttendanceStatus.Present,
      AttendanceStatus.Pending,
      AttendanceStatus.Pending,
    ]);
    expect(result[1]).toEqual(original[1]);
    expect(result[2].late).toBe(true);
    expect(original[0].status).toBe(AttendanceStatus.Pending);
  });
  it('counts the complete eligible roster and keeps unknown separate from absent', () => {
    expect(
      getAttendanceCounts([
        row('one', { status: AttendanceStatus.Present }),
        row('two', { status: AttendanceStatus.Absent }),
        row('three'),
        row('closed', { isExpected: false }),
      ])
    ).toEqual({ expected: 3, present: 1, absent: 1, unmarked: 1, notExpected: 1 });
  });
  it('clears present-only details when a mark becomes absent or unmarked', () => {
    const student = row('one', {
      status: AttendanceStatus.Present,
      late: true,
      halfDay: true,
      remarks: 'Note',
    });
    expect(changeAttendanceStatus(student, AttendanceStatus.Absent)).toMatchObject({
      late: false,
      halfDay: false,
      remarks: 'Note',
    });
    expect(changeAttendanceStatus(student, AttendanceStatus.Pending)).toMatchObject({
      late: false,
      halfDay: false,
    });
  });
  it('detects placement, detail and note changes independent of row ordering', () => {
    const source = normalizeAttendanceRows([
      row('one'),
      row('two', { enrollmentId: 'enrollment' }),
    ]);
    expect(hasAttendanceChanges([...source].reverse(), source)).toBe(false);
    expect(hasAttendanceChanges([source[0], { ...source[1], enrollmentId: 'other' }], source)).toBe(
      true
    );
    expect(hasAttendanceChanges([{ ...source[0], remarks: 'reason' }, source[1]], source)).toBe(
      true
    );
    expect(hasAttendanceChanges([{ ...source[0], late: true }, source[1]], source)).toBe(true);
  });
});
