import { it, expect, describe } from 'vitest';

import { DASHBOARD_TEMPLATES } from './dashboard-types';
import { dashboardWidgetRegistry } from './dashboard-widget-registry';
import {
  mapDashboardPayload,
  adaptDashboardPayload,
  adaptDashboardSummaryPayload,
} from './dashboard-adapter';

describe('dashboard adapter', () => {
  it('preserves exact server permissions and does not infer a missing modern drilldown', () => {
    const data = adaptDashboardPayload({ dashboardTemplate: 'leadership', presentationRole: 'leadership',
      kpiCards: [{ id: 'leadership-fee-collection', title: 'Verified', value: 0,
        requiredPermissions: ['Finance.Fees.FeeCollections.View'] }] });
    expect(data.kpiCards[0].requiredPermissions).toEqual(['Finance.Fees.FeeCollections.View']);
    expect(data.kpiCards[0].drilldownUrl).toBeUndefined();
  });

  it('maps a complete dashboard payload into the frontend contract', () => {
    const data = mapDashboardPayload({
      dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
      academicYearId: '2026-27',
      dateRange: {
        label: 'This week',
        from: '2026-06-15',
        to: '2026-06-19',
      },
      kpiCards: [{ id: 'kpi', title: 'KPI', value: '91%' }],
      actionItems: [{ id: 'action', title: 'Action', count: 2 }],
      riskAlerts: [{ id: 'risk', title: 'Risk', owner: 'Admin' }],
      calendarItems: [{ id: 'calendar', title: 'Calendar', dueLabel: 'Today' }],
      moduleSnapshots: [{ id: 'module', title: 'Module', health: 'good' }],
      announcements: [{ id: 'announcement', title: 'Announcement' }],
    });

    expect(data).toMatchObject({
      dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
      academicYearId: '2026-27',
      dateRange: {
        label: 'This week',
        from: '2026-06-15',
        to: '2026-06-19',
      },
    });
    expect(data.kpiCards).toHaveLength(1);
    expect(data.actionItems).toHaveLength(1);
    expect(data.riskAlerts).toHaveLength(1);
    expect(data.calendarItems).toHaveLength(1);
    expect(data.moduleSnapshots).toHaveLength(1);
    expect(data.announcements).toHaveLength(1);
  });

  it('maps missing payload fields to safe empty arrays', () => {
    const data = mapDashboardPayload(undefined, DASHBOARD_TEMPLATES.teacher);

    expect(data.dashboardTemplate).toBe(DASHBOARD_TEMPLATES.teacher);
    expect(data.dateRange.label).toBe('Today');
    expect(data.kpiCards).toEqual([]);
    expect(data.actionItems).toEqual([]);
  });

  it('drops invalid widgets and unsafe drilldown urls', () => {
    const data = mapDashboardPayload({
      dashboardTemplate: DASHBOARD_TEMPLATES.leadership,
      dateRange: { label: 'This month' },
      kpiCards: [
        { id: 'valid', title: 'Valid', drilldownUrl: '/student/dashboard' },
        { id: 'unsafe', title: 'Unsafe', drilldownUrl: 'https://example.com' },
        { id: 'protocol-relative', title: 'Protocol Relative', drilldownUrl: '//example.com' },
        { id: 'missing-title' } as any,
      ],
    });

    expect(data.kpiCards).toHaveLength(3);
    expect(data.kpiCards[0].drilldownUrl).toBe('/student/dashboard');
    expect(data.kpiCards[1].drilldownUrl).toBeUndefined();
    expect(data.kpiCards[2].drilldownUrl).toBeUndefined();
  });

  it('falls back when backend sends an unknown dashboard template', () => {
    const data = mapDashboardPayload(
      { dashboardTemplate: 'unknown' as any },
      DASHBOARD_TEMPLATES.financeHr
    );

    expect(data.dashboardTemplate).toBe(DASHBOARD_TEMPLATES.financeHr);
  });

  it('applies widget registry metadata after payload mapping', () => {
    const data = adaptDashboardPayload({
      dashboardTemplate: DASHBOARD_TEMPLATES.financeHr,
      kpiCards: [
        {
          id: 'finance-collection',
          title: 'Preview Collection',
          value: '9.9L',
          drilldownUrl: '/wrong-url',
        },
      ],
    });

    expect(data.kpiCards[0]).toMatchObject({
      title: 'Preview Collection',
      value: '9.9L',
      drilldownUrl: dashboardWidgetRegistry['finance-collection'].drilldownUrl,
      requiredPermissions: dashboardWidgetRegistry['finance-collection'].requiredPermissions,
    });
  });

  it('applies backend metadata registry when provided', () => {
    const data = adaptDashboardPayload(
      {
        dashboardTemplate: DASHBOARD_TEMPLATES.financeHr,
        kpiCards: [
          {
            id: 'finance-collection',
            title: 'Preview Collection',
            value: '9.9L',
            drilldownUrl: '/wrong-url',
          },
        ],
      },
      DASHBOARD_TEMPLATES.financeHr,
      {
        'finance-collection': {
          id: 'finance-collection',
          zone: 'kpis',
          drilldownUrl: '/backend-finance',
          requiredPermissions: ['Backend.Finance.View'],
        },
      }
    );

    expect(data.kpiCards[0]).toMatchObject({
      title: 'Preview Collection',
      value: '9.9L',
      drilldownUrl: '/backend-finance',
      requiredPermissions: ['Backend.Finance.View'],
    });
  });

  it('maps dashboard API payload and keeps only known zone errors', () => {
    const result = adaptDashboardSummaryPayload({
      dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
      kpiCards: [
        {
          id: 'principal-student-attendance',
          title: 'Student Attendance',
          value: '88%',
        },
      ],
      zoneErrors: {
        kpis: 'Attendance snapshot degraded.',
        unknown: 'Should be ignored.',
        modules: '',
      },
    });

    expect(result.data.kpiCards[0]).toMatchObject({
      id: 'principal-student-attendance',
      drilldownUrl: dashboardWidgetRegistry['principal-student-attendance'].drilldownUrl,
    });
    expect(result.zoneErrors).toEqual({
      kpis: 'Attendance snapshot degraded.',
    });
  });
});
