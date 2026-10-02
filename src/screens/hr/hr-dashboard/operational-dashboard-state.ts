import type { LabelColor } from 'src/components/label/types';
import type { DailyStaffStatus } from 'src/redux/hr/hrOperationalDashboardApi';

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
  const selectedStatus = params.get('status') || '';
  const status =
    selectedStatus === 'Review' || Object.hasOwn(dailyStatus, selectedStatus) ? selectedStatus : '';
  const size = Number(params.get('pageSize') || 25);
  const page = Number(params.get('page') || 1);
  const requestedSort = params.get('sort') || 'name';
  return {
    date,
    status: status as DailyStaffStatus | 'Review' | '',
    group: ['teaching', 'nonTeaching'].includes(params.get('group') || '')
      ? params.get('group')!
      : '',
    stage: params.get('stage') || '',
    department: params.get('department') || '',
    shift: params.get('shift') || '',
    search: (params.get('search') || '').slice(0, 150),
    sorting: ['name', 'name desc', 'status', 'status desc'].includes(requestedSort)
      ? requestedSort
      : 'name',
    pageSize: [25, 50, 100].includes(size) ? size : 25,
    page: Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1,
  };
};

export const attendanceHref = (employeeId: string, date: string) =>
  `${hrPaths.attendance.attendanceTracking}?employeeId=${encodeURIComponent(employeeId)}&startDate=${date}&endDate=${date}`;
