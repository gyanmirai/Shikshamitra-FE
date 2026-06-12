import { it, expect, describe } from 'vitest';

import {
  buildEmployeePolicyOverride,
  resolveEmployeePolicyPreviewDate,
  buildEmployeePolicyOverrideAction,
  clearEmployeePolicyOverrideValues,
  hydrateEmployeePolicyOverrideFromPreview,
  buildEmployeePolicyOverridePreviewRequest,
  getEmployeePolicyOverrideAssignmentIdFromPreview,
} from './employee-policy-override-utils';

describe('employee policy override helpers', () => {
  const values = {
    policyOverrideEnabled: true,
    policyOverrideAssignmentId: 'assignment-1',
    policyOverridePayrollPolicyId: 'payroll-policy-1',
    policyOverrideAttendancePolicyId: 'attendance-policy-1',
    policyOverrideLeavePolicyId: 'leave-policy-1',
    policyOverrideEffectiveFrom: '2026-06-01',
    policyOverrideAssignmentReason: 'Use direct payroll rules',
  };

  it('builds a create impact preview payload for a new employee override', () => {
    expect(
      buildEmployeePolicyOverridePreviewRequest(
        { ...values, policyOverrideAssignmentId: '' },
        'year-1',
        'employee-1'
      )
    ).toEqual({
      action: 'create',
      assignment: {
        academicYearId: 'year-1',
        targetType: 'employee',
        targetKey: 'employee-1',
        targetDisplayName: 'employee-1',
        payrollPolicyId: 'payroll-policy-1',
        attendancePolicyId: 'attendance-policy-1',
        leavePolicyId: 'leave-policy-1',
        effectiveFrom: '2026-06-01',
        effectiveTo: null,
        priority: 100,
        assignmentReason: 'Use direct payroll rules',
        isActive: true,
      },
    });
  });

  it('builds a repair impact preview payload for an existing employee override', () => {
    expect(buildEmployeePolicyOverridePreviewRequest(values, 'year-1', 'employee-1')).toEqual({
      action: 'employee-override-upsert',
      assignmentId: 'assignment-1',
      assignment: {
        academicYearId: 'year-1',
        targetType: 'employee',
        targetKey: 'employee-1',
        targetDisplayName: 'employee-1',
        payrollPolicyId: 'payroll-policy-1',
        attendancePolicyId: 'attendance-policy-1',
        leavePolicyId: 'leave-policy-1',
        effectiveFrom: '2026-06-01',
        effectiveTo: null,
        priority: 100,
        assignmentReason: 'Use direct payroll rules',
        isActive: true,
      },
    });
  });

  it('builds a repair impact preview when an existing override temporarily has no assignment id', () => {
    expect(
      buildEmployeePolicyOverridePreviewRequest(
        {
          ...values,
          policyOverrideWasEnabled: true,
          policyOverrideAssignmentId: '',
        },
        'year-1',
        'employee-1'
      )
    ).toEqual({
      action: 'employee-override-upsert',
      assignment: {
        academicYearId: 'year-1',
        targetType: 'employee',
        targetKey: 'employee-1',
        targetDisplayName: 'employee-1',
        payrollPolicyId: 'payroll-policy-1',
        attendancePolicyId: 'attendance-policy-1',
        leavePolicyId: 'leave-policy-1',
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
      assignmentId: 'assignment-1',
      payrollPolicyId: 'payroll-policy-1',
      attendancePolicyId: 'attendance-policy-1',
      leavePolicyId: 'leave-policy-1',
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

  it('builds a disable impact preview when an existing override is disabled', () => {
    expect(
      buildEmployeePolicyOverridePreviewRequest(
        { ...values, policyOverrideEnabled: false, policyOverrideWasEnabled: true },
        'year-1',
        'employee-1'
      )
    ).toEqual({
      action: 'employee-override-disable',
      assignmentId: 'assignment-1',
      assignment: {
        academicYearId: 'year-1',
        targetType: 'employee',
        targetKey: 'employee-1',
        targetDisplayName: 'employee-1',
        payrollPolicyId: 'payroll-policy-1',
        attendancePolicyId: 'attendance-policy-1',
        leavePolicyId: 'leave-policy-1',
        effectiveFrom: '2026-06-01',
        effectiveTo: null,
        priority: 100,
        assignmentReason: 'Use direct payroll rules',
        isActive: false,
      },
    });
  });

  it('builds a disable impact preview without assignment id when disable can be resolved by employee and date', () => {
    expect(
      buildEmployeePolicyOverridePreviewRequest(
        {
          ...values,
          policyOverrideEnabled: false,
          policyOverrideWasEnabled: true,
          policyOverrideAssignmentId: '',
        },
        'year-1',
        'employee-1'
      )
    ).toEqual({
      action: 'employee-override-disable',
      assignment: {
        academicYearId: 'year-1',
        targetType: 'employee',
        targetKey: 'employee-1',
        targetDisplayName: 'employee-1',
        payrollPolicyId: 'payroll-policy-1',
        attendancePolicyId: 'attendance-policy-1',
        leavePolicyId: 'leave-policy-1',
        effectiveFrom: '2026-06-01',
        effectiveTo: null,
        priority: 100,
        assignmentReason: 'Use direct payroll rules',
        isActive: false,
      },
    });
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
      policyOverrideAssignmentId: 'assignment-1',
      policyOverridePayrollPolicyId: 'payroll-policy-1',
      policyOverrideAttendancePolicyId: 'attendance-policy-1',
      policyOverrideLeavePolicyId: 'leave-policy-1',
      policyOverrideEffectiveFrom: '2026-06-01',
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
          matchedAssignmentId: 'assignment-from-preview',
          assignment: {
            payrollPolicyId: 'payroll-policy-1',
            attendancePolicyId: 'attendance-policy-1',
            leavePolicyId: 'leave-policy-1',
            effectiveFrom: '2026-06-04T00:00:00',
            assignmentReason: 'Direct override',
          },
        },
        '2026-06-01'
      )
    ).toEqual({
      policyOverrideEnabled: true,
      policyOverrideWasEnabled: true,
      policyOverrideAssignmentId: 'assignment-from-preview',
      policyOverridePayrollPolicyId: 'payroll-policy-1',
      policyOverrideAttendancePolicyId: 'attendance-policy-1',
      policyOverrideLeavePolicyId: 'leave-policy-1',
      policyOverrideEffectiveFrom: '2026-06-04',
      policyOverrideAssignmentReason: 'Direct override',
    });
  });

  it('resolves the employee override assignment id from preview assignment or matched id', () => {
    expect(
      getEmployeePolicyOverrideAssignmentIdFromPreview({
        policySource: 'employee',
        matchedAssignmentId: 'matched-assignment',
        assignment: { id: 'assignment-id' },
      })
    ).toBe('assignment-id');
    expect(
      getEmployeePolicyOverrideAssignmentIdFromPreview({
        matchedTargetType: 'employee',
        matchedAssignmentId: 'matched-assignment',
      })
    ).toBe('matched-assignment');
    expect(
      getEmployeePolicyOverrideAssignmentIdFromPreview({
        policySource: 'default',
        matchedAssignmentId: 'default-assignment',
      })
    ).toBe('');
  });

  it('hydrates disabled override fields from a non-employee effective assignment', () => {
    expect(
      hydrateEmployeePolicyOverrideFromPreview({ policySource: 'default' }, '2026-06-01')
    ).toEqual({
      policyOverrideEnabled: false,
      policyOverrideWasEnabled: false,
      policyOverrideAssignmentId: '',
      policyOverridePayrollPolicyId: '',
      policyOverrideAttendancePolicyId: '',
      policyOverrideLeavePolicyId: '',
      policyOverrideEffectiveFrom: '2026-06-01',
      policyOverrideAssignmentReason: '',
    });
  });
});
