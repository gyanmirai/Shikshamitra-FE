import { it, expect, describe } from 'vitest';

import { dashboardWidgetRegistry } from './dashboard-widget-registry';
import { canShowDashboardWidget, filterDashboardDataByPermissions } from './dashboard-permissions';
import {
  DASHBOARD_TEMPLATES,
  DASHBOARD_ZONE_KEYS,
  type DashboardDataContract,
} from './dashboard-types';

const permissionGrant = (permissionName: string | string[]) => ({
  name: Array.isArray(permissionName) ? permissionName[0] : permissionName,
  isGranted: true,
});

const studentAttendancePermission =
  dashboardWidgetRegistry['principal-student-attendance'].requiredPermissions;
const financeCollectionPermission =
  dashboardWidgetRegistry['finance-collection'].requiredPermissions;
const financeDashboardAlternatePermission = (
  dashboardWidgetRegistry['finance-dashboard'].requiredPermissions as string[]
)[1];

const permissions = [
  permissionGrant(studentAttendancePermission),
  {
    name: Array.isArray(financeCollectionPermission)
      ? financeCollectionPermission[0]
      : financeCollectionPermission,
    isGranted: false,
  },
];

const dashboardData: DashboardDataContract = {
  dashboardTemplate: DASHBOARD_TEMPLATES.principalAdmin,
  dateRange: { label: 'Today' },
  kpiCards: [
    {
      id: 'principal-student-attendance',
      title: 'Attendance',
    },
    {
      id: 'finance-collection',
      title: 'Fees',
    },
  ],
  actionItems: [],
  riskAlerts: [],
  calendarItems: [],
  moduleSnapshots: [],
  announcements: [],
};

describe('dashboard permissions', () => {
  it('shows all widgets before permission enforcement is enabled', () => {
    expect(
      filterDashboardDataByPermissions(dashboardData, [], { enforcePermissions: false }).kpiCards
    ).toHaveLength(2);
  });

  it('filters widgets by granted permissions once enforcement is enabled', () => {
    const filteredData = filterDashboardDataByPermissions(dashboardData, permissions, {
      enforcePermissions: true,
    });

    expect(filteredData.kpiCards).toHaveLength(1);
    expect(filteredData.kpiCards[0].id).toBe('principal-student-attendance');
  });

  it('hides unknown widgets once permission enforcement is enabled', () => {
    const filteredData = filterDashboardDataByPermissions(
      {
        ...dashboardData,
        kpiCards: [
          {
            id: 'unknown-widget',
            title: 'Unknown',
          },
        ],
      },
      permissions,
      {
        enforcePermissions: true,
      }
    );

    expect(filteredData.kpiCards).toHaveLength(0);
  });

  it('hides denied widgets across all dashboard zones', () => {
    const filteredData = filterDashboardDataByPermissions(
      {
        ...dashboardData,
        kpiCards: [{ id: 'finance-collection', title: 'Today Collection' }],
        actionItems: [{ id: 'finance-reconciliation', title: 'Pending fee reconciliation' }],
        riskAlerts: [{ id: 'finance-concession-impact', title: 'Concession impact spike' }],
        calendarItems: [{ id: 'calendar-periodic-test', title: 'Periodic test review' }],
        moduleSnapshots: [{ id: 'finance-dashboard', title: 'Finance Dashboard' }],
        announcements: [{ id: 'announcement-ptm', title: 'PTM circular pending acknowledgement' }],
      },
      [],
      {
        enforcePermissions: true,
      }
    );

    expect(filteredData.kpiCards).toHaveLength(0);
    expect(filteredData.actionItems).toHaveLength(0);
    expect(filteredData.riskAlerts).toHaveLength(0);
    expect(filteredData.calendarItems).toHaveLength(0);
    expect(filteredData.moduleSnapshots).toHaveLength(0);
    expect(filteredData.announcements).toHaveLength(0);
  });

  it('supports permission arrays from registry metadata', () => {
    expect(
      canShowDashboardWidget(
        {
          id: 'finance-dashboard',
          title: 'Finance Dashboard',
        },
        [{ name: financeDashboardAlternatePermission, isGranted: true }],
        { enforcePermissions: true },
        DASHBOARD_ZONE_KEYS.modules
      )
    ).toBe(true);
  });

  it('uses widget metadata permissions when backend metadata overrides the local registry', () => {
    expect(
      canShowDashboardWidget(
        {
          id: 'principal-student-attendance',
          title: 'Student Attendance',
          requiredPermissions: ['Backend.Attendance.View'],
        },
        [{ name: 'Backend.Attendance.View', isGranted: true }],
        { enforcePermissions: true },
        DASHBOARD_ZONE_KEYS.kpis
      )
    ).toBe(true);
  });
});
