import type { PermissionName } from 'src/utils/permissions';

import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { calendarPermissions } from 'src/constants/calendar-menu';
import { communicationPermissions } from 'src/constants/comminication-menu';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';
import { transportPaths, transportPermissions } from 'src/constants/transport-menu';
import { securityGuardPaths, securityGuardPermissions } from 'src/constants/security-gaurd-menu';

import { DASHBOARD_ZONE_KEYS } from './dashboard-types';

import type {
  DashboardWidget,
  DashboardZoneKey,
  DashboardActionItem,
  DashboardDataContract,
  DashboardModuleSnapshot,
} from './dashboard-types';

export type DashboardWidgetRegistryEntry = {
  id: string;
  zone: DashboardZoneKey;
  requiredPermissions: PermissionName;
  drilldownUrl?: string;
  owner?: string;
};

export type DashboardWidgetRegistry = Record<string, DashboardWidgetRegistryEntry>;

export const dashboardWidgetRegistry: DashboardWidgetRegistry = {
  'announcement-board-practical': {
    id: 'announcement-board-practical',
    zone: DASHBOARD_ZONE_KEYS.announcements,
    drilldownUrl: academicPaths.examination.schedule,
    requiredPermissions: academicPermissions.examination.schedule,
  },
  'announcement-ptm': {
    id: 'announcement-ptm',
    zone: DASHBOARD_ZONE_KEYS.announcements,
    drilldownUrl: '/communication/dashboard',
    requiredPermissions: communicationPermissions.dashboard,
  },
  'calendar-periodic-test': {
    id: 'calendar-periodic-test',
    zone: DASHBOARD_ZONE_KEYS.calendar,
    drilldownUrl: academicPaths.examination.schedule,
    requiredPermissions: academicPermissions.examination.schedule,
  },
  'calendar-safety-drill': {
    id: 'calendar-safety-drill',
    zone: DASHBOARD_ZONE_KEYS.calendar,
    drilldownUrl: '/calendar/view',
    requiredPermissions: calendarPermissions.view,
  },
  'leadership-total-students': {
    id: 'leadership-total-students',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: studentPaths.records.studentList,
    requiredPermissions: studentPermissions.records.studentList,
  },
  'leadership-fee-collection': {
    id: 'leadership-fee-collection',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: financePaths.feeCollection,
    requiredPermissions: financePermissions.fees.collections,
  },
  'leadership-attendance': {
    id: 'leadership-attendance',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: studentPaths.attendance.markAttendance,
    requiredPermissions: studentPermissions.attendance.markAttendance,
  },
  'leadership-compliance': {
    id: 'leadership-compliance',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: '/setting/basic-information',
    requiredPermissions: 'ShikshaMitra.Module.InstituteSetup',
  },
  'leadership-admission-approvals': {
    id: 'leadership-admission-approvals',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'Admissions',
    drilldownUrl: studentPaths.enrollment.admission,
    requiredPermissions: studentPermissions.enrollment.admission,
  },
  'leadership-payroll-review': {
    id: 'leadership-payroll-review',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'HR',
    drilldownUrl: hrPaths.payroll.runPayroll,
    requiredPermissions: hrPermissions.payroll.runPayroll,
  },
  'leadership-certificate-risk': {
    id: 'leadership-certificate-risk',
    zone: DASHBOARD_ZONE_KEYS.risks,
    owner: 'Admin office',
    drilldownUrl: '/setting/basic-information',
    requiredPermissions: 'ShikshaMitra.Module.InstituteSetup',
  },
  'leadership-academic-health': {
    id: 'leadership-academic-health',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: academicPaths.dashboard,
    requiredPermissions: academicPermissions.dashboard,
  },
  'leadership-transport-health': {
    id: 'leadership-transport-health',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: transportPaths.dashboard,
    requiredPermissions: transportPermissions.dashboard,
  },
  'principal-student-attendance': {
    id: 'principal-student-attendance',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: studentPaths.attendance.markAttendance,
    requiredPermissions: studentPermissions.attendance.markAttendance,
  },
  'principal-teacher-attendance': {
    id: 'principal-teacher-attendance',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: hrPaths.attendance.attendanceTracking,
    requiredPermissions: hrPermissions.attendance.attendanceTracking,
  },
  'principal-curriculum': {
    id: 'principal-curriculum',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: academicPaths.curriculum.chaptersManagement,
    requiredPermissions: academicPermissions.curriculum.chaptersManagement,
  },
  'principal-pending-admissions': {
    id: 'principal-pending-admissions',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: studentPaths.enrollment.admission,
    requiredPermissions: studentPermissions.enrollment.admission,
  },
  'principal-leave-approvals': {
    id: 'principal-leave-approvals',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'HR',
    drilldownUrl: hrPaths.leaveManagement.approvals,
    requiredPermissions: hrPermissions.leaveManagement.approvals,
  },
  'principal-transport-applications': {
    id: 'principal-transport-applications',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'Transport',
    drilldownUrl: transportPaths.applicationManagement,
    requiredPermissions: transportPermissions.applicationManagement,
  },
  'principal-weak-classes': {
    id: 'principal-weak-classes',
    zone: DASHBOARD_ZONE_KEYS.risks,
    owner: 'Academic coordinator',
    drilldownUrl: academicPaths.dashboard,
    requiredPermissions: academicPermissions.dashboard,
  },
  'principal-academic-dashboard': {
    id: 'principal-academic-dashboard',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: academicPaths.dashboard,
    requiredPermissions: academicPermissions.dashboard,
  },
  'principal-security-dashboard': {
    id: 'principal-security-dashboard',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: securityGuardPaths.dashboard,
    requiredPermissions: securityGuardPermissions.dashboard,
  },
  'teacher-classes': {
    id: 'teacher-classes',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: academicPaths.timetable.management,
    requiredPermissions: academicPermissions.timetable.management,
  },
  'teacher-homework': {
    id: 'teacher-homework',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: academicPaths.homework.assessment,
    requiredPermissions: academicPermissions.homework.assessment,
  },
  'teacher-exam-evaluation': {
    id: 'teacher-exam-evaluation',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: academicPaths.examination.recordMarks,
    requiredPermissions: academicPermissions.examination.recordMarks,
  },
  'teacher-attendance': {
    id: 'teacher-attendance',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'Teacher',
    drilldownUrl: studentPaths.attendance.markAttendance,
    requiredPermissions: studentPermissions.attendance.markAttendance,
  },
  'teacher-student-risk': {
    id: 'teacher-student-risk',
    zone: DASHBOARD_ZONE_KEYS.risks,
    owner: 'Class teacher',
    drilldownUrl: studentPaths.records.studentList,
    requiredPermissions: studentPermissions.records.studentList,
  },
  'teacher-class-performance': {
    id: 'teacher-class-performance',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: academicPaths.dashboard,
    requiredPermissions: academicPermissions.dashboard,
  },
  'finance-collection': {
    id: 'finance-collection',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: financePaths.feeCollection,
    requiredPermissions: financePermissions.fees.collections,
  },
  'finance-dues': {
    id: 'finance-dues',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: financePaths.feeCollection,
    requiredPermissions: financePermissions.fees.collections,
  },
  'hr-payroll-readiness': {
    id: 'hr-payroll-readiness',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: hrPaths.payroll.dashboard,
    requiredPermissions: hrPermissions.payroll.dashboard,
  },
  'hr-staff-attendance': {
    id: 'hr-staff-attendance',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: hrPaths.attendance.attendanceTracking,
    requiredPermissions: hrPermissions.attendance.attendanceTracking,
  },
  'finance-reconciliation': {
    id: 'finance-reconciliation',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'Finance',
    drilldownUrl: financePaths.reconciliation,
    requiredPermissions: financePermissions.accounts.reconciliation,
  },
  'hr-leave-approvals': {
    id: 'hr-leave-approvals',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'HR',
    drilldownUrl: hrPaths.leaveManagement.approvals,
    requiredPermissions: hrPermissions.leaveManagement.approvals,
  },
  'finance-concession-impact': {
    id: 'finance-concession-impact',
    zone: DASHBOARD_ZONE_KEYS.risks,
    owner: 'Finance officer',
    drilldownUrl: financePaths.concession,
    requiredPermissions: financePermissions.fees.concessions,
  },
  'finance-dashboard': {
    id: 'finance-dashboard',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: financePaths.dashboard,
    requiredPermissions: [financePermissions.dashboard, 'ShikshaMitra.Module.Finance'],
  },
  'hr-dashboard': {
    id: 'hr-dashboard',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: hrPaths.dashboard,
    requiredPermissions: hrPermissions.dashboard,
  },
  'student-attendance': {
    id: 'student-attendance',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: studentPaths.dashboard,
    requiredPermissions: studentPermissions.dashboard,
  },
  'student-assignments': {
    id: 'student-assignments',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: academicPaths.homework.learningTasks,
    requiredPermissions: academicPermissions.homework.learningTasks,
  },
  'student-fee-status': {
    id: 'student-fee-status',
    zone: DASHBOARD_ZONE_KEYS.kpis,
    drilldownUrl: financePaths.feeCollection,
    requiredPermissions: financePermissions.fees.collections,
  },
  'student-document-update': {
    id: 'student-document-update',
    zone: DASHBOARD_ZONE_KEYS.actions,
    owner: 'Parent',
    drilldownUrl: studentPaths.records.studentList,
    requiredPermissions: studentPermissions.records.studentList,
  },
  'student-transport-alert': {
    id: 'student-transport-alert',
    zone: DASHBOARD_ZONE_KEYS.risks,
    owner: 'Transport',
    drilldownUrl: transportPaths.dashboard,
    requiredPermissions: transportPermissions.dashboard,
  },
  'student-academic-summary': {
    id: 'student-academic-summary',
    zone: DASHBOARD_ZONE_KEYS.modules,
    drilldownUrl: studentPaths.dashboard,
    requiredPermissions: studentPermissions.dashboard,
  },
};

export const getDashboardWidgetRegistryEntry = (
  widgetId: string,
  zone?: DashboardZoneKey,
  registry: DashboardWidgetRegistry = dashboardWidgetRegistry
): DashboardWidgetRegistryEntry | undefined => {
  const entry = registry[widgetId];
  if (!entry) {
    return undefined;
  }

  return !zone || entry.zone === zone ? entry : undefined;
};

export const isRegisteredDashboardWidget = (widgetId: string, zone?: DashboardZoneKey) =>
  Boolean(getDashboardWidgetRegistryEntry(widgetId, zone));

const enrichWidgetsFromRegistry = <T extends DashboardWidget>(
  widgets: T[],
  zone: DashboardZoneKey,
  registry: DashboardWidgetRegistry
): T[] =>
  widgets.map((widget) => {
    const registryEntry = getDashboardWidgetRegistryEntry(widget.id, zone, registry);
    if (!registryEntry) {
      return widget;
    }

    return {
      ...widget,
      owner: registryEntry.owner,
      drilldownUrl: registryEntry.drilldownUrl,
      requiredPermissions: registryEntry.requiredPermissions,
    };
  });

export function enrichDashboardDataFromRegistry(
  data: DashboardDataContract,
  registry: DashboardWidgetRegistry = dashboardWidgetRegistry
): DashboardDataContract {
  return {
    ...data,
    kpiCards: enrichWidgetsFromRegistry(data.kpiCards, DASHBOARD_ZONE_KEYS.kpis, registry),
    actionItems: enrichWidgetsFromRegistry<DashboardActionItem>(
      data.actionItems,
      DASHBOARD_ZONE_KEYS.actions,
      registry
    ),
    riskAlerts: enrichWidgetsFromRegistry<DashboardActionItem>(
      data.riskAlerts,
      DASHBOARD_ZONE_KEYS.risks,
      registry
    ),
    calendarItems: enrichWidgetsFromRegistry<DashboardActionItem>(
      data.calendarItems,
      DASHBOARD_ZONE_KEYS.calendar,
      registry
    ),
    moduleSnapshots: enrichWidgetsFromRegistry<DashboardModuleSnapshot>(
      data.moduleSnapshots,
      DASHBOARD_ZONE_KEYS.modules,
      registry
    ),
    announcements: enrichWidgetsFromRegistry<DashboardActionItem>(
      data.announcements,
      DASHBOARD_ZONE_KEYS.announcements,
      registry
    ),
  };
}

export type DashboardRegistryCoverage = Partial<Record<DashboardZoneKey, string[]>>;

export const buildMissingDashboardRegistryCoverage = (
  data: DashboardDataContract
): DashboardRegistryCoverage => ({
  kpis: data.kpiCards
    .filter((widget) => !isRegisteredDashboardWidget(widget.id, DASHBOARD_ZONE_KEYS.kpis))
    .map((widget) => widget.id),
  actions: data.actionItems
    .filter((widget) => !isRegisteredDashboardWidget(widget.id, DASHBOARD_ZONE_KEYS.actions))
    .map((widget) => widget.id),
  risks: data.riskAlerts
    .filter((widget) => !isRegisteredDashboardWidget(widget.id, DASHBOARD_ZONE_KEYS.risks))
    .map((widget) => widget.id),
  modules: data.moduleSnapshots
    .filter((widget) => !isRegisteredDashboardWidget(widget.id, DASHBOARD_ZONE_KEYS.modules))
    .map((widget) => widget.id),
  calendar: data.calendarItems
    .filter((widget) => !isRegisteredDashboardWidget(widget.id, DASHBOARD_ZONE_KEYS.calendar))
    .map((widget) => widget.id),
  announcements: data.announcements
    .filter((widget) => !isRegisteredDashboardWidget(widget.id, DASHBOARD_ZONE_KEYS.announcements))
    .map((widget) => widget.id),
});
