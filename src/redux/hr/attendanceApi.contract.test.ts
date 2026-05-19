import { it, expect, describe } from 'vitest';
import { INITIAL_ATTENDANCE_CONFIG } from 'src/screens/hr/attendance-setting/types';
import { buildAttendanceConfigurationPreviewRequest } from 'src/screens/hr/attendance-setting/attendance-configuration-utils';
import {
  attendanceApi,
  buildGetDayAttendanceQueryParams,
  attendanceEvaluationPublishInvalidationTags,
} from 'src/redux/hr/attendanceApi';

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

  it('builds attendance configuration preview body with group filters', () => {
    const body = buildAttendanceConfigurationPreviewRequest(
      {
        fromDate: '2026-04-01',
        toDate: '2026-04-30',
        departmentId: 'Science',
        roleId: 'role-id',
        employeeType: 'non_teaching',
        shiftId: 'shift-id',
      },
      INITIAL_ATTENDANCE_CONFIG
    );

    expect(body.departmentId).toBe('Science');
    expect(body.roleId).toBe('role-id');
    expect(body.employeeType).toBe('non_teaching');
    expect(body.shiftId).toBe('shift-id');
    expect(body.configuration.payrollPreviewEnabled).toBe(true);
  });

  it('exposes attendance policy evaluation workflow endpoints', () => {
    expect(attendanceApi.endpoints.previewAttendancePolicyEvaluation).toBeTruthy();
    expect(attendanceApi.endpoints.createAttendancePolicyEvaluation).toBeTruthy();
    expect(attendanceApi.endpoints.getAttendancePolicyEvaluation).toBeTruthy();
    expect(attendanceApi.endpoints.getAttendancePolicyEvaluationResults).toBeTruthy();
    expect(attendanceApi.endpoints.approveAttendancePolicyEvaluation).toBeTruthy();
    expect(attendanceApi.endpoints.publishAttendancePolicyEvaluation).toBeTruthy();
  });

  it('publish evaluation invalidates run payroll cache', () => {
    expect(attendanceEvaluationPublishInvalidationTags).toContain('Run-Payroll');
  });
});
