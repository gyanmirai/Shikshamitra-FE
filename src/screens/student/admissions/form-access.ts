import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

export const ADMISSION_FORM_PERMISSIONS = {
  view: 'Students.Admissions.Forms.View',
  manage: 'Students.Admissions.Forms.Add',
  delete: 'Students.Admissions.Forms.Delete',
} as const;

export function getAdmissionFormAccess(permissions: GrantedPermission[] | undefined) {
  const canManage = hasGrantedPermission(permissions, ADMISSION_FORM_PERMISSIONS.manage);

  return {
    canView: hasGrantedPermission(permissions, ADMISSION_FORM_PERMISSIONS.view),
    canManage,
    canPublish: canManage,
    canDelete: hasGrantedPermission(permissions, ADMISSION_FORM_PERMISSIONS.delete),
  };
}
