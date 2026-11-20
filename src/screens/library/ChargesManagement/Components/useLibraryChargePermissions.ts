import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { libraryChargePermissions } from 'src/constants/library-menus';

export function useLibraryChargePermissions() {
  const { permissions, permissionsInitialized, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const ready = permissionsInitialized && !loading;
  const view = ready && hasGrantedPermission(permissions, libraryChargePermissions.view);
  const action = (name: string) => view && hasGrantedPermission(permissions, name);
  return {
    ready,
    view,
    add: action(libraryChargePermissions.add),
    update: action(libraryChargePermissions.update),
    delete: action(libraryChargePermissions.delete),
  };
}
