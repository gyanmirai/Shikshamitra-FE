import { it, expect, describe } from 'vitest';
import {
  mapEmployeeWiseAttendanceRow,
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
      academicYearId: 'year-1',
      educationMediumStageId: 'stage-1',
      status: 'REJECTED_LEAVE',
    });

    expect(params).toEqual({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
      academicYearId: 'year-1',
      educationMediumStageId: 'stage-1',
      status: 'REJECTED_LEAVE',
      search: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('omits employee-wise stage id when backend should infer employee stages', () => {
    const params = buildEmployeeWiseAttendanceParams({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
    });

    expect(params).toEqual({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
      status: undefined,
      search: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('includes employee-wise academic year id when supplied', () => {
    const params = buildEmployeeWiseAttendanceParams({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
      academicYearId: 'year-1',
    });

    expect(params).toEqual({
      employeeId: 'emp-1',
      startDate: '01/04/2026',
      endDate: '22/04/2026',
      academicYearId: 'year-1',
      status: undefined,
      search: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('maps employee-wise response rows using the BE response field names', () => {
    expect(
      mapEmployeeWiseAttendanceRow({
        date: '2026-04-22T00:00:00+00:00',
        inTime: '08:30 AM',
        outTime: '05:30 PM',
        hoursWorked: '09H 00M',
        status: 0,
        description: 'On time',
        employeeCode: 'ignored',
      })
    ).toEqual({
      date: '2026-04-22T00:00:00+00:00',
      inTime: '08:30 AM',
      outTime: '05:30 PM',
      hoursWorked: '09H 00M',
      status: 0,
      description: 'On time',
    });
  });
});
