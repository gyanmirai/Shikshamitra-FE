import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicNotificationPermissions } from 'src/constants/academic-menu';
import { useGetUserScopeHierarchyQuery } from 'src/redux/userScope/userScopeApi';

import { notificationScopeOptions } from './notification-scope-options';

export function useNotificationWorkspaceScope() {
  const { currentYear, currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);
  const { user, sessionContext, permissions, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  const identity = { userCacheKey: user?.sub ?? '', tenantCacheKey: sessionContext?.tenantId ?? '' };
  const canView = permissionsInitialized && Boolean(identity.userCacheKey && identity.tenantCacheKey) &&
    hasGrantedPermission(permissions, academicNotificationPermissions.view);
  const canManage = canView && hasGrantedPermission(permissions, academicNotificationPermissions.manage);
  const hierarchy = useGetUserScopeHierarchyQuery({
    userId: identity.userCacheKey, cacheTenantId: identity.tenantCacheKey,
    academicYearId: currentYear?.id,
  }, { skip: !canView, refetchOnMountOrArgChange: true });
  const data = hierarchy.currentData;
  const options = data && data.userId === identity.userCacheKey
    ? notificationScopeOptions(data, currentYear, currentBoard, currentMedium)
    : [];

  return {
    identity, canView, canManage, permissionsInitialized, options,
    contextLabel: [currentYear?.name, currentBoard?.name, currentMedium?.name].filter(Boolean).join(' / '),
    isLoading: !hierarchy.currentData && hierarchy.isFetching,
    error: hierarchy.error,
    retry: hierarchy.refetch,
  };
}
