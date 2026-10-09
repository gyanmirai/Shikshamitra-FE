import type {
  PayrollProfileDetails,
  PayrollProfileDetailsPatch,
} from 'src/redux/hr/employee-payroll-profile-api';

import { hrPaths } from 'src/constants/hr-menus';

import { salaryEditorHref } from '../payroll/structure/salary-editor-navigation';

export function staffPayrollProfileHref(employeeId: string) {
  return `${hrPaths.employee.list}?${new URLSearchParams({ employee: employeeId, tab: 'personalInformation', infoTab: 'payroll' })}`;
}

export function staffPayrollEditHref(employeeId: string) {
  return `${hrPaths.employee.list}?${new URLSearchParams({ mode: 'form', editEmployee: employeeId, step: 'payroll' })}`;
}

export function staffSalaryEditorHref(
  employeeId: string,
  origin: 'staff-profile' | 'staff-edit' = 'staff-profile'
) {
  return salaryEditorHref(
    employeeId,
    origin === 'staff-edit' ? staffPayrollEditHref(employeeId) : staffPayrollProfileHref(employeeId)
  );
}

export function changedPayrollProfileGroups(
  initial: PayrollProfileDetails,
  values: PayrollProfileDetails
): PayrollProfileDetailsPatch {
  return Object.fromEntries(
    (Object.keys(values) as Array<keyof PayrollProfileDetails>)
      .filter((key) => JSON.stringify(initial[key]) !== JSON.stringify(values[key]))
      .map((key) => [key, values[key]])
  );
}
