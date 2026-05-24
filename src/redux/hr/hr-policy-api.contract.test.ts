import { it, expect, describe } from 'vitest';

import {
  buildPolicyAssignmentPreviewParams,
  buildPolicyHolidayImpactPreviewParams,
} from './hr-policy-api';

describe('hrPolicyApi contracts', () => {
  it('builds holiday impact params with work calendar and month filters', () => {
    expect(
      buildPolicyHolidayImpactPreviewParams({
        academicYearId: 'year-1',
        workCalendarPolicyId: 'calendar-1',
        payrollPolicyId: 'payroll-1',
        attendancePolicyId: 'attendance-1',
        month: '2026-05',
        fromDate: '2026-05-01',
        toDate: '2026-05-31',
      })
    ).toEqual({
      academicYearId: 'year-1',
      workCalendarPolicyId: 'calendar-1',
      payrollPolicyId: 'payroll-1',
      attendancePolicyId: 'attendance-1',
      fromDate: undefined,
      toDate: undefined,
      month: '2026-05',
    });
  });

  it('keeps explicit date range when month is not selected', () => {
    expect(
      buildPolicyHolidayImpactPreviewParams({
        academicYearId: 'year-1',
        fromDate: '2026-05-10',
        toDate: '2026-05-20',
      })
    ).toMatchObject({
      academicYearId: 'year-1',
      fromDate: '2026-05-10',
      toDate: '2026-05-20',
      month: undefined,
    });
  });

  it('builds scoped assignment preview params from employee or group fields', () => {
    expect(
      buildPolicyAssignmentPreviewParams({
        academicYearId: 'year-1',
        date: '2026-05-20',
        employeeId: 'employee-1',
        groupId: 'group-1',
      })
    ).toEqual({
      academicYearId: 'year-1',
      date: '2026-05-20',
      employeeId: 'employee-1',
      groupId: 'group-1',
    });
  });

  it('omits empty scope fields from assignment preview params', () => {
    expect(
      buildPolicyAssignmentPreviewParams({
        academicYearId: 'year-1',
        date: '2026-05-20',
        employeeId: '',
        groupId: '',
      })
    ).toEqual({
      academicYearId: 'year-1',
      date: '2026-05-20',
      employeeId: undefined,
      groupId: undefined,
    });
  });
});
