import { it, expect, describe } from 'vitest';

import {
  formatHolidayRange,
  formatUpcomingHolidayDate,
  formatEmployeeLeaveBalance,
  employeeDashboardStatusCopy,
  buildEmployeeAttendanceChart,
  findEmployeeDashboardHoliday,
} from './employee-dashboard-utils';

const dashboard = {
  employeeId: 'employee-1',
  date: '2026-07-26',
  todayStatus: 'Present' as const,
  attendancePercentage: 92.5,
  recordedAttendanceDays: 20,
  leaveBalanceDays: 7.5,
  hasUnlimitedLeave: false,
  isLeaveBalanceAvailable: true,
  pendingLeaveRequests: 1,
  attendanceDays: [],
  holidays: [],
  attendanceTrend: [
    {
      month: '2026-06',
      present: 18,
      halfDay: 1,
      absent: 2,
      halfDayLeave: 1,
      fullDayLeave: 1,
    },
    {
      month: '2026-07',
      present: 20,
      halfDay: 0,
      absent: 1,
      halfDayLeave: 0,
      fullDayLeave: 2,
    },
  ],
};

describe('employee dashboard presentation', () => {
  it('formats finite, unlimited, and unavailable leave balances honestly', () => {
    expect(formatEmployeeLeaveBalance(dashboard)).toBe('7.5');
    expect(
      formatEmployeeLeaveBalance({
        ...dashboard,
        leaveBalanceDays: null,
        hasUnlimitedLeave: true,
      })
    ).toBe('Unlimited');
    expect(
      formatEmployeeLeaveBalance({
        ...dashboard,
        isLeaveBalanceAvailable: false,
      })
    ).toBe('Not set');
  });

  it('builds chart series from the API months without sample values', () => {
    expect(buildEmployeeAttendanceChart(dashboard)).toEqual({
      categories: ["Jun '26", "Jul '26"],
      series: [
        { name: 'Present', data: [18, 20] },
        { name: 'Half day', data: [1, 0] },
        { name: 'Absent', data: [2, 1] },
        { name: 'Half-day leave', data: [1, 0] },
        { name: 'Full-day leave', data: [1, 2] },
      ],
    });
  });

  it('keeps recorded absence distinct from approved leave', () => {
    expect(employeeDashboardStatusCopy.Absent.label).toBe('Absent');
    expect(employeeDashboardStatusCopy.HalfDayLeave.label).toBe('Half-day leave');
    expect(employeeDashboardStatusCopy.FullDayLeave.label).toBe('Full-day leave');
  });

  it('finds and formats single and multi-day holidays', () => {
    const holiday = {
      name: 'Summer break',
      fromDate: '2026-07-26',
      toDate: '2026-07-28',
    };

    expect(findEmployeeDashboardHoliday([holiday], '2026-07-27')).toEqual(holiday);
    expect(formatUpcomingHolidayDate(holiday, '2026-07-26')).toBe('Today');
    expect(formatHolidayRange(holiday)).toBe('26 Jul – 28 Jul 2026');
  });
});
