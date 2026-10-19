import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useFinancePermissions(base: string) {
  const { permissions, permissionsInitialized, loading } = useSelector((state: RootState) => state.auth);
  const isReady = permissionsInitialized && !loading;
  return {
    isReady,
    canView: isReady && hasGrantedPermission(permissions, `${base}.View`),
    canAdd: isReady && hasGrantedPermission(permissions, `${base}.Add`),
    canDelete: isReady && hasGrantedPermission(permissions, `${base}.Delete`),
  };
}
