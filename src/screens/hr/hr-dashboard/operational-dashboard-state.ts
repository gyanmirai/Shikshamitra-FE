import type { LabelColor } from 'src/components/label/types';
import type {
  DailyStaffStatus,
  OperationalOverview,
  DashboardSectionState,
} from 'src/redux/hr/hrOperationalDashboardApi';

import { hrPaths, hrPermissions } from 'src/constants/hr-menus';

export const dashboardPermissions = {
  view: hrPermissions.dashboardView,
  attendance: `${hrPermissions.attendance.dashboard}.View`,
  staff: `${hrPermissions.attendance.attendanceTracking}.View`,
  employees: `${hrPermissions.employee.list}.View`,
  markAttendance: `${hrPermissions.attendance.markAttendance}.Add`,
  markAttendanceView: `${hrPermissions.attendance.markAttendance}.View`,
  leave: `${hrPermissions.leaveManagement.leaveCenter}.View`,
  payroll: `${hrPermissions.payroll.dashboard}.View`,
  openPayroll: `${hrPermissions.payroll.runPayroll}.View`,
  onboarding: `${hrPermissions.employee.onboarding}.View`,
  appraisals: 'HR.PerformanceManagement.View',
  legacyAppraisals: hrPermissions.professionalManagement,
  addEmployees: `${hrPermissions.employee.list}.Add`,
  reports: hrPermissions.reportActions.view,
} as const;

export const dailyStatus: Record<DailyStaffStatus, { label: string; color: LabelColor }> = {
  Present: { label: 'Present', color: 'success' },
  Absent: { label: 'Absent', color: 'error' },
  OnLeave: { label: 'On leave', color: 'info' },
  HalfDay: { label: 'Half day', color: 'warning' },
  NotMarked: { label: 'Not marked', color: 'default' },
  NotScheduled: { label: 'Not scheduled', color: 'default' },
  NeedsSetup: { label: 'Needs setup', color: 'warning' },
};

export const indiaToday = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};
export const formatSchoolDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00+05:30`));
export const formatSchoolTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
export const formatCount = (value: number) => new Intl.NumberFormat('en-IN').format(value);

export function getModulePriorityCue(
  module: 'leave' | 'appraisal',
  state: DashboardSectionState | undefined,
  count: number | undefined
): { label: string; color: LabelColor } | null {
  if (state !== 'Available' || count === undefined || count <= 0) return null;
  return module === 'leave'
    ? { label: 'Awaiting decision', color: 'info' }
    : { label: `${formatCount(count)} overdue`, color: 'warning' };
}

export function getPayrollGuidance(
  state: DashboardSectionState | undefined,
  payroll: OperationalOverview['payroll']
): { message: string; color: LabelColor } | null {
  if (state !== 'Available' || !payroll) return null;
  if (payroll.savedStaffCount === 0)
    return { message: 'No saved payroll records for this month.', color: 'default' };
  if (payroll.pendingCount > 0)
    return {
      message: `${formatCount(payroll.pendingCount)} staff ${payroll.pendingCount === 1 ? 'member' : 'members'} awaiting review.`,
      color: 'info',
    };
  if (payroll.lockedCount === payroll.savedStaffCount)
    return { message: 'All saved records are locked.', color: 'default' };
  return {
    message: `${formatCount(payroll.reviewedCount)} reviewed ${payroll.reviewedCount === 1 ? 'record remains' : 'records remain'} unlocked.`,
    color: 'default',
  };
}
export const previousSchoolDay = (date: string) => {
  const day = new Date(`${date}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
};
export const isDashboardAccessError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  (error.status === 401 || error.status === 403);
export const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export const parseDashboardState = (params: URLSearchParams, today = indiaToday()) => {
  const requestedDate = params.get('date') || today;
  const parsedDate = new Date(`${requestedDate}T00:00:00Z`);
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === requestedDate &&
    requestedDate <= today
      ? requestedDate
      : today;
  return { date };
};

export const obsoleteDashboardKeys = [
  'group',
  'stage',
  'department',
  'shift',
  'search',
  'status',
  'sort',
  'page',
  'pageSize',
  'trendView',
];

export const attendanceHref = (employeeId: string, date: string) =>
  `${hrPaths.attendance.attendanceTracking}?employeeId=${encodeURIComponent(employeeId)}&startDate=${date}&endDate=${date}`;
