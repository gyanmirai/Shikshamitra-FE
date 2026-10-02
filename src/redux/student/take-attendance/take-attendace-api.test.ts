import { it, vi, expect, describe } from 'vitest';

import { attendanceDayCacheId, buildAttendanceRequest } from './take-attendace-api';

vi.mock('src/redux/service', () => ({ api: { injectEndpoints: () => ({}) } }));

describe('attendance API boundary', () => {
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
