import type { AttendanceStudent } from 'src/redux/student/take-attendance/attendance-types';

import { it, expect, describe } from 'vitest';
import { AttendanceStatus } from 'src/enums/student-attendace-status';

import {
  getAttendanceCounts,
  hasAttendanceChanges,
  changeAttendanceMark,
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
  it('counts the complete eligible roster and keeps unknown separate from absent', () => {
    expect(
      getAttendanceCounts([
        row('one', { status: AttendanceStatus.Present }),
        row('two', { status: AttendanceStatus.Absent }),
        row('three'),
        row('half', { status: AttendanceStatus.Present, halfDay: true }),
        row('recorded-closed', { isExpected: false, status: AttendanceStatus.Present }),
        row('closed', { isExpected: false }),
      ])
    ).toEqual({ expected: 4, unmarked: 1, present: 1, halfDay: 1, absent: 1 });
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
  it('sets full, half, absent and pending marks without retaining incompatible details', () => {
    const student = row('one', { status: AttendanceStatus.Present, late: true, halfDay: true });
    expect(changeAttendanceMark(student, 'full')).toMatchObject({
      status: AttendanceStatus.Present,
      halfDay: false,
      late: true,
    });
    expect(changeAttendanceMark(student, 'half')).toMatchObject({
      status: AttendanceStatus.Present,
      halfDay: true,
      late: true,
    });
    expect(changeAttendanceMark(student, 'absent')).toMatchObject({
      status: AttendanceStatus.Absent,
      halfDay: false,
      late: false,
    });
    expect(changeAttendanceMark(student, 'pending')).toMatchObject({
      status: AttendanceStatus.Pending,
      halfDay: false,
      late: false,
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
