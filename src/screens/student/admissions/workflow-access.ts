import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

export const ADMISSION_WORKFLOW_PERMISSIONS = {
  view: 'Students.Admissions.Workflows.View',
  manage: 'Students.Admissions.Workflows.Add',
  delete: 'Students.Admissions.Workflows.Delete',
  approve: 'Students.Admissions.Workflows.Approve',
  manageGovernance: 'Students.Admissions.Workflows.ManageGovernance',
  rollback: 'Students.Admissions.Workflows.Rollback',
} as const;

export function getAdmissionWorkflowAccess(permissions: GrantedPermission[] | undefined) {
  return {
    canView: hasGrantedPermission(permissions, ADMISSION_WORKFLOW_PERMISSIONS.view),
    canManage: hasGrantedPermission(permissions, ADMISSION_WORKFLOW_PERMISSIONS.manage),
    canDelete: hasGrantedPermission(permissions, ADMISSION_WORKFLOW_PERMISSIONS.delete),
    canApprove: hasGrantedPermission(permissions, ADMISSION_WORKFLOW_PERMISSIONS.approve),
    canManageGovernance: hasGrantedPermission(
      permissions,
      ADMISSION_WORKFLOW_PERMISSIONS.manageGovernance
    ),
    canRollback: hasGrantedPermission(permissions, ADMISSION_WORKFLOW_PERMISSIONS.rollback),
  };
}
