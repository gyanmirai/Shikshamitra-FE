import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { EmployeeStatusType } from 'src/enums/employee-status-type';

import { getEmployeeStatusOptions, changeStatusValidationSchema } from './change-status-utils';

describe('employee change status form', () => {
  it('requires remarks for Left or Retired status', async () => {
    await expect(
      changeStatusValidationSchema.validate({
        status: { label: 'Left', value: EmployeeStatusType.Left },
        remarks: '',
      })
    ).rejects.toThrow('Remarks are required for Left or Retired status');

    await expect(
      changeStatusValidationSchema.validate({
        status: { label: 'Retired', value: EmployeeStatusType.Retired },
        effectiveDate: dayjs('2026-05-30'),
        remarks: 'Completed service',
      })
    ).resolves.toBeTruthy();
  });

  it('does not offer Active for terminal status transitions', () => {
    expect(getEmployeeStatusOptions(EmployeeStatusType.Left)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ value: EmployeeStatusType.Active })])
    );

    expect(getEmployeeStatusOptions(EmployeeStatusType.Retired)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ value: EmployeeStatusType.Active })])
    );
  });

  it('preserves same-status terminal updates', () => {
    expect(getEmployeeStatusOptions(EmployeeStatusType.Left)).toEqual(
      expect.arrayContaining([expect.objectContaining({ value: EmployeeStatusType.Left })])
    );

    expect(getEmployeeStatusOptions(EmployeeStatusType.Retired)).toEqual(
      expect.arrayContaining([expect.objectContaining({ value: EmployeeStatusType.Retired })])
    );
  });
});
