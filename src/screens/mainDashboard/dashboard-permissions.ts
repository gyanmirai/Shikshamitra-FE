import { hasGrantedPermission, type GrantedPermission } from 'src/utils/permissions';

import { DASHBOARD_ZONE_KEYS } from './dashboard-types';
import { getDashboardWidgetRegistryEntry } from './dashboard-widget-registry';
import { isVerifiedDashboardPersonalContext } from './dashboard-focus-access';

import type {
  DashboardWidget,
  DashboardZoneKey,
  DashboardActionItem,
  DashboardDataContract,
  DashboardModuleSnapshot,
} from './dashboard-types';

type FilterOptions = {
  enforcePermissions: boolean;
};

export const canShowDashboardWidget = (
  widget: DashboardWidget,
  permissions: GrantedPermission[] | undefined,
  options: FilterOptions,
  zone?: DashboardZoneKey
) => {
  if (!options.enforcePermissions) {
    return true;
  }

  const registryEntry = getDashboardWidgetRegistryEntry(widget.id, zone);
  if (!registryEntry) {
    return false;
  }

  const required = widget.requiredPermissions ?? registryEntry.requiredPermissions;
  const names = Array.isArray(required) ? required : [required];
  return names.length > 0 && names.every((name) => hasGrantedPermission(permissions, name));
};

const filterWidgets = <T extends DashboardWidget>(
  widgets: T[],
  permissions: GrantedPermission[] | undefined,
  options: FilterOptions,
  zone: DashboardZoneKey
) => widgets.filter((widget) => canShowDashboardWidget(widget, permissions, options, zone));

export const filterDashboardDataByPermissions = (
  data: DashboardDataContract,
  permissions: GrantedPermission[] | undefined,
  options: FilterOptions
): DashboardDataContract => {
  if (isVerifiedDashboardPersonalContext(data)) {
    const keep = (widgets: DashboardWidget[], zone: DashboardZoneKey) => widgets.filter((widget) =>
      personalWidgetIds.has(widget.id) && getDashboardWidgetRegistryEntry(widget.id, zone))
      .map((widget) => ({ ...widget, drilldownUrl: undefined }));
    return { ...data, kpiCards: keep(data.kpiCards, 'kpis'), actionItems: keep(data.actionItems, 'actions'),
      riskAlerts: [], moduleSnapshots: keep(data.moduleSnapshots, 'modules'),
      calendarItems: keep(data.calendarItems, 'calendar'), announcements: [] };
  }
  return {
  ...data,
  kpiCards: filterWidgets(data.kpiCards, permissions, options, DASHBOARD_ZONE_KEYS.kpis),
  actionItems: filterWidgets<DashboardActionItem>(
    data.actionItems,
    permissions,
    options,
    DASHBOARD_ZONE_KEYS.actions
  ),
  riskAlerts: filterWidgets<DashboardActionItem>(
    data.riskAlerts,
    permissions,
    options,
    DASHBOARD_ZONE_KEYS.risks
  ),
  calendarItems: filterWidgets<DashboardActionItem>(
    data.calendarItems,
    permissions,
    options,
    DASHBOARD_ZONE_KEYS.calendar
  ),
  moduleSnapshots: filterWidgets<DashboardModuleSnapshot>(
    data.moduleSnapshots,
    permissions,
    options,
    DASHBOARD_ZONE_KEYS.modules
  ),
  announcements: filterWidgets<DashboardActionItem>(
    data.announcements,
    permissions,
    options,
    DASHBOARD_ZONE_KEYS.announcements
  ),
  };
};

const personalWidgetIds = new Set(['student-attendance', 'student-assignments', 'student-upcoming-exams',
  'student-latest-result', 'student-fee-status', 'student-academic-summary', 'student-learning-tasks', 'student-upcoming-exam']);
