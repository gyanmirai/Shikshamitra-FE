import { it, expect, describe } from 'vitest';
import { employeeType } from 'src/redux/tagTypes';

import {
  buildWorkExperienceUrl,
  buildReportingManagerUrl,
  buildEmployeeDashboardUrl,
  buildEmployeeSubresourceUrl,
  EMPLOYEE_LIST_MAX_PAGE_SIZE,
  buildEmployeeListQueryParams,
  employeePayrollInvalidationTags,
} from './employeeApi';

describe('employeeApi contracts', () => {
  it('builds work experience URL from an object argument', () => {
    expect(buildWorkExperienceUrl({ id: 'employee-1' })).toBe(
      '/employees/employee-1/work-experience'
    );
  });

  it('builds work experience URL from a plain staff id', () => {
    expect(buildWorkExperienceUrl('employee-2')).toBe('/employees/employee-2/work-experience');
  });

  it('does not place literal undefined in the work experience URL', () => {
    expect(() => buildWorkExperienceUrl(undefined)).toThrow('Staff id is required');
  });

  it('builds staff subresource URLs from employeeId arguments', () => {
    expect(buildEmployeeSubresourceUrl({ employeeId: 'employee-3' }, 'family-info')).toBe(
      '/employees/employee-3/family-info'
    );
  });

  it('builds reporting manager URLs for assign mutation', () => {
    expect(buildReportingManagerUrl({ id: 'employee-4' })).toBe(
      '/employees/employee-4/reporting-manager'
    );
  });

  it('builds the staff dashboard URL from the staff id contract', () => {
    expect(buildEmployeeDashboardUrl({ employeeId: 'employee-5' })).toBe(
      '/employees/employee-5/dashboard'
    );
  });

  it('does not place literal undefined in staff subresource URLs', () => {
    expect(() => buildEmployeeSubresourceUrl({ employeeId: undefined }, 'family-info')).toThrow(
      'Staff id is required to access family-info.'
    );
  });

  it('invalidates effective policy preview data after payroll details are saved', () => {
    expect(employeePayrollInvalidationTags).toEqual(
      expect.arrayContaining([
        employeeType.employee,
        employeeType.attendanceRule,
        employeeType.runPayroll,
        employeeType.salarySlip,
      ])
    );
  });

  it('builds staff directory params with boolean teaching filters and without empty values', () => {
    expect(
      buildEmployeeListQueryParams({
        page: 2,
        pageSize: 25,
        search: '',
        mediumStageId: '',
        reportingManagerStatus: 'nonActive',
        status: 'Active',
        isTeaching: 'true',
      })
    ).toEqual({
      page: 2,
      pageSize: 25,
      reportingManagerStatus: 'nonActive',
      status: 'Active',
      isTeaching: true,
    });

    expect(buildEmployeeListQueryParams({ isTeaching: false })).toEqual({
      page: 1,
      pageSize: 10,
      isTeaching: false,
    });
  });

  it('caps staff directory page size at the backend contract limit', () => {
    expect(buildEmployeeListQueryParams({ page: 1, pageSize: 1000 })).toEqual({
      page: 1,
      pageSize: EMPLOYEE_LIST_MAX_PAGE_SIZE,
    });

    expect(buildEmployeeListQueryParams({ page: 1, pageSize: '1000' })).toEqual({
      page: 1,
      pageSize: EMPLOYEE_LIST_MAX_PAGE_SIZE,
    });
  });
});
