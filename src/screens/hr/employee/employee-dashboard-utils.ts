import type {
  EmployeeDashboardData,
  EmployeeDashboardStatus,
  EmployeeDashboardHoliday,
  EmployeeDashboardAttendanceDay,
} from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import { fNumber } from 'src/utils/format-number';

export const formatDashboardDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-IN', { ...options, timeZone: 'UTC' }).format(
    new Date(`${value.slice(0, 10)}T00:00:00Z`)
  );

export const employeeDashboardStatusCopy: Record<
  EmployeeDashboardStatus,
  { label: string; color: string; background: string }
> = {
  Present: { label: 'Present', color: 'success.main', background: 'success.lighter' },
  HalfDay: { label: 'Half day', color: 'warning.main', background: 'warning.lighter' },
  Absent: { label: 'Absent', color: 'error.main', background: 'error.lighter' },
  HalfDayLeave: {
    label: 'Half-day leave',
    color: 'secondary.main',
    background: 'secondary.lighter',
  },
  FullDayLeave: {
    label: 'Full-day leave',
    color: 'info.main',
    background: 'info.lighter',
  },
  Holiday: { label: 'Holiday', color: 'secondary.main', background: 'secondary.lighter' },
  WeeklyOff: { label: 'Weekly off', color: 'info.main', background: 'info.lighter' },
  NotMarked: { label: 'Not marked', color: 'text.secondary', background: 'action.hover' },
  NotAvailable: { label: 'Not available', color: 'text.secondary', background: 'action.hover' },
};

export const formatEmployeeLeaveBalance = (data: EmployeeDashboardData): string => {
  if (!data.isLeaveBalanceAvailable) return 'Not set';
  if (data.hasUnlimitedLeave && data.leaveBalanceDays == null) return 'Unlimited';
  if (data.leaveBalanceDays == null) return '-';

  return fNumber(data.leaveBalanceDays, { maximumFractionDigits: 1 });
};

export const describeEmployeeLeaveBalance = (data: EmployeeDashboardData): string => {
  if (!data.isLeaveBalanceAvailable) return 'No active leave policy';
  if (data.hasUnlimitedLeave && data.leaveBalanceDays != null)
    return 'Days available, plus unlimited leave';
  if (data.hasUnlimitedLeave) return 'Unlimited leave entitlement';
  if (data.leaveBalanceDays == null) return 'Balance unavailable';
  return 'Days currently available';
};

export const hasEmployeeAttendanceTrend = (data: EmployeeDashboardData): boolean =>
  data.attendanceTrend.some((month) =>
    [month.present, month.halfDay, month.absent, month.halfDayLeave, month.fullDayLeave].some(
      (count) => count > 0
    )
  );

export const getEmployeeCalendarStart = (data: EmployeeDashboardData): string => {
  const months = data.attendanceTrend.map((month) => `${month.month}-01`);
  const days = data.attendanceDays.map((day) => day.date.slice(0, 10));
  return [...months, ...days, data.date.slice(0, 10)].sort()[0];
};

export const formatUpcomingHolidayDate = (
  holiday: EmployeeDashboardHoliday | null | undefined,
  today: string
): string => {
  if (!holiday) return 'None';
  const date = dayjs(today);
  if (!date.isBefore(holiday.fromDate, 'day') && !date.isAfter(holiday.toDate, 'day')) {
    return 'Today';
  }
  return dayjs(holiday.fromDate).format('DD MMM');
};

export const formatHolidayRange = (holiday: EmployeeDashboardHoliday): string => {
  const from = dayjs(holiday.fromDate);
  const to = dayjs(holiday.toDate);
  return from.isSame(to, 'day')
    ? from.format('ddd, DD MMM YYYY')
    : `${from.format('DD MMM')} – ${to.format('DD MMM YYYY')}`;
};

export const buildEmployeeAttendanceDayLookup = (
  days: EmployeeDashboardAttendanceDay[]
): Map<string, EmployeeDashboardAttendanceDay> =>
  new Map(days.map((day) => [dayjs(day.date).format('YYYY-MM-DD'), day]));

export const findEmployeeDashboardHoliday = (
  holidays: EmployeeDashboardHoliday[],
  date: string
): EmployeeDashboardHoliday | undefined =>
  holidays.find((holiday) => {
    const candidate = dayjs(date);
    return (
      !candidate.isBefore(holiday.fromDate, 'day') && !candidate.isAfter(holiday.toDate, 'day')
    );
  });

export const buildEmployeeAttendanceChart = (data: EmployeeDashboardData) => ({
  categories: data.attendanceTrend.map((month) => dayjs(`${month.month}-01`).format("MMM 'YY")),
  series: [
    { name: 'Present', data: data.attendanceTrend.map((month) => month.present) },
    { name: 'Half day', data: data.attendanceTrend.map((month) => month.halfDay) },
    { name: 'Absent', data: data.attendanceTrend.map((month) => month.absent) },
    { name: 'Half-day leave', data: data.attendanceTrend.map((month) => month.halfDayLeave) },
    { name: 'Full-day leave', data: data.attendanceTrend.map((month) => month.fullDayLeave) },
  ],
});
