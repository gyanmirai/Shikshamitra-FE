import type { HRDashboardSummary } from 'src/redux/hr/hrDashboardApi';

import { it, expect, describe } from 'vitest';

import {
  getPayrollStatus,
  getPayrollProgress,
  buildHrDashboardMetrics,
} from './hr-dashboard-view-model';

const summary = {
  workforce: { totalActiveStaff: 126, newJoinersThisMonth: 4 },
  attendanceToday: { attendanceRate: 92.4, missingAttendance: 3 },
  leave: { pending: 7, approved: 12 },
  payroll: {
    canPreview: true,
    canLock: false,
    employeeCount: 120,
    reviewedCount: 80,
    lockedCount: 10,
  },
} as HRDashboardSummary;

describe('HR dashboard view model', () => {
  it('maps the four summary metrics in the required order with shared formatting', () => {
    const metrics = buildHrDashboardMetrics(summary, {
      'active-staff': '/hr/employee',
      'attendance-rate': '/hr/attendance-dashboard',
    });

    expect(metrics.map((metric) => metric.label)).toEqual([
      'Active Staff',
      'Attendance Rate',
      'Pending Leave',
      'Payroll Status',
    ]);
    expect(metrics[0]).toMatchObject({ value: '126', href: '/hr/employee' });
    expect(metrics[1]).toMatchObject({ value: '92.4%', href: '/hr/attendance-dashboard' });
    expect(metrics[2]).toMatchObject({ value: '7', href: undefined });
    expect(metrics[3]).toMatchObject({ value: 'Needs review', helper: '75% reviewed' });
  });

  it('derives payroll status and progress without exceeding valid percentages', () => {
    expect(getPayrollStatus({ ...summary.payroll, canLock: true })).toBe('Ready to lock');
    expect(getPayrollStatus({ ...summary.payroll, canPreview: false })).toBe('Setup required');
    expect(getPayrollProgress({ ...summary.payroll, reviewedCount: 130 })).toBe(100);
    expect(getPayrollProgress({ ...summary.payroll, employeeCount: 0 })).toBe(0);
  });
});
