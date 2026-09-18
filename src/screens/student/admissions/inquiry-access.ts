import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

export const ADMISSION_INQUIRY_PERMISSIONS = {
  view: 'Students.Admissions.Inquiries.View',
  manage: 'Students.Admissions.Inquiries.Add',
  assign: 'Students.Admissions.Inquiries.Add',
  delete: 'Students.Admissions.Inquiries.Delete',
} as const;

export function getAdmissionInquiryAccess(permissions: GrantedPermission[] | undefined) {
  return {
    canView: hasGrantedPermission(permissions, ADMISSION_INQUIRY_PERMISSIONS.view),
    canManage: hasGrantedPermission(permissions, ADMISSION_INQUIRY_PERMISSIONS.manage),
    canAssign: hasGrantedPermission(permissions, ADMISSION_INQUIRY_PERMISSIONS.assign),
    canDelete: hasGrantedPermission(permissions, ADMISSION_INQUIRY_PERMISSIONS.delete),
  };
}
