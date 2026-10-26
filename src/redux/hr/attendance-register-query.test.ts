import { it, vi, expect, describe } from 'vitest';

import { buildAttendanceRegisterParams } from './attendanceApi';

vi.mock('./employeeApi', () => ({ employeeApi: { injectEndpoints: () => ({}) } }));

describe('attendance register wire query', () => {
  it('composes multiple divisions and staff criteria without flattening the array', () => {
    expect(
      buildAttendanceRegisterParams({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        educationMediumStageIds: ['division-a', 'division-b', 'division-a'],
        employeeId: 'staff-1',
        department: 'Science',
        employeeGroup: 'Teaching',
        search: 'Ada',
        sorting: 'employeeName desc',
        skipCount: 50,
        maxResultCount: 50,
      })
    ).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      'educationMediumStageIds[0]': 'division-a',
      'educationMediumStageIds[1]': 'division-b',
      employeeId: 'staff-1',
      department: 'Science',
      employeeGroup: 'Teaching',
      search: 'Ada',
      sorting: 'employeeName desc',
      skipCount: 50,
      maxResultCount: 50,
    });
  });

  it('sends no division restriction after reset and preserves legacy single selection', () => {
    expect(
      buildAttendanceRegisterParams({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        educationMediumStageIds: [],
        employeeId: '',
      })
    ).toEqual({ startDate: '2026-10-01', endDate: '2026-10-31', skipCount: 0, maxResultCount: 50 });
    expect(
      buildAttendanceRegisterParams({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        educationMediumStageId: 'legacy',
      })
    ).toHaveProperty('educationMediumStageId', 'legacy');
  });
});
