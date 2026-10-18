import { it, expect, describe } from 'vitest';

import { hrLeavePolicyPermissions, hrPolicyActionPermissions } from './hr-policy-permissions';

// Independent expectations from ShikshaMitraSubmodulePermissions.HR.Policies and
// HR.LeaveManagement_SettingLeavePolicy, registered by HRPermissionDefinitionProvider.
describe('HR policy permission catalogue contract', () => {
  it('retains the exact backend policy action names and the existing Add mapping', () => {
    expect(hrPolicyActionPermissions).toEqual({
      view: 'HR.Policies.View',
      create: 'HR.Policies.Add',
      edit: 'HR.Policies.Edit',
      archive: 'HR.Policies.Archive',
      setDefault: 'HR.Policies.SetDefault',
      assign: 'HR.Policies.Assign',
      clone: 'HR.Policies.Clone',
      previewImpact: 'HR.Policies.PreviewImpact',
      viewAudit: 'HR.Policies.ViewAudit',
    });
  });

  it('keeps the backend leave-policy action separate from its navigation parent', () => {
    expect(hrLeavePolicyPermissions).toEqual({
      root: 'HR.LeaveManagement.Setting.LeavePolicy',
      view: 'HR.LeaveManagement.Setting.LeavePolicy.View',
    });
  });
});
