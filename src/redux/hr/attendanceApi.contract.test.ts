import { it, expect, describe } from 'vitest';
import { employeeType } from 'src/redux/tagTypes';

import { attendancePayrollInvalidationTags } from './attendanceApi';

describe('attendanceApi contracts', () => {
  it('invalidates payroll data when attendance mutations can affect payroll', () => {
    expect(attendancePayrollInvalidationTags).toEqual(
      expect.arrayContaining([employeeType.attendance, employeeType.runPayroll])
    );
  });
});
