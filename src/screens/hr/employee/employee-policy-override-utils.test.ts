import { it, expect, describe } from 'vitest';

import {
  buildEmployeePolicyOverride,
  resolveEmployeePolicyPreviewDate,
  buildEmployeePolicyOverrideAction,
  clearEmployeePolicyOverrideValues,
  hydrateEmployeePolicyOverrideFromPreview,
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

  it('selects upsert or disable action from toggle state', () => {
    expect(buildEmployeePolicyOverrideAction(values, 'year-1')).toBe('upsert');
    expect(
      buildEmployeePolicyOverrideAction(
        { ...values, policyOverrideEnabled: false, policyOverrideWasEnabled: true },
        'year-1'
      )
    ).toBe('disable');
    expect(
      buildEmployeePolicyOverrideAction(
        { ...values, policyOverrideEnabled: false, policyOverrideWasEnabled: false },
        'year-1'
      )
    ).toBeUndefined();
  });

  it('omits override when disabled or incomplete', () => {
    expect(buildEmployeePolicyOverride({ ...values, policyOverrideEnabled: false }, 'year-1')).toBe(
      undefined
    );
    expect(buildEmployeePolicyOverridePreviewRequest(values, 'year-1', '')).toBeUndefined();
  });

  it('clears visible override fields while preserving disable intent', () => {
    const cleared = clearEmployeePolicyOverrideValues({
      ...values,
      policyOverrideWasEnabled: true,
    });

    expect(cleared).toEqual({
      policyOverrideEnabled: false,
      policyOverrideWasEnabled: true,
      policyOverridePayrollPolicyId: '',
      policyOverrideAttendancePolicyId: '',
      policyOverrideEffectiveFrom: '',
      policyOverrideAssignmentReason: '',
    });
    expect(buildEmployeePolicyOverrideAction(cleared, 'year-1')).toBe('disable');
  });

  it('uses override effective date for payroll policy preview', () => {
    expect(
      resolveEmployeePolicyPreviewDate(
        {
          policyOverrideEffectiveFrom: '2026-06-04',
        },
        '2026-06-01'
      )
    ).toBe('2026-06-04');
    expect(resolveEmployeePolicyPreviewDate({}, '2026-06-01')).toBe('2026-06-01');
  });

  it('hydrates override fields from an effective employee assignment', () => {
    expect(
      hydrateEmployeePolicyOverrideFromPreview(
        {
          policySource: 'employee',
          assignment: {
            payrollPolicyId: 'payroll-policy-1',
            attendancePolicyId: 'attendance-policy-1',
            effectiveFrom: '2026-06-04T00:00:00',
            assignmentReason: 'Direct override',
          },
        },
        '2026-06-01'
      )
    ).toEqual({
      policyOverrideEnabled: true,
      policyOverrideWasEnabled: true,
      policyOverridePayrollPolicyId: 'payroll-policy-1',
      policyOverrideAttendancePolicyId: 'attendance-policy-1',
      policyOverrideEffectiveFrom: '2026-06-04',
      policyOverrideAssignmentReason: 'Direct override',
    });
  });

  it('hydrates disabled override fields from a non-employee effective assignment', () => {
    expect(
      hydrateEmployeePolicyOverrideFromPreview({ policySource: 'default' }, '2026-06-01')
    ).toEqual({
      policyOverrideEnabled: false,
      policyOverrideWasEnabled: false,
      policyOverridePayrollPolicyId: '',
      policyOverrideAttendancePolicyId: '',
      policyOverrideEffectiveFrom: '2026-06-01',
      policyOverrideAssignmentReason: '',
    });
  });
});
