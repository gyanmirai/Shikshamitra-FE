import type { RootState } from 'src/redux/store';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';

import { type HrReportPermissions, defaultHrReportPermissions } from '../hr-report-permissions';

export function useHrReportPermissions(): HrReportPermissions {
  const { permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);

  return useMemo<HrReportPermissions>(() => {
    if (!permissionsInitialized) return defaultHrReportPermissions;

    return {
      canView: hasGrantedPermission(permissions, hrPermissions.reportActions.view),
      canBuild: hasGrantedPermission(permissions, hrPermissions.reportActions.build),
      canExport: hasGrantedPermission(permissions, hrPermissions.reportActions.view),
      canSchedule: hasGrantedPermission(permissions, hrPermissions.reportActions.schedule),
      canManageTemplates: hasGrantedPermission(
        permissions,
        hrPermissions.reportActions.manageTemplates
      ),
      canDelete: hasGrantedPermission(permissions, hrPermissions.reportActions.delete),
      canShare: hasGrantedPermission(permissions, hrPermissions.reportActions.share),
    };
  }, [permissions, permissionsInitialized]);
}

export function useHrReportCurrentUserId(): string | null {
  return useSelector((state: RootState) => state.auth.user?.sub ?? null);
}
