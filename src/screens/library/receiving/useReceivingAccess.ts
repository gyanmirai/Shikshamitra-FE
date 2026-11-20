import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useReceivingAccess() {
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const ready = !loading && permissionsInitialized;
  const canRead = Boolean(
    ready &&
    hasGrantedPermission(permissions, 'Library.Receiving.View') &&
    hasGrantedPermission(permissions, 'Library.AllBooks.View')
  );
  return {
    ready,
    canRead,
    canReceive: canRead && hasGrantedPermission(permissions, 'Library.Receiving.Add'),
  };
}
