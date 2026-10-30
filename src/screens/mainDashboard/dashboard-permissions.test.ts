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
  it('requires all exact source permissions supplied by modern combined widgets', () => {
    const combined = { ...dashboardData, presentationRole: 'principal' as const,
      kpiCards: [{ id: 'principal-student-attendance', title: 'Attendance', requiredPermissions: ['Attendance.View', 'Records.View'] }] };
    expect(filterDashboardDataByPermissions(combined, [{ name: 'Attendance.View', isGranted: true }], { enforcePermissions: true }).kpiCards).toEqual([]);
  });

  it('displays only registered personal facts for a verified selected child without staff grants', () => {
    const personal: DashboardDataContract = { ...dashboardData, dashboardTemplate: 'studentParent', presentationRole: 'parent',
      students: [{ id: 'child', label: 'Child' }], selectedStudentId: 'child',
      focus: { kind: 'results', widgetId: 'student-academic-summary', title: 'Results', description: '', status: 'empty',
        accessMode: 'personal', requiredPermissions: [], series: [], items: [], metrics: [] },
      kpiCards: [{ id: 'student-upcoming-exams', title: 'My exams', value: 0 },
        { id: 'finance-collection', title: 'School collections', value: 999 }],
    };
    const permitted = filterDashboardDataByPermissions(personal, [], { enforcePermissions: true });
    expect(permitted.kpiCards.map((widget) => widget.id)).toEqual(['student-upcoming-exams']);
    expect(filterDashboardDataByPermissions({ ...personal, selectedStudentId: 'unlinked' }, [], { enforcePermissions: true }).kpiCards).toEqual([]);
  });
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

  it('does not expose a combined summary from just one registry permission', () => {
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
    ).toBe(false);
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
