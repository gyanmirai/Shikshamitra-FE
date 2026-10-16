import { hostTenantPath } from 'src/constants/host-tenant-menu';
import studentModule, { studentPaths } from 'src/constants/student-menu';
import { type GrantedPermission, hasNavigationPermission } from 'src/utils/permissions';

import type { HostSessionContext } from './types';

export const initialSetupPath = '/initial-setup';
type LandingItem = {
  path: string;
  permissionName?: string | string[];
  visibilityPermissionName?: string;
  children?: LandingItem[];
};

function firstStudentPage(
  items: LandingItem[],
  permissions: GrantedPermission[]
): string | undefined {
  return items.reduce<string | undefined>((landing, item) => {
    if (
      landing ||
      (item.visibilityPermissionName &&
        !hasNavigationPermission(permissions, item.visibilityPermissionName))
    )
      return landing;
    if (item.children?.length) return firstStudentPage(item.children, permissions);
    return hasNavigationPermission(permissions, item.permissionName) ? item.path : undefined;
  }, undefined);
}

export function workspaceLanding(context: HostSessionContext, permissions?: GrantedPermission[]) {
  if (context.accountMode === 'host') return hostTenantPath;
  if (context.setupCompleted !== true) return initialSetupPath;
  if (
    permissions &&
    !hasNavigationPermission(permissions, 'ShikshaMitra.Module.Dashboard') &&
    hasNavigationPermission(permissions, 'ShikshaMitra.Module.Students')
  ) {
    const items = Object.values(studentModule(false)).flatMap((sections) =>
      sections.flatMap((section) => section.items)
    );
    return firstStudentPage(items, permissions) ?? studentPaths.dashboard;
  }
  return '/dashboard';
}
export function isWrongWorkspace(
  context: HostSessionContext,
  pathname: string,
  permissions?: GrantedPermission[]
) {
  const path = pathname.replace(/\/+$/, '');
  if (context.accountMode === 'host') return path !== hostTenantPath;
  if (context.setupCompleted !== true) return path !== initialSetupPath;
  return (
    path.startsWith('/host/') ||
    path === initialSetupPath ||
    (path === '/dashboard' && workspaceLanding(context, permissions) !== '/dashboard')
  );
}
