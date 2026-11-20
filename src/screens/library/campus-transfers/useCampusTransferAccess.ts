import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useCampusTransferAccess() {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const canRead =
    !loading &&
    permissionsInitialized &&
    hasGrantedPermission(permissions, 'Library.CampusTransfers.View') &&
    hasGrantedPermission(permissions, 'Library.AllBooks.View');
  return {
    canRead,
    canDispatch: canRead && hasGrantedPermission(permissions, 'Library.CampusTransfers.Dispatch'),
    canReceive: canRead && hasGrantedPermission(permissions, 'Library.CampusTransfers.Receive'),
  };
}
