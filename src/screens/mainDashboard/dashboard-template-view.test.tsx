import type { ComponentProps } from 'react';
import type { PermissionName } from 'src/utils/permissions';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { getDashboardMockData } from './dashboard-mock-data';
import DashboardTemplateView from './dashboard-template-view';
import { dashboardWidgetRegistry } from './dashboard-widget-registry';
import { DASHBOARD_TEMPLATES, DASHBOARD_ZONE_KEYS } from './dashboard-types';
import { createDashboardMockDataSourceResult } from './dashboard-data-source';

import type { DashboardDataContract } from './dashboard-types';

const navigationMock = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: navigationMock.push,
  }),
}));

const allZoneTestIds = [
  'dashboard-zone-kpis',
  'dashboard-zone-actions',
  'dashboard-zone-risks',
  'dashboard-zone-modules',
  'dashboard-zone-calendar',
  'dashboard-zone-announcements',
];

const renderDashboard = (
  data: DashboardDataContract,
  options?: Partial<ComponentProps<typeof DashboardTemplateView>>
) =>
  render(
    <DashboardTemplateView data={data} permissions={[]} enforcePermissions={false} {...options} />
  );

const emptyDashboardData: DashboardDataContract = {
  dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
  dateRange: { label: 'Today' },
  kpiCards: [],
  actionItems: [],
  riskAlerts: [],
  moduleSnapshots: [],
  calendarItems: [],
  announcements: [],
};

const permissionGrant = (permissionName: PermissionName) => ({
  name: Array.isArray(permissionName) ? permissionName[0] : permissionName,
  isGranted: true,
});

describe('DashboardTemplateView', () => {
  afterEach(() => {
    navigationMock.push.mockClear();
  });

  Object.values(DASHBOARD_TEMPLATES).forEach((template) => {
    it(`renders all major zones for the ${template} template`, () => {
      renderDashboard(createDashboardMockDataSourceResult(template).data);

      expect(screen.getByTestId(`dashboard-template-${template}`)).toBeVisible();
      allZoneTestIds.forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeVisible();
      });
    });
  });

  it('shows zone empty states when no permitted items are available', () => {
    renderDashboard(emptyDashboardData);

    allZoneTestIds.forEach((testId) => {
      expect(within(screen.getByTestId(testId)).getByTestId(`${testId}-empty`)).toBeVisible();
    });
  });

  it('shows a zone loading state without blanking unaffected zones', () => {
    renderDashboard(getDashboardMockData(DASHBOARD_TEMPLATES.principalAdmin), {
      loadingZones: [DASHBOARD_ZONE_KEYS.actions],
    });

    expect(screen.getByTestId('dashboard-zone-actions-loading')).toBeVisible();
    expect(screen.getByTestId('dashboard-widget-principal-student-attendance')).toBeVisible();
  });

  it('shows a zone error state while unaffected zones still render', () => {
    renderDashboard(getDashboardMockData(DASHBOARD_TEMPLATES.principalAdmin), {
      zoneErrors: {
        risks: 'Unable to load risk alerts.',
      },
    });

    expect(screen.getByTestId('dashboard-zone-risks-error')).toHaveTextContent(
      'Unable to load risk alerts.'
    );
    expect(screen.getByTestId('dashboard-widget-principal-student-attendance')).toBeVisible();
  });

  it('renders drilldown widgets as clickable actions', () => {
    renderDashboard(getDashboardMockData(DASHBOARD_TEMPLATES.principalAdmin));

    fireEvent.click(screen.getByRole('button', { name: 'Open Academic Dashboard' }));

    expect(navigationMock.push).toHaveBeenCalledWith('/academic/dashboard');
  });

  it('keeps unknown widgets hidden when permission enforcement is enabled', () => {
    renderDashboard(
      {
        ...emptyDashboardData,
        kpiCards: [
          {
            id: 'unknown-widget',
            title: 'Unknown KPI',
            value: 2,
          },
        ],
      },
      {
        enforcePermissions: true,
        permissions: [],
      }
    );

    expect(screen.queryByText('Unknown KPI')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-zone-kpis-empty')).toBeVisible();
  });

  it('shows finance widgets and hides HR widgets for a limited Finance/HR permission set', () => {
    renderDashboard(getDashboardMockData(DASHBOARD_TEMPLATES.financeHr), {
      enforcePermissions: true,
      permissions: [
        permissionGrant(dashboardWidgetRegistry['finance-collection'].requiredPermissions),
        permissionGrant(dashboardWidgetRegistry['finance-dashboard'].requiredPermissions),
      ],
    });

    expect(screen.getByText('Today Collection')).toBeVisible();
    expect(screen.getByText('Finance Dashboard')).toBeVisible();
    expect(screen.queryByText('Payroll Readiness')).not.toBeInTheDocument();
    expect(screen.queryByText('93%')).not.toBeInTheDocument();
    expect(screen.queryByText('Staff Attendance')).not.toBeInTheDocument();
    expect(screen.queryByText('95.8%')).not.toBeInTheDocument();
    expect(screen.queryByText('HR Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open HR Dashboard' })).not.toBeInTheDocument();
  });

  it('keeps every mock widget actionable through a drilldown or owner', () => {
    Object.values(DASHBOARD_TEMPLATES).forEach((template) => {
      const templateData = getDashboardMockData(template);
      [
        ...templateData.kpiCards,
        ...templateData.actionItems,
        ...templateData.riskAlerts,
        ...templateData.moduleSnapshots,
        ...templateData.calendarItems,
        ...templateData.announcements,
      ].forEach((widget) => {
        expect(Boolean(widget.drilldownUrl || widget.owner), widget.id).toBe(true);
      });
    });
  });
});
