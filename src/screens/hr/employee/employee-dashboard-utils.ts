import type {
  EmployeeDashboardData,
  EmployeeDashboardStatus,
  EmployeeDashboardHoliday,
  EmployeeDashboardAttendanceDay,
} from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';

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
  if (data.leaveBalanceDays == null) return '—';

  const formatted = Number.isInteger(data.leaveBalanceDays)
    ? String(data.leaveBalanceDays)
    : data.leaveBalanceDays.toFixed(1);
  return data.hasUnlimitedLeave ? `${formatted}+` : formatted;
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
