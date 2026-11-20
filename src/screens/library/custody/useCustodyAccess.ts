import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useCustodyAccess() {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const canRead =
    !loading &&
    permissionsInitialized &&
    hasGrantedPermission(permissions, 'Library.Custody.View') &&
    hasGrantedPermission(permissions, 'Library.AllBooks.View');
  return {
    canRead,
    canHandoff: canRead && hasGrantedPermission(permissions, 'Library.Custody.Add'),
    canReturn: canRead && hasGrantedPermission(permissions, 'Library.Custody.Return'),
  };
}
