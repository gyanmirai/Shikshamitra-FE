import { it, expect, describe } from 'vitest';

import { selectDashboardFocus, isVerifiedDashboardPersonalContext } from './dashboard-focus-access';

import type { DashboardFocus } from './dashboard-focus-types';
import type { DashboardDataContract } from './dashboard-types';

const focus: DashboardFocus = { kind: 'attendance', widgetId: 'principal-student-attendance',
  title: 'Attendance', description: 'Recorded observations', status: 'ready', accessMode: 'staff',
  requiredPermissions: ['Students.Attendance.View', 'Students.Records.View'], series: [], items: [], metrics: [] };
const data: DashboardDataContract = { dashboardTemplate: 'principalAdmin', dateRange: { label: 'Today' },
  kpiCards: [], actionItems: [], riskAlerts: [], calendarItems: [], moduleSnapshots: [], announcements: [], focus };

describe('dashboard focus visibility', () => {
  it('requires every staff source permission, even if the anchor widget is permitted', () => {
    const grants = [{ name: 'Students.Attendance.View', isGranted: true }];
    expect(selectDashboardFocus(data, grants, true)).toBeUndefined();
    expect(selectDashboardFocus(data, [...grants, { name: 'Students.Records.View', isGranted: true }], true)?.title).toBe('Attendance');
  });

  it('requires a returned matching child before displaying personal focus', () => {
    const personal = { ...data, dashboardTemplate: 'studentParent' as const, presentationRole: 'parent' as const,
      students: [{ id: 'child-a', label: 'Child A' }], selectedStudentId: 'child-b',
      focus: { ...focus, accessMode: 'personal' as const, requiredPermissions: [] } };
    expect(isVerifiedDashboardPersonalContext(personal)).toBe(false);
    expect(selectDashboardFocus(personal, [], true)).toBeUndefined();
    expect(selectDashboardFocus({ ...personal, selectedStudentId: 'child-a' }, [], true)).toBeDefined();
  });

  it('removes staff drilldowns from personal focus', () => {
    const personal = { ...data, dashboardTemplate: 'studentParent' as const, presentationRole: 'student' as const,
      students: [{ id: 'self', label: 'Self' }], selectedStudentId: 'self',
      focus: { ...focus, accessMode: 'personal' as const, items: [{ id: 'exam', title: 'My exam', drilldownUrl: '/academic/dashboard' }] } };
    expect(selectDashboardFocus(personal, [], true)?.items[0].drilldownUrl).toBeUndefined();
  });
});
