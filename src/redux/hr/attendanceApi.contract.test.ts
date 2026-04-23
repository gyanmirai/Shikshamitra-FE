import { it, expect, describe } from 'vitest';
import { buildGetDayAttendanceQueryParams } from 'src/redux/hr/attendanceApi';

describe('attendanceApi contract helpers', () => {
  it('builds day attendance query params without stage id and with defaults', () => {
    const params = buildGetDayAttendanceQueryParams({
      attendanceDate: '2026-04-01',
      search: 'john',
    });

    expect(params).toEqual({
      attendanceDate: '2026-04-01',
      department: undefined,
      isTeaching: undefined,
      roleId: undefined,
      search: 'john',
      skipCount: 0,
      maxResultCount: 50,
    });
    expect('educationMediumStageId' in params).toBe(false);
  });
});
