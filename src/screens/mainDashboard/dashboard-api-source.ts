import { useGetDashboardSummaryQuery } from 'src/redux/dashboard/dashboardApi';

import { DASHBOARD_ZONE_KEYS } from './dashboard-types';
import { adaptDashboardSummaryPayload } from './dashboard-adapter';

import type { DashboardPresentationRole } from './dashboard-focus-types';
import type { DashboardTemplate, DashboardDataSourceResult } from './dashboard-types';

export type DashboardApiSourceOptions = {
  template: DashboardTemplate; academicYearId?: string; from?: string; to?: string;
  studentId?: string; presentationRole?: DashboardPresentationRole; accessKey?: string; enabled?: boolean;
};

export function emptyDashboardResult(template: DashboardTemplate, failed = false): DashboardDataSourceResult {
  return { source: failed ? 'apiError' : 'api', isLoading: false, loadingZones: [], zoneErrors: {},
    data: { dashboardTemplate: template, dateRange: { label: 'Current period' }, dataState: failed ? 'partial' : 'live',
      kpiCards: [], actionItems: [], riskAlerts: [], moduleSnapshots: [], calendarItems: [], announcements: [] } };
}

export function useDashboardApiSource({ template, enabled = true, ...context }: DashboardApiSourceOptions): DashboardDataSourceResult {
  const query = useGetDashboardSummaryQuery({ dashboardTemplate: template, ...context }, { skip: !enabled,
    refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true });
  if (!enabled) return emptyDashboardResult(template);
  const retry = query.isUninitialized ? undefined : query.refetch;
  const denied = query.error && 'status' in query.error && (query.error.status === 401 || query.error.status === 403);
  if (denied) return { ...emptyDashboardResult(template, true), retry,
    globalError: 'Dashboard access could not be confirmed. Retry after your access has been reviewed.' };
  if (query.currentData) {
    const adapted = adaptDashboardSummaryPayload(query.currentData, template);
    return { ...adapted, source: 'api', isLoading: false, loadingZones: [], retry,
      isRefreshing: query.isFetching,
      ...(query.isError ? { data: { ...adapted.data, dataState: 'partial' as const },
        globalError: 'Refresh failed. Showing the last loaded data for this context; retry for current information.' } : {}) };
  }
  if (query.isError) return { ...emptyDashboardResult(template, true), retry,
    globalError: 'Dashboard data could not be loaded. Retry to see current school information.' };
  return { ...emptyDashboardResult(template), retry, isLoading: query.isLoading || query.isFetching,
    loadingZones: query.isLoading || query.isFetching ? Object.values(DASHBOARD_ZONE_KEYS) : [] };
}
