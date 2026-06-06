export type EmployeePolicyOverrideValues = {
  policyOverrideEnabled?: boolean;
  policyOverrideWasEnabled?: boolean;
  policyOverridePayrollPolicyId?: string | null;
  policyOverrideAttendancePolicyId?: string | null;
  policyOverrideEffectiveFrom?: string | null;
  policyOverrideAssignmentReason?: string | null;
};

export const DEFAULT_EMPLOYEE_POLICY_OVERRIDE_REASON = 'Employee payroll step override';

export function clearEmployeePolicyOverrideValues(values: EmployeePolicyOverrideValues) {
  return {
    policyOverrideEnabled: false,
    policyOverrideWasEnabled: Boolean(values.policyOverrideWasEnabled),
    policyOverridePayrollPolicyId: '',
    policyOverrideAttendancePolicyId: '',
    policyOverrideEffectiveFrom: '',
    policyOverrideAssignmentReason: '',
  };
}

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

export function buildEmployeePolicyOverrideAction(
  values: EmployeePolicyOverrideValues,
  academicYearId?: string | null
) {
  if (values.policyOverrideEnabled) {
    return buildEmployeePolicyOverride(values, academicYearId) ? 'upsert' : undefined;
  }

  return values.policyOverrideWasEnabled ? 'disable' : undefined;
}

export function resolveEmployeePolicyPreviewDate(
  values: EmployeePolicyOverrideValues,
  fallbackDate: string
) {
  return values.policyOverrideEffectiveFrom || fallbackDate;
}

export function hydrateEmployeePolicyOverrideFromPreview(
  preview: any,
  fallbackEffectiveFrom: string
) {
  const assignment = preview?.assignment;
  const isEmployeeOverride =
    preview?.policySource === 'employee' || preview?.matchedTargetType === 'employee';

  if (!isEmployeeOverride || !assignment) {
    return {
      policyOverrideEnabled: false,
      policyOverrideWasEnabled: false,
      policyOverridePayrollPolicyId: '',
      policyOverrideAttendancePolicyId: '',
      policyOverrideEffectiveFrom: fallbackEffectiveFrom,
      policyOverrideAssignmentReason: '',
    };
  }

  return {
    policyOverrideEnabled: true,
    policyOverrideWasEnabled: true,
    policyOverridePayrollPolicyId: assignment.payrollPolicyId || preview?.payrollPolicy?.id || '',
    policyOverrideAttendancePolicyId:
      assignment.attendancePolicyId || preview?.attendancePolicy?.id || '',
    policyOverrideEffectiveFrom: (assignment.effectiveFrom || fallbackEffectiveFrom).slice(0, 10),
    policyOverrideAssignmentReason: assignment.assignmentReason || '',
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
