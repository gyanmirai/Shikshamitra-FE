import type { DashboardWidget, DashboardWidgetKind } from './dashboard-types';

export { toSafeDashboardHref as safeDashboardHref } from './dashboard-navigation';

export const dashboardKindIcons: Record<DashboardWidgetKind, string> = {
  metric: 'mdi:chart-box-outline',
  action: 'mdi:clipboard-check-outline',
  risk: 'mdi:alert-outline',
  health: 'mdi:chart-line',
  timeline: 'mdi:calendar-outline',
  announcement: 'mdi:bullhorn-outline',
};

export function dashboardDisplayValue(widget: DashboardWidget) {
  const value = widget.value ?? widget.count;
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'number'
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)
    : value;
}
