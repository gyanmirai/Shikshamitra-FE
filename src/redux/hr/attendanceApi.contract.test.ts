import { it, expect, describe } from 'vitest';
import { employeeType } from 'src/redux/tagTypes';

import { attendancePayrollInvalidationTags } from './attendanceApi';

describe('attendanceApi contracts', () => {
  it('invalidates payroll and dashboard data when attendance mutations can affect summaries', () => {
    expect(attendancePayrollInvalidationTags).toEqual(
      expect.arrayContaining([
        employeeType.attendance,
        employeeType.runPayroll,
        employeeType.hrDashboard,
      ])
    );
  });
});
