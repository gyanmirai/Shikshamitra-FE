import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { libraryPermissions } from 'src/constants/library-menus';

export function useLibrarySettings() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  return {
    academicYearId: (currentYear as { id?: string })?.id || '',
    canEdit: hasGrantedPermission(permissions, 'Library.Settings.BorrowingRules.Add'),
    canView:
      !loading &&
      permissionsInitialized &&
      hasGrantedPermission(permissions, libraryPermissions.settings.borrowingRules),
  };
}
