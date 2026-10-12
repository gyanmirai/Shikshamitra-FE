import { it, vi, expect, describe } from 'vitest';

import {
  attendanceDayCacheId,
  buildAttendanceRequest,
  normalizeAttendanceDay,
} from './take-attendace-api';

import type { AttendanceDay } from './attendance-types';

vi.mock('src/redux/service', () => ({ api: { injectEndpoints: () => ({}) } }));

describe('attendance API boundary', () => {
  it('keeps prefixed and legacy GR identifiers available to table display and search', () => {
    const response: AttendanceDay = {
      date: '2026-10-12',
      isLocked: false,
      isSubmitted: false,
      rosterRevision: 'roster',
      canMark: true,
      isExpected: true,
      policy: { allowLate: true, allowHalfDay: true, halfDayCredit: 0.5, lateCredit: 1 },
      students: [
        {
          studentId: 'prefixed',
          grNumber: 'QAS26-000001',
          grNo: null,
          status: 0,
          late: false,
          halfDay: false,
          isExpected: true,
        },
        { studentId: 'legacy', grNo: 42, status: 0, late: false, halfDay: false, isExpected: true },
      ],
    };
    const result = normalizeAttendanceDay(response);
    expect(result.students.map((student) => student.grNo)).toEqual(['QAS26-000001', 42]);
    expect(response.students[0].grNo).toBeNull();
    expect(result.students[0].studentId).toBe('prefixed');
  });
  it('uses the existing authenticated route and preserves calendar-date query semantics', () => {
    const args = {
      AcademicYearId: 'year',
      StandardId: 'standard',
      DivisionId: 'division',
      Date: '2026-09-30',
    };
    expect(buildAttendanceRequest(args)).toEqual({
      url: '/students/attendance/students',
      method: 'GET',
      params: args,
    });
    expect(attendanceDayCacheId(args)).toBe('year/standard/division/2026-09-30');
  });
  it('invalidates the same day key from the mutation scope without mixing classes or dates', () => {
    expect(
      attendanceDayCacheId({
        academicYearId: 'year',
        standardId: 'standard',
        divisionId: 'division',
        date: '2026-09-30',
      })
    ).toBe('year/standard/division/2026-09-30');
    expect(
      attendanceDayCacheId({
        academicYearId: 'year',
        standardId: 'standard',
        divisionId: 'other',
        date: '2026-09-30',
      })
    ).not.toBe('year/standard/division/2026-09-30');
  });
});
