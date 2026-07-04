import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach } from 'vitest';

import { dashboardWidgetRegistry } from './dashboard-widget-registry';
import { DASHBOARD_TEMPLATES, DASHBOARD_ZONE_KEYS } from './dashboard-types';
import {
  useDashboardDataSource,
  getDashboardDataSourceMode,
  fetchDashboardContractPreview,
  DASHBOARD_CONTRACT_PREVIEW_PATH,
  createDashboardMockDataSourceResult,
} from './dashboard-data-source';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

const createDashboardHookWrapper = () => {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(api.middleware),
  });

  return function DashboardHookWrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  };
};

const getFetchUrl = (input: RequestInfo | URL) =>
  typeof input === 'string' || input instanceof URL ? input.toString() : input.url;

const sessionResponse = () =>
  new Response(
    JSON.stringify({
      accessToken: 'test-token',
      profile: {
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    }),
    { status: 200 }
  );

describe('dashboard data source', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses API mode unless a gated dev/test source is explicitly requested', () => {
    expect(getDashboardDataSourceMode(null)).toBe('api');
    expect(getDashboardDataSourceMode('unknown')).toBe('api');
    expect(getDashboardDataSourceMode('mock')).toBe('mock');
    expect(getDashboardDataSourceMode('contractPreview')).toBe('contractPreview');
  });

  it('keeps mock and contract preview disabled in production unless explicitly enabled', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DASHBOARD_CONTRACT_PREVIEW', 'false');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DASHBOARD_MOCK_SOURCE', 'false');

    const productionModule = await import('./dashboard-data-source');

    expect(productionModule.getDashboardDataSourceMode('contractPreview')).toBe('api');
    expect(productionModule.getDashboardDataSourceMode('mock')).toBe('api');

    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DASHBOARD_CONTRACT_PREVIEW', 'true');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DASHBOARD_MOCK_SOURCE', 'true');

    const enabledProductionModule = await import('./dashboard-data-source');

    expect(enabledProductionModule.getDashboardDataSourceMode('contractPreview')).toBe(
      'contractPreview'
    );
    expect(enabledProductionModule.getDashboardDataSourceMode('mock')).toBe('mock');
  });

  it('creates a stable mock data source result', () => {
    const result = createDashboardMockDataSourceResult(DASHBOARD_TEMPLATES.teacher);

    expect(result.source).toBe('mock');
    expect(result.isLoading).toBe(false);
    expect(result.loadingZones).toEqual([]);
    expect(result.data.dashboardTemplate).toBe(DASHBOARD_TEMPLATES.teacher);
  });

  it('fetches and adapts a contract preview payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          dashboardTemplate: DASHBOARD_TEMPLATES.financeHr,
          dateRange: { label: 'Preview day' },
          kpiCards: [
            {
              id: 'finance-collection',
              title: 'Preview Collection',
              value: '9.9L',
            },
          ],
        }),
        { status: 200 }
      )
    );

    const result = await fetchDashboardContractPreview(DASHBOARD_TEMPLATES.financeHr, fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      `${DASHBOARD_CONTRACT_PREVIEW_PATH}?dashboardTemplate=financeHr`,
      expect.objectContaining({
        headers: {
          'x-dashboard-contract-preview': 'true',
        },
      })
    );
    expect(result.source).toBe('contractPreview');
    expect(result.data.dateRange.label).toBe('Preview day');
    expect(result.data.kpiCards[0]).toMatchObject({
      title: 'Preview Collection',
      value: '9.9L',
      drilldownUrl: dashboardWidgetRegistry['finance-collection'].drilldownUrl,
    });
  });

  it('loads contract preview data without blanking the mock dashboard first', async () => {
    let resolvePreviewFetch: (response: Response) => void = () => {};
    const previewFetchPromise = new Promise<Response>((resolve) => {
      resolvePreviewFetch = resolve;
    });

    vi.stubGlobal('fetch', vi.fn().mockReturnValue(previewFetchPromise));

    const { result } = renderHook(
      () =>
        useDashboardDataSource({
          template: DASHBOARD_TEMPLATES.financeHr,
          mode: 'contractPreview',
        }),
      { wrapper: createDashboardHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });
    expect(result.current.loadingZones).toEqual(Object.values(DASHBOARD_ZONE_KEYS));
    expect(result.current.data.dashboardTemplate).toBe(DASHBOARD_TEMPLATES.financeHr);

    resolvePreviewFetch(
      new Response(
        JSON.stringify({
          dashboardTemplate: DASHBOARD_TEMPLATES.financeHr,
          kpiCards: [
            {
              id: 'finance-collection',
              title: 'Preview Collection',
              value: '9.9L',
            },
          ],
        }),
        { status: 200 }
      )
    );

    await waitFor(() => {
      expect(result.current.source).toBe('contractPreview');
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data.kpiCards[0].title).toBe('Preview Collection');
  });

  it('falls back to mock data when contract preview fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const { result } = renderHook(
      () =>
        useDashboardDataSource({
          template: DASHBOARD_TEMPLATES.financeHr,
          mode: 'contractPreview',
        }),
      { wrapper: createDashboardHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.source).toBe('contractPreviewFallback');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.globalError).toContain('contract preview is unavailable');
    expect(result.current.data.kpiCards.some((widget) => widget.title === 'Today Collection')).toBe(
      true
    );
  });

  it('loads API data by default without blanking the mock dashboard first', async () => {
    let resolveApiFetch: (response: Response) => void = () => {};
    const apiFetchPromise = new Promise<Response>((resolve) => {
      resolveApiFetch = resolve;
    });

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = getFetchUrl(input);
        if (url.includes('/api/auth/session')) {
          return sessionResponse();
        }

        if (url.includes('/dashboard/widgets')) {
          return new Response(
            JSON.stringify([
              {
                id: 'principal-leave-approvals',
                zone: 'actions',
                drilldownUrl: '/backend-leave-approvals',
                requiredPermissions: ['Backend.HR.Leave.View'],
                owner: 'Backend HR',
              },
            ]),
            { status: 200 }
          );
        }

        return apiFetchPromise;
      })
    );

    const { result } = renderHook(
      () =>
        useDashboardDataSource({
          template: DASHBOARD_TEMPLATES.principalAdmin,
        }),
      { wrapper: createDashboardHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.source).toBe('api');
      expect(result.current.isLoading).toBe(true);
    });
    expect(result.current.loadingZones).toEqual(Object.values(DASHBOARD_ZONE_KEYS));
    expect(result.current.data.dashboardTemplate).toBe(DASHBOARD_TEMPLATES.principalAdmin);

    resolveApiFetch(
      new Response(
        JSON.stringify({
          dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
          dateRange: { label: 'API month to date' },
          kpiCards: [
            {
              id: 'principal-student-attendance',
              title: 'Student Attendance',
              value: '88%',
            },
          ],
          actionItems: [
            {
              id: 'principal-leave-approvals',
              title: 'Staff leave approvals',
              count: 7,
              subtitle: '7 leave requests awaiting action',
            },
          ],
          zoneErrors: {
            kpis: 'Attendance slice degraded.',
            ignored: 'Should not render.',
          },
        }),
        { status: 200 }
      )
    );

    await waitFor(() => {
      expect(result.current.source).toBe('api');
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data.dateRange.label).toBe('API month to date');
    expect(result.current.data.kpiCards[0].value).toBe('88%');
    expect(result.current.data.actionItems[0]).toMatchObject({
      id: 'principal-leave-approvals',
      count: 7,
      subtitle: '7 leave requests awaiting action',
      drilldownUrl: '/backend-leave-approvals',
      owner: 'Backend HR',
    });
    expect(result.current.zoneErrors).toEqual({ kpis: 'Attendance slice degraded.' });
  });

  it('maps API-provided Teacher learning-task workload values without shell changes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = getFetchUrl(input);
        if (url.includes('/api/auth/session')) {
          return sessionResponse();
        }

        if (url.includes('/dashboard/widgets')) {
          return new Response(
            JSON.stringify([
              {
                id: 'teacher-homework',
                zone: 'kpis',
                drilldownUrl: '/academic/gradingAndFeedback',
                requiredPermissions:
                  dashboardWidgetRegistry['teacher-homework'].requiredPermissions,
                owner: 'Teacher',
              },
            ]),
            { status: 200 }
          );
        }

        return new Response(
          JSON.stringify({
            dashboardTemplate: DASHBOARD_TEMPLATES.teacher,
            dateRange: { label: 'Teacher workload' },
            kpiCards: [
              {
                id: 'teacher-homework',
                title: 'Pending Learning Reviews',
                value: '6',
                count: 6,
                subtitle: '6 creator-owned submissions pending review',
                status: 'warning',
              },
            ],
          }),
          { status: 200 }
        );
      })
    );

    const { result } = renderHook(
      () =>
        useDashboardDataSource({
          template: DASHBOARD_TEMPLATES.teacher,
        }),
      { wrapper: createDashboardHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.source).toBe('api');
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data.kpiCards[0]).toMatchObject({
      id: 'teacher-homework',
      title: 'Pending Learning Reviews',
      value: '6',
      count: 6,
      subtitle: '6 creator-owned submissions pending review',
      drilldownUrl: '/academic/gradingAndFeedback',
    });
  });

  it('falls back to local widget metadata when the metadata API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = getFetchUrl(input);
        if (url.includes('/api/auth/session')) {
          return sessionResponse();
        }

        if (url.includes('/dashboard/widgets')) {
          return new Response(JSON.stringify({ error: 'down' }), { status: 500 });
        }

        return new Response(
          JSON.stringify({
            dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
            actionItems: [
              {
                id: 'principal-leave-approvals',
                title: 'Staff leave approvals',
                count: 4,
              },
            ],
          }),
          { status: 200 }
        );
      })
    );

    const { result } = renderHook(
      () =>
        useDashboardDataSource({
          template: DASHBOARD_TEMPLATES.principalAdmin,
        }),
      { wrapper: createDashboardHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.source).toBe('api');
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data.actionItems[0]).toMatchObject({
      id: 'principal-leave-approvals',
      drilldownUrl: dashboardWidgetRegistry['principal-leave-approvals'].drilldownUrl,
      owner: dashboardWidgetRegistry['principal-leave-approvals'].owner,
    });
  });

  it('falls back to mock data when the dashboard API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) =>
        getFetchUrl(input).includes('/api/auth/session')
          ? sessionResponse()
          : new Response(JSON.stringify({ error: 'down' }), { status: 500 })
      )
    );

    const { result } = renderHook(
      () =>
        useDashboardDataSource({
          template: DASHBOARD_TEMPLATES.principalAdmin,
        }),
      { wrapper: createDashboardHookWrapper() }
    );

    await waitFor(() => {
      expect(result.current.source).toBe('apiFallback');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.globalError).toContain('Dashboard API is unavailable');
    expect(
      result.current.data.kpiCards.some((widget) => widget.id === 'principal-student-attendance')
    ).toBe(true);
  });
});
