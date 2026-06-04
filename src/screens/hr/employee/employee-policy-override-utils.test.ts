import { it, expect, describe } from 'vitest';

import {
  buildEmployeePolicyOverride,
  buildEmployeePolicyOverridePreviewRequest,
} from './employee-policy-override-utils';

describe('employee policy override helpers', () => {
  const values = {
    policyOverrideEnabled: true,
    policyOverridePayrollPolicyId: 'payroll-policy-1',
    policyOverrideAttendancePolicyId: 'attendance-policy-1',
    policyOverrideEffectiveFrom: '2026-06-01',
    policyOverrideAssignmentReason: 'Use direct payroll rules',
  };

  it('builds the employee impact preview payload', () => {
    expect(buildEmployeePolicyOverridePreviewRequest(values, 'year-1', 'employee-1')).toEqual({
      action: 'update',
      assignment: {
        academicYearId: 'year-1',
        targetType: 'employee',
        targetKey: 'employee-1',
        targetDisplayName: 'employee-1',
        payrollPolicyId: 'payroll-policy-1',
        attendancePolicyId: 'attendance-policy-1',
        effectiveFrom: '2026-06-01',
        effectiveTo: null,
        priority: 100,
        assignmentReason: 'Use direct payroll rules',
        isActive: true,
      },
    });
  });

  it('includes confirmation token in the payroll update override body', () => {
    expect(buildEmployeePolicyOverride(values, 'year-1', 'token-1')).toEqual({
      academicYearId: 'year-1',
      payrollPolicyId: 'payroll-policy-1',
      attendancePolicyId: 'attendance-policy-1',
      effectiveFrom: '2026-06-01',
      assignmentReason: 'Use direct payroll rules',
      confirmationToken: 'token-1',
    });
  });

  it('omits override when disabled or incomplete', () => {
    expect(buildEmployeePolicyOverride({ ...values, policyOverrideEnabled: false }, 'year-1')).toBe(
      undefined
    );
    expect(buildEmployeePolicyOverridePreviewRequest(values, 'year-1', '')).toBeUndefined();
  });
});
