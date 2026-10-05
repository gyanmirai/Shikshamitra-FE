import type { DefaultPolicySetupState } from '../policies/hr-policy-workspace-utils';

export const EMPLOYEE_CREATION_DEFAULT_POLICY_LOADING_MESSAGE = 'Loading default policies...';
export const EMPLOYEE_CREATION_DEFAULT_POLICY_MISSING_MESSAGE = 'Default leave policy missing';
export const EMPLOYEE_CREATION_DEFAULT_POLICY_MULTIPLE_MESSAGE = 'Multiple default policies';
export const EMPLOYEE_CREATION_ACADEMIC_YEAR_MISSING_MESSAGE = 'Select an academic year';

export type EmployeeCreationDefaultPolicyMessageInput = {
  currentYearId?: string | null;
  isLoading?: boolean;
  hasMultipleDefaults?: boolean;
  payrollPolicyId?: string | null;
  attendancePolicyId?: string | null;
  leavePolicyId?: string | null;
  setupStates?: Record<'leave' | 'attendance' | 'payroll', DefaultPolicySetupState>;
};

export function getEmployeeCreationDefaultPolicyMessage({
  currentYearId,
  isLoading = false,
  hasMultipleDefaults = false,
  payrollPolicyId,
  attendancePolicyId,
  leavePolicyId,
  setupStates,
}: EmployeeCreationDefaultPolicyMessageInput): string {
  if (!currentYearId) {
    return EMPLOYEE_CREATION_ACADEMIC_YEAR_MISSING_MESSAGE;
  }

  if (isLoading) {
    return EMPLOYEE_CREATION_DEFAULT_POLICY_LOADING_MESSAGE;
  }

  if (setupStates) {
    if (Object.values(setupStates).includes('unknown'))
      return 'Default policies could not be verified';
    const policy = (['leave', 'attendance', 'payroll'] as const).find(
      (kind) => setupStates[kind] === 'multiple' || setupStates[kind] === 'missing'
    );
    if (policy)
      return setupStates[policy] === 'multiple'
        ? `Multiple default ${policy} policies`
        : `Default ${policy} policy missing`;
    return '';
  }

  if (hasMultipleDefaults) {
    return EMPLOYEE_CREATION_DEFAULT_POLICY_MULTIPLE_MESSAGE;
  }

  if (!payrollPolicyId || !attendancePolicyId || !leavePolicyId) {
    const policy = !leavePolicyId ? 'leave' : !attendancePolicyId ? 'attendance' : 'payroll';
    return `Default ${policy} policy missing`;
  }

  return '';
}
