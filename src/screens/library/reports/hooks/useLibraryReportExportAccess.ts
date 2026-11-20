import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { libraryPermissions } from 'src/constants/library-menus';

export function useLibraryReportExportAccess() {
  return useSelector((state: RootState) => {
    const permissions = state.auth?.permissions;
    return (
      hasGrantedPermission(permissions, libraryPermissions.reports) &&
      hasGrantedPermission(permissions, libraryPermissions.reportsExport)
    );
  });
}
