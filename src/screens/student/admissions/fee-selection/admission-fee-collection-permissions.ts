import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';

export const ADMISSION_FEE_COLLECTION_PERMISSIONS = {
  view: `${financePermissions.fees.collections}.View`,
  collect: `${financePermissions.fees.collections}.Add`,
  receipts: `${financePermissions.fees.invoicesAndReceipts}.View`,
} as const;

export function getAdmissionFeeCollectionAccess(permissions: GrantedPermission[] | undefined) {
  const canView = hasGrantedPermission(permissions, ADMISSION_FEE_COLLECTION_PERMISSIONS.view);
  return {
    canView,
    canCollect:
      canView && hasGrantedPermission(permissions, ADMISSION_FEE_COLLECTION_PERMISSIONS.collect),
    canViewReceipts:
      canView && hasGrantedPermission(permissions, ADMISSION_FEE_COLLECTION_PERMISSIONS.receipts),
  };
}
