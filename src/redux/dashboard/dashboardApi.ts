import type {
  DashboardWidget,
  DashboardTemplate,
  DashboardDateRange,
  DashboardActionItem,
  DashboardModuleSnapshot,
} from 'src/screens/mainDashboard/dashboard-types';

import { api } from 'src/redux/service';
import { dashboardType } from 'src/redux/tagTypes';

export type DashboardSummaryQuery = {
  dashboardTemplate: DashboardTemplate;
  academicYearId?: string;
  from?: string;
  to?: string;
};

export type DashboardSummaryResponse = {
  dashboardTemplate?: string;
  academicYearId?: string;
  dateRange?: Partial<DashboardDateRange>;
  kpiCards?: DashboardWidget[];
  actionItems?: DashboardActionItem[];
  riskAlerts?: DashboardActionItem[];
  calendarItems?: DashboardActionItem[];
  moduleSnapshots?: DashboardModuleSnapshot[];
  announcements?: DashboardActionItem[];
  zoneErrors?: Record<string, string>;
};

export type DashboardWidgetMetadataResponse = {
  id?: string;
  zone?: string;
  drilldownUrl?: string;
  requiredPermissions?: string[];
  owner?: string;
};

export const buildDashboardSummaryQueryParams = ({
  dashboardTemplate,
  academicYearId,
  from,
  to,
}: DashboardSummaryQuery): Record<string, string> => {
  const params: Record<string, string> = {
    dashboardTemplate,
  };

  if (academicYearId?.trim()) {
    params.academicYearId = academicYearId.trim();
  }

  if (from?.trim()) {
    params.from = from.trim();
  }

  if (to?.trim()) {
    params.to = to.trim();
  }

  return params;
};

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryResponse, DashboardSummaryQuery>({
      query: (query) => ({
        url: '/dashboard/summary',
        params: buildDashboardSummaryQueryParams(query),
      }),
      providesTags: [dashboardType.summary],
    }),
    getDashboardWidgetMetadata: builder.query<DashboardWidgetMetadataResponse[], void>({
      query: () => ({
        url: '/dashboard/widgets',
      }),
      providesTags: [dashboardType.summary],
    }),
  }),
});

export const { useGetDashboardSummaryQuery, useGetDashboardWidgetMetadataQuery } = dashboardApi;
