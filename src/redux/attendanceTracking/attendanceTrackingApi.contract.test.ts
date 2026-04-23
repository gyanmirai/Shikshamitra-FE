import { it, expect, describe } from 'vitest';
import {
  buildDateWiseAttendanceParams,
  buildEmployeeWiseAttendanceParams,
} from 'src/redux/attendanceTracking/attendanceTrackingApi';

describe('attendanceTrackingApi contract helpers', () => {
  it('keeps only BE-supported status filter values and required stage id for date-wise', () => {
    const params = buildDateWiseAttendanceParams({
      attendanceDate: '22/04/2026',
      status: 'HALF_DAY',
      educationMediumStageId: 'stage-1',
    });

    expect(params).toEqual({
      attendanceDate: '22/04/2026',
      status: 'HALF_DAY',
      educationMediumStageId: 'stage-1',
      search: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('builds employee-wise params with stage id and optional status', () => {
    const params = buildEmployeeWiseAttendanceParams({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
      educationMediumStageId: 'stage-1',
      status: 'REJECTED_LEAVE',
    });

    expect(params).toEqual({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
      educationMediumStageId: 'stage-1',
      status: 'REJECTED_LEAVE',
      search: undefined,
      page: 1,
      pageSize: 10,
    });
  });
});
