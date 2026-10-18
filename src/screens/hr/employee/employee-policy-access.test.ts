import { it, expect, describe } from 'vitest';

import {
  STAFF_POLICY_REQUIREMENTS,
  getDeniedStaffPolicyReads,
  getStaffPolicySubmitDenial,
  getMissingStaffPolicyPermissions,
  STAFF_POLICY_REQUIREMENTS_BY_ACTION,
} from './employee-policy-access';

describe('staff policy access prerequisites', () => {
  it('does not infer policy access from staff actions or policy navigation', () => {
    const permissions = [
      'HR.Employee.EmployeeList.Add',
      'HR.Employee.EmployeeList.Edit',
      'HR.Policies',
      'HR.LeaveManagement.Setting.LeavePolicy.View',
    ].map((name) => ({ name, isGranted: true }));

    expect(getMissingStaffPolicyPermissions(permissions)).toEqual([
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewPolicies,
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.assignPolicies,
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.previewPolicyImpact,
    ]);
  });

  it('accepts the exact policy permissions defined by the backend catalogue', () => {
    const permissions = [
      'HR.Policies.View',
      'HR.LeaveManagement.Setting.LeavePolicy.View',
      'HR.Policies.Assign',
      'HR.Policies.PreviewImpact',
    ].map((name) => ({ name, isGranted: true }));

    expect(getMissingStaffPolicyPermissions(permissions)).toEqual([]);
  });

  it.each([
    undefined,
    { name: 'HR.LeaveManagement.Setting.LeavePolicy.View', isGranted: false },
    { name: 'HR.AttendanceAndLeave.Setting.LeavePolicy.View', isGranted: true },
    { name: 'HR.LeaveManagement.Setting.LeavePolicy', isGranted: true },
  ])('requires the exact granted leave-policy action: %j', (leavePermission) => {
    const permissions = [
      'HR.Policies.View',
      'HR.Policies.Assign',
      'HR.Policies.PreviewImpact',
    ].map((name) => ({ name, isGranted: true }));
    if (leavePermission) permissions.push(leavePermission);

    expect(getMissingStaffPolicyPermissions(permissions)).toEqual([
      { name: 'HR.LeaveManagement.Setting.LeavePolicy.View', label: 'View leave policies' },
    ]);
  });

  it('allows the workflow only after every exact prerequisite is granted', () => {
    const permissions = STAFF_POLICY_REQUIREMENTS.map(({ name }) => ({ name, isGranted: true }));

    expect(getMissingStaffPolicyPermissions(permissions)).toEqual([]);
    permissions.find(({ name }) => name === 'HR.Policies.Assign')!.isGranted = false;
    expect(getMissingStaffPolicyPermissions(permissions)).toEqual([
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.assignPolicies,
    ]);
    expect(getMissingStaffPolicyPermissions(undefined)).toEqual(STAFF_POLICY_REQUIREMENTS);
  });

  it('names denied policy reads once without requiring unrelated write access', () => {
    expect(getDeniedStaffPolicyReads({
      payrollError: { status: 403 },
      attendanceError: { status: 403 },
      leaveError: { status: 403 },
    })).toEqual([
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewPolicies,
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewLeavePolicies,
    ]);
    expect(getDeniedStaffPolicyReads({ leaveError: { status: 403 } })).toEqual([
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewLeavePolicies,
    ]);
  });

  it.each(['payrollError', 'attendanceError', 'leaveError'] as const)(
    'maps %s to its named prerequisite independently of the display list',
    (errorKey) => {
      expect(getDeniedStaffPolicyReads({ [errorKey]: { status: 403 } })).toEqual([
        errorKey === 'leaveError'
          ? { name: 'HR.LeaveManagement.Setting.LeavePolicy.View', label: 'View leave policies' }
          : { name: 'HR.Policies.View', label: 'View payroll and attendance policies' },
      ]);
    }
  );

  it.each([undefined, null, { status: 401 }, { status: 500 }, { status: 'FETCH_ERROR' }])(
    'does not classify an unrelated read failure as a missing grant: %j',
    (error) => {
      expect(getDeniedStaffPolicyReads({
        payrollError: error, attendanceError: error, leaveError: error,
      })).toEqual([]);
    }
  );

  it('uses only whitelisted exact prerequisites from the structured submit failure', () => {
    expect(getStaffPolicySubmitDenial({
      status: 403,
      data: {
        errorCode: 'HR:Employee:010043',
        data: { missingPermissions: [
          'HR.Policies.Assign',
          'HR.Policies.Assign',
          'AbpIdentity.Users.Update',
          'HR.Policies.PreviewImpact',
          'hr.policies.view',
          { name: 'HR.Policies.View' },
        ] },
      },
    })).toEqual([
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.assignPolicies,
      STAFF_POLICY_REQUIREMENTS_BY_ACTION.previewPolicyImpact,
    ]);
  });

  it('supports the ABP exception envelope before problem-details normalization', () => {
    expect(getStaffPolicySubmitDenial({
      data: { error: {
        code: 'HR:Employee:010043',
        data: { MissingPermissions: ['HR.Policies.View'] },
      } },
    })).toEqual([STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewPolicies]);
  });

  it.each([undefined, null, {}, { missingPermissions: 'HR.Policies.Assign' }, { missingPermissions: [42] }])(
    'retains a known denial without inventing missing permissions from malformed metadata: %j',
    (data) => {
      expect(getStaffPolicySubmitDenial({ data: { errorCode: 'HR:Employee:010043', data } })).toEqual([]);
    }
  );

  it.each([undefined, null, { status: 403 }, { data: { errorCode: 'HR:Employee:010042' } }])(
    'leaves unrelated submit failures to the normal error handler: %j',
    (error) => {
      expect(getStaffPolicySubmitDenial(error)).toBeNull();
    }
  );
});
