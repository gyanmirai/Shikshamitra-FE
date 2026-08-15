import { describe, expect, it } from 'vitest';

import {
  setPermissionAction,
  getPermissionActions,
  setAllPermissionActions,
  formatPermissionAction,
} from './utils';

const salaryTemplatePermission = 'HR.PayrollManagement.Settings.SalaryTemplates';
const salaryTemplateActions = ['View', 'Add', 'Edit', 'Publish', 'SetDefault', 'Archive'];

const salaryTemplatePermissions = salaryTemplateActions.map((action) => ({
  name: `${salaryTemplatePermission}.${action}`,
  isGranted: false,
}));

describe('role permission matrix utilities', () => {
  it('discovers and orders every action exposed by the backend', () => {
    expect(
      getPermissionActions(
        [
          ...salaryTemplatePermissions.slice().reverse(),
          { name: `${salaryTemplatePermission}.Nested.View`, isGranted: true },
        ],
        salaryTemplatePermission
      )
    ).toEqual(salaryTemplateActions);
    expect(formatPermissionAction('SetDefault')).toBe('Set Default');
  });

  it('grants View when a specialized action is granted', () => {
    const updated = setPermissionAction(
      salaryTemplatePermissions,
      salaryTemplatePermission,
      'Publish',
      true
    );

    expect(updated.find((permission) => permission.name.endsWith('.View'))?.isGranted).toBe(true);
    expect(updated.find((permission) => permission.name.endsWith('.Publish'))?.isGranted).toBe(
      true
    );
    expect(updated.find((permission) => permission.name.endsWith('.Edit'))?.isGranted).toBe(false);
  });

  it('revokes every specialized action when View is revoked', () => {
    const grantedPermissions = salaryTemplatePermissions.map((permission) => ({
      ...permission,
      isGranted: true,
    }));

    const updated = setPermissionAction(
      grantedPermissions,
      salaryTemplatePermission,
      'View',
      false
    );

    expect(updated.every((permission) => !permission.isGranted)).toBe(true);
  });

  it('grants and revokes all available actions without changing other permissions', () => {
    const otherPermission = {
      name: 'HR.PayrollManagement.Settings.PfRule.View',
      isGranted: true,
    };
    const permissions = [...salaryTemplatePermissions, otherPermission];

    const granted = setAllPermissionActions(permissions, [salaryTemplatePermission], true);
    expect(
      granted.slice(0, salaryTemplateActions.length).every((permission) => permission.isGranted)
    ).toBe(true);
    expect(granted.at(-1)).toEqual(otherPermission);

    const revoked = setAllPermissionActions(granted, [salaryTemplatePermission], false);
    expect(
      revoked.slice(0, salaryTemplateActions.length).every((permission) => !permission.isGranted)
    ).toBe(true);
    expect(revoked.at(-1)).toEqual(otherPermission);
  });
});
