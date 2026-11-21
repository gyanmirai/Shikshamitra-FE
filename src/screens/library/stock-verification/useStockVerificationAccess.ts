import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { libraryPermissions } from 'src/constants/library-menus';

export function useStockVerificationAccess() {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const canRead = Boolean(
    !loading &&
    permissionsInitialized &&
    hasGrantedPermission(permissions, libraryPermissions.stockVerification) &&
    hasGrantedPermission(permissions, libraryPermissions.allBooks)
  );
  return {
    canRead,
    canOpen: canRead && hasGrantedPermission(permissions, libraryPermissions.stockVerificationAdd),
    canRecord:
      canRead && hasGrantedPermission(permissions, libraryPermissions.stockVerificationUpdate),
    canApprove:
      canRead && hasGrantedPermission(permissions, libraryPermissions.stockVerificationApprove),
  };
}
