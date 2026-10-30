import { useMemo, useState, useEffect } from 'react';

import { getDashboardMockData } from './dashboard-mock-data';
import { adaptDashboardSummaryPayload } from './dashboard-adapter';
import { useDashboardApiSource, type DashboardApiSourceOptions } from './dashboard-api-source';
import {
  DASHBOARD_ZONE_KEYS,
  type DashboardTemplate,
  type DashboardDataSourceName,
  type DashboardDataSourceResult,
} from './dashboard-types';

export const DASHBOARD_CONTRACT_PREVIEW_PATH = '/api/dashboard/contract-preview';
export const DASHBOARD_CONTRACT_PREVIEW_QUERY_VALUE = 'contractPreview';
export const DASHBOARD_MOCK_SOURCE_QUERY_VALUE = 'mock';

const allDashboardZones = Object.values(DASHBOARD_ZONE_KEYS);

type DashboardDataSourceMode = 'api' | 'mock' | 'contractPreview';

type DashboardDataSourceOptions = DashboardApiSourceOptions & {
  mode?: DashboardDataSourceMode;
  academicYearId?: string;
  from?: string;
  to?: string;
};

type DashboardContractPreviewFetcher = typeof fetch;

const isContractPreviewAllowed =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_CONTRACT_PREVIEW === 'true';

const isMockSourceAllowed =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_MOCK_SOURCE === 'true';

export const getDashboardDataSourceMode = (value: string | null): DashboardDataSourceMode =>
  value === DASHBOARD_CONTRACT_PREVIEW_QUERY_VALUE && isContractPreviewAllowed
    ? 'contractPreview'
    : value === DASHBOARD_MOCK_SOURCE_QUERY_VALUE && isMockSourceAllowed
      ? 'mock'
      : 'api';

export const createDashboardMockDataSourceResult = (
  template: DashboardTemplate,
  source: DashboardDataSourceName = 'mock'
): DashboardDataSourceResult => ({
  data: getDashboardMockData(template),
  isLoading: false,
  loadingZones: [],
  zoneErrors: {},
  source,
});

export const createEmptyDashboardDataSourceResult = (
  template: DashboardTemplate,
  source: DashboardDataSourceName = 'api'
): DashboardDataSourceResult => ({
  data: {
    dashboardTemplate: template,
    dateRange: { label: 'Current period' },
    dataState: source === 'apiError' ? 'partial' : 'live',
    kpiCards: [],
    actionItems: [],
    riskAlerts: [],
    calendarItems: [],
    moduleSnapshots: [],
    announcements: [],
  },
  isLoading: false,
  loadingZones: [],
  zoneErrors: {},
  source,
});

export async function fetchDashboardContractPreview(
  template: DashboardTemplate,
  fetcher: DashboardContractPreviewFetcher = fetch
): Promise<DashboardDataSourceResult> {
  const response = await fetcher(
    `${DASHBOARD_CONTRACT_PREVIEW_PATH}?dashboardTemplate=${encodeURIComponent(template)}`,
    {
      headers: {
        'x-dashboard-contract-preview': 'true',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Dashboard contract preview failed with ${response.status}`);
  }

  const adapted = adaptDashboardSummaryPayload(await response.json(), template);

  return {
    ...adapted,
    isLoading: false,
    loadingZones: [],
    source: 'contractPreview',
  };
}

export function useDashboardDataSource({
  template,
  mode = 'api',
  academicYearId,
  from,
  to,
  studentId,
  presentationRole,
  accessKey,
  enabled = true,
}: DashboardDataSourceOptions): DashboardDataSourceResult {
  const mockResult = useMemo(() => createDashboardMockDataSourceResult(template), [template]);
  const emptyResult = useMemo(() => createEmptyDashboardDataSourceResult(template), [template]);
  const [result, setResult] = useState<DashboardDataSourceResult>(mockResult);
  const apiResult = useDashboardApiSource({ template, academicYearId, from, to, studentId,
    presentationRole, accessKey, enabled: enabled && mode === 'api' });

  useEffect(() => {
    let isActive = true;

    if (mode !== 'contractPreview') {
      setResult(mockResult);
      return () => {
        isActive = false;
      };
    }

    setResult({
      ...mockResult,
      isLoading: true,
      loadingZones: allDashboardZones,
      source: 'contractPreview',
    });

    fetchDashboardContractPreview(template)
      .then((previewResult) => {
        if (!isActive) {
          return;
        }

        setResult(previewResult);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setResult({
          ...mockResult,
          source: 'contractPreviewFallback',
          globalError:
            'Dashboard contract preview is unavailable. Showing mock dashboard data instead.',
        });
      });

    return () => {
      isActive = false;
    };
  }, [mockResult, mode, template]);

  if (mode === 'api') {
    return apiResult.data.dashboardTemplate === template ? apiResult : emptyResult;
  }

  return result.data.dashboardTemplate === template ? result : mockResult;
}
