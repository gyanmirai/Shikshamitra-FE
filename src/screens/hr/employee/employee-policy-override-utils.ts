export type EmployeePolicyOverrideValues = {
  policyOverrideEnabled?: boolean;
  policyOverridePayrollPolicyId?: string | null;
  policyOverrideAttendancePolicyId?: string | null;
  policyOverrideEffectiveFrom?: string | null;
  policyOverrideAssignmentReason?: string | null;
};

export const DEFAULT_EMPLOYEE_POLICY_OVERRIDE_REASON = 'Employee payroll step override';

export function buildEmployeePolicyOverride(
  values: EmployeePolicyOverrideValues,
  academicYearId?: string | null,
  confirmationToken?: string | null
) {
  if (
    !values.policyOverrideEnabled ||
    !academicYearId ||
    !values.policyOverridePayrollPolicyId ||
    !values.policyOverrideAttendancePolicyId ||
    !values.policyOverrideEffectiveFrom
  ) {
    return undefined;
  }

  return {
    academicYearId,
    payrollPolicyId: values.policyOverridePayrollPolicyId,
    attendancePolicyId: values.policyOverrideAttendancePolicyId,
    effectiveFrom: values.policyOverrideEffectiveFrom,
    assignmentReason:
      values.policyOverrideAssignmentReason || DEFAULT_EMPLOYEE_POLICY_OVERRIDE_REASON,
    ...(confirmationToken ? { confirmationToken } : {}),
  };
}

export function buildEmployeePolicyOverridePreviewRequest(
  values: EmployeePolicyOverrideValues,
  academicYearId: string | undefined | null,
  employeeId: string | undefined | null
) {
  const policyOverride = buildEmployeePolicyOverride(values, academicYearId);
  if (!policyOverride || !employeeId) {
    return undefined;
  }

  return {
    action: 'update',
    assignment: {
      academicYearId: policyOverride.academicYearId,
      targetType: 'employee' as const,
      targetKey: employeeId,
      targetDisplayName: employeeId,
      payrollPolicyId: policyOverride.payrollPolicyId,
      attendancePolicyId: policyOverride.attendancePolicyId,
      effectiveFrom: policyOverride.effectiveFrom,
      effectiveTo: null,
      priority: 100,
      assignmentReason: policyOverride.assignmentReason,
      isActive: true,
    },
  };
}
