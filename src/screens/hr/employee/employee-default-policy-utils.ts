export const EMPLOYEE_CREATION_DEFAULT_POLICY_LOADING_MESSAGE =
  'Loading default payroll, attendance, and leave policies...';
export const EMPLOYEE_CREATION_DEFAULT_POLICY_MISSING_MESSAGE =
  'Default payroll, attendance, and leave policies are required before creating an employee.';
export const EMPLOYEE_CREATION_DEFAULT_POLICY_MULTIPLE_MESSAGE =
  'Exactly one default payroll, attendance, and leave policy is required before creating an employee.';
export const EMPLOYEE_CREATION_ACADEMIC_YEAR_MISSING_MESSAGE =
  'Current academic year is required before creating an employee.';

export type EmployeeCreationDefaultPolicyMessageInput = {
  currentYearId?: string | null;
  isLoading?: boolean;
  hasMultipleDefaults?: boolean;
  payrollPolicyId?: string | null;
  attendancePolicyId?: string | null;
  leavePolicyId?: string | null;
};

export function getEmployeeCreationDefaultPolicyMessage({
  currentYearId,
  isLoading = false,
  hasMultipleDefaults = false,
  payrollPolicyId,
  attendancePolicyId,
  leavePolicyId,
}: EmployeeCreationDefaultPolicyMessageInput): string {
  if (!currentYearId) {
    return EMPLOYEE_CREATION_ACADEMIC_YEAR_MISSING_MESSAGE;
  }

  if (isLoading) {
    return EMPLOYEE_CREATION_DEFAULT_POLICY_LOADING_MESSAGE;
  }

  if (hasMultipleDefaults) {
    return EMPLOYEE_CREATION_DEFAULT_POLICY_MULTIPLE_MESSAGE;
  }

  if (!payrollPolicyId || !attendancePolicyId || !leavePolicyId) {
    return EMPLOYEE_CREATION_DEFAULT_POLICY_MISSING_MESSAGE;
  }

  return '';
}
