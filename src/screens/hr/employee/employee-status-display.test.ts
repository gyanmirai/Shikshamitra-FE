import { it, expect, describe } from 'vitest';
import { EmployeeStatusType } from 'src/enums/employee-status-type';

import { getEmployeeStatusDisplayValue } from './employee-status-display';

describe('staff status display', () => {
  it('shows active staff with future DOJ as upcoming', () => {
    const futureDoj = new Date();
    futureDoj.setDate(futureDoj.getDate() + 7);

    expect(getEmployeeStatusDisplayValue(EmployeeStatusType.Active, futureDoj)).toBe('Upcoming');
  });

  it('keeps active label after DOJ is effective', () => {
    const currentDoj = new Date();

    expect(getEmployeeStatusDisplayValue(EmployeeStatusType.Active, currentDoj)).toBe('Active');
  });
});
