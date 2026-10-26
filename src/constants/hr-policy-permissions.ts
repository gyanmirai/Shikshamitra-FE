export const hrPolicyActionPermissions = {
  view: 'HR.Policies.View',
  create: 'HR.Policies.Add',
  edit: 'HR.Policies.Edit',
  archive: 'HR.Policies.Archive',
  setDefault: 'HR.Policies.SetDefault',
  assign: 'HR.Policies.Assign',
  clone: 'HR.Policies.Clone',
  previewImpact: 'HR.Policies.PreviewImpact',
  viewAudit: 'HR.Policies.ViewAudit',
} as const;

export const hrLeavePolicyPermissions = {
  root: 'HR.LeaveManagement.Setting.LeavePolicy',
  view: 'HR.LeaveManagement.Setting.LeavePolicy.View',
  create: 'HR.LeaveManagement.Setting.LeavePolicy.Add',
  edit: 'HR.LeaveManagement.Setting.LeavePolicy.Edit',
  archive: 'HR.LeaveManagement.Setting.LeavePolicy.Delete',
  setDefault: 'HR.LeaveManagement.Setting.LeavePolicy.SetDefault',
} as const;
