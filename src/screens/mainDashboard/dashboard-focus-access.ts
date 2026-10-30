import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

import { toSafeDashboardHref } from './dashboard-navigation';
import { getDashboardWidgetRegistryEntry } from './dashboard-widget-registry';

import type { DashboardDataContract } from './dashboard-types';

export function isVerifiedDashboardPersonalContext(data: DashboardDataContract): boolean {
  return data.dashboardTemplate === 'studentParent' &&
    (data.presentationRole === 'student' || data.presentationRole === 'parent') &&
    data.focus?.accessMode === 'personal' && Boolean(data.selectedStudentId &&
      data.students?.some((student) => student.id === data.selectedStudentId));
}

export function selectDashboardFocus(data: DashboardDataContract, permissions: GrantedPermission[] | undefined, enforcePermissions: boolean) {
  const { focus } = data;
  if (!focus) return undefined;
  if (focus.accessMode === 'personal') {
    return isVerifiedDashboardPersonalContext(data) ? { ...focus,
      items: focus.items.map((item) => ({ ...item, drilldownUrl: undefined })) } : undefined;
  }
  if (enforcePermissions && (!getDashboardWidgetRegistryEntry(focus.widgetId) ||
    !focus.requiredPermissions.length || !focus.requiredPermissions.every((permission) => hasGrantedPermission(permissions, permission)))) return undefined;
  return { ...focus, items: focus.items.filter((item) => !enforcePermissions || !item.widgetId ||
    hasGrantedPermission(permissions, getDashboardWidgetRegistryEntry(item.widgetId)?.requiredPermissions))
    .map((item) => ({ ...item, drilldownUrl: toSafeDashboardHref(item.drilldownUrl) })) };
}
