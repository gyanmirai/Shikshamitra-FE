import type { ComponentProps } from 'react';
import type { PermissionName } from 'src/utils/permissions';

import { it, vi, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { getDashboardMockData } from './dashboard-mock-data';
import DashboardTemplateView from './dashboard-template-view';
import { dashboardWidgetRegistry } from './dashboard-widget-registry';
import { DASHBOARD_TEMPLATES, DASHBOARD_ZONE_KEYS } from './dashboard-types';
import { createDashboardMockDataSourceResult } from './dashboard-data-source';

import type { DashboardDataContract } from './dashboard-types';

vi.mock('@iconify/react', () => ({ Icon: () => null, disableCache: () => {} }));
vi.mock('src/components/chart', () => ({ Chart: () => null, useChart: (options: unknown) => options }));

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
  Object.values(DASHBOARD_TEMPLATES).forEach((template) => {
    it(`renders all major zones for the ${template} template`, () => {
      renderDashboard(createDashboardMockDataSourceResult(template).data);

      expect(screen.getByTestId(`dashboard-template-${template}`)).toBeVisible();
      allZoneTestIds.forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeVisible();
      });
    });
  });

  it('keeps compact metrics before the focus and action region for Principal/Admin', () => {
    renderDashboard(createDashboardMockDataSourceResult(DASHBOARD_TEMPLATES.principalAdmin).data);

    const actions = screen.getByTestId('dashboard-zone-actions');
    const metrics = screen.getByTestId('dashboard-zone-kpis');

    expect(metrics.compareDocumentPosition(actions)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('keeps the school pulse first for the Leadership template', () => {
    renderDashboard(createDashboardMockDataSourceResult(DASHBOARD_TEMPLATES.leadership).data);

    const metrics = screen.getByTestId('dashboard-zone-kpis');
    const actions = screen.getByTestId('dashboard-zone-actions');

    expect(metrics.compareDocumentPosition(actions)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByRole('heading', { level: 1, name: 'Leadership Dashboard' })).toBeVisible();
  });

  it('renders the live role focus before priorities with no mock toolbar', () => {
    renderDashboard({ ...emptyDashboardData, presentationRole: 'principal', focus: {
      kind: 'attendance', widgetId: 'principal-student-attendance', title: 'Recorded Attendance',
      description: 'Submitted observations only', status: 'empty', accessMode: 'staff',
      requiredPermissions: ['Students.Attendance.View'], series: [], items: [], metrics: [],
      message: 'No submitted observations in this period.' } });
    expect(screen.getByRole('heading', { name: 'Recorded Attendance' })).toBeVisible();
    expect(screen.getByTestId('dashboard-zone-focus').compareDocumentPosition(screen.getByTestId('dashboard-zone-actions')))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.queryByText('Interactive Mockup')).not.toBeInTheDocument();
  });

  it('shows zone empty states when no permitted items are available', () => {
    renderDashboard(emptyDashboardData);

    allZoneTestIds.forEach((testId) => {
      expect(within(screen.getByTestId(testId)).getByTestId(`${testId}-empty`)).toBeVisible();
    });
  });

  it('shows a zone loading state without blanking unaffected zones', () => {
    renderDashboard({ ...getDashboardMockData(DASHBOARD_TEMPLATES.principalAdmin), actionItems: [] }, {
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

  it('renders drilldown widgets as links with normal navigation semantics', () => {
    renderDashboard(getDashboardMockData(DASHBOARD_TEMPLATES.principalAdmin));

    expect(screen.getByRole('link', { name: 'View details: Academic Dashboard' })).toHaveAttribute(
      'href',
      '/academic/dashboard'
    );
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
        ...(dashboardWidgetRegistry['finance-dashboard'].requiredPermissions as string[]).map(permissionGrant),
      ],
    });

    expect(screen.getByText('Today Collection')).toBeVisible();
    expect(screen.getByText('Finance Dashboard')).toBeVisible();
    expect(screen.queryByText('Payroll Readiness')).not.toBeInTheDocument();
    expect(screen.queryByText('93%')).not.toBeInTheDocument();
    expect(screen.queryByText('Staff Attendance')).not.toBeInTheDocument();
    expect(screen.queryByText('95.8%')).not.toBeInTheDocument();
    expect(screen.queryByText('HR Dashboard')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'View details: HR Dashboard' })
    ).not.toBeInTheDocument();
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
