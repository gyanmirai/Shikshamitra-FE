import { it, expect, describe } from 'vitest';
import { employeeType } from 'src/redux/tagTypes';

import {
  buildWorkExperienceUrl,
  buildEmployeeSubresourceUrl,
  employeePayrollInvalidationTags,
} from './employeeApi';

describe('employeeApi contracts', () => {
  it('builds work experience URL from an object argument', () => {
    expect(buildWorkExperienceUrl({ id: 'employee-1' })).toBe(
      '/employees/employee-1/work-experience'
    );
  });

  it('builds work experience URL from a plain employee id', () => {
    expect(buildWorkExperienceUrl('employee-2')).toBe('/employees/employee-2/work-experience');
  });

  it('does not place literal undefined in the work experience URL', () => {
    expect(() => buildWorkExperienceUrl(undefined)).toThrow('Employee id is required');
  });

  it('builds employee subresource URLs from employeeId arguments', () => {
    expect(buildEmployeeSubresourceUrl({ employeeId: 'employee-3' }, 'family-info')).toBe(
      '/employees/employee-3/family-info'
    );
  });

  it('does not place literal undefined in employee subresource URLs', () => {
    expect(() => buildEmployeeSubresourceUrl({ employeeId: undefined }, 'family-info')).toThrow(
      'Employee id is required to access family-info.'
    );
  });

  it('invalidates effective policy preview data after payroll details are saved', () => {
    expect(employeePayrollInvalidationTags).toEqual(
      expect.arrayContaining([
        employeeType.employee,
        employeeType.attendanceRule,
        employeeType.runPayroll,
      ])
    );
  });
});
