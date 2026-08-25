import type { HRDashboardSummary } from 'src/redux/hr/hrDashboardApi';

import { fNumber, fPercent } from 'src/utils/format-number';

export type HrDashboardMetric = {
  id: 'active-staff' | 'attendance-rate' | 'pending-leave' | 'payroll-status';
  label: string;
  value: string;
  helper: string;
  icon: string;
  href?: string;
};

export type HrDashboardMetricLinks = Partial<Record<HrDashboardMetric['id'], string>>;

export type HrDashboardDisplayPermissions = {
  canViewEmployees: boolean;
  canViewAttendance: boolean;
  canApproveLeave: boolean;
  canRunPayroll: boolean;
  canViewSalaryStructures: boolean;
  canViewReports: boolean;
};

export const clampPercentage = (value?: number | null) => Math.min(100, Math.max(0, value || 0));

export const getPercentage = (value: number, total: number) =>
  total > 0 ? clampPercentage(Math.round((value / total) * 100)) : 0;

export const getPayrollStatus = (payroll: HRDashboardSummary['payroll']) => {
  if (payroll.canLock) return 'Ready to lock';
  if (payroll.canPreview) return 'Needs review';
  return 'Setup required';
};

export const getPayrollProgress = (payroll: HRDashboardSummary['payroll']) =>
  getPercentage(payroll.reviewedCount + payroll.lockedCount, payroll.employeeCount);

export const buildHrDashboardMetrics = (
  summary: HRDashboardSummary,
  links: HrDashboardMetricLinks = {}
): HrDashboardMetric[] => [
  {
    id: 'active-staff',
    label: 'Active Staff',
    value: fNumber(summary.workforce.totalActiveStaff),
    helper: `${fNumber(summary.workforce.newJoinersThisMonth)} joined this month`,
    icon: 'solar:users-group-rounded-linear',
    href: links['active-staff'],
  },
  {
    id: 'attendance-rate',
    label: 'Attendance Rate',
    value: fPercent(clampPercentage(summary.attendanceToday.attendanceRate)),
    helper: `${fNumber(summary.attendanceToday.missingAttendance)} missing attendance`,
    icon: 'solar:calendar-mark-linear',
    href: links['attendance-rate'],
  },
  {
    id: 'pending-leave',
    label: 'Pending Leave',
    value: fNumber(summary.leave.pending),
    helper: `${fNumber(summary.leave.approved)} approved`,
    icon: 'solar:clipboard-list-linear',
    href: links['pending-leave'],
  },
  {
    id: 'payroll-status',
    label: 'Payroll Status',
    value: getPayrollStatus(summary.payroll),
    helper: `${fNumber(getPayrollProgress(summary.payroll))}% reviewed`,
    icon: 'solar:wallet-money-linear',
    href: links['payroll-status'],
  },
];
