import { it, vi, expect, describe, afterEach } from 'vitest';

import { hasGrantedPermission, hasNavigationPermission } from './permissions';

describe('exact permission checks', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(['development', 'production', 'test'])('fails closed in %s', (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    expect(hasGrantedPermission(undefined, 'Students.Admissions.Offerings.Create')).toBe(false);
    expect(hasGrantedPermission([], 'Students.Enrollment.AdmissionsCrm.ViewActivation')).toBe(false);
    expect(hasGrantedPermission([], 'HR.Employee.EmployeeList.Edit')).toBe(false);
  });

  it('does not infer actions, navigation, legacy aliases, or a differently cased grant', () => {
    const grants = [
      { name: 'Students.Admissions.Applications.Add', isGranted: true },
      { name: 'Finance.Adjustment.View', isGranted: true },
      { name: 'HR.Payroll.Activate.View', isGranted: true },
      { name: 'ShikshaMitra.Module.HR', isGranted: true },
    ];
    ['Students.Admissions.Applications.Submit', 'Finance.Fees.Adjustment.Edit',
      'Finance.Fees.Adjustment.View', 'HR.Payroll.Activate', 'hr.payroll.activate.view'].forEach((name) => {
      expect(hasGrantedPermission(grants, name)).toBe(false);
    });
    expect(hasGrantedPermission(grants, 'Students.Admissions.Applications.Add')).toBe(true);
  });

  it('supports future exact actions and explicit alternative reads without granting siblings', () => {
    const grants = [{ name: 'Future.Nested.ApproveOverride', isGranted: true }];
    expect(hasGrantedPermission(grants, 'Future.Nested.ApproveOverride')).toBe(true);
    expect(hasGrantedPermission(grants, ['Future.View', 'Future.Nested.ApproveOverride'])).toBe(true);
    expect(hasGrantedPermission(grants, 'Future.Nested.Add')).toBe(false);
    expect(hasGrantedPermission([{ name: 'Future.Nested.ApproveOverride', isGranted: false }], 'Future.Nested.ApproveOverride')).toBe(false);
  });

  it('keeps legacy route parent resolution separate from exact action checks', () => {
    const grants = [{ name: 'Students.Records.StudentList.View', isGranted: true }];
    expect(hasNavigationPermission(grants, 'Students.Records.StudentList')).toBe(true);
    expect(hasGrantedPermission(grants, 'Students.Records.StudentList')).toBe(false);
    expect(hasNavigationPermission([], 'Students.Records.StudentList')).toBe(false);
  });
});
