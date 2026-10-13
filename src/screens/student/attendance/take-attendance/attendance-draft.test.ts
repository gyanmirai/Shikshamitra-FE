import type { AttendanceStudent } from 'src/redux/student/take-attendance/attendance-types';

import { it, expect, describe } from 'vitest';
import { AttendanceStatus } from 'src/enums/student-attendace-status';

import {
  getAttendanceCounts,
  hasAttendanceChanges,
  markRemainingPresent,
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
  it('does not bulk-mark rows governed by approval or leave-credit review', () => {
    const original = [
      row('editable'),
      row('approval', { requiresCorrectionApproval: true }),
      row('credit', { needsCreditCorrection: true }),
    ];
    const result = markRemainingPresent(original);
    expect(result[0].status).toBe(AttendanceStatus.Present);
    expect(result[1]).toEqual(original[1]);
    expect(result[2]).toEqual(original[2]);
    expect(original[0].status).toBe(AttendanceStatus.Pending);
  });
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
    ).toEqual({ expected: 3, unmarked: 1 });
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
