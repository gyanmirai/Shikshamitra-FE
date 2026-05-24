'use client';

import type { RootState } from 'src/redux/store';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  PolicyStatus,
  HrPolicyType,
  PayrollPolicy,
  HrPolicyVersion,
  AttendancePolicy,
  HrPolicyAssignment,
  WorkCalendarPolicy,
  WorkCalendarHoliday,
  HrPolicyImpactPreview,
  HrPolicyAssignmentConflict,
} from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { toast } from 'src/components/snackbar';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetGroupsQuery } from 'src/redux/calendar/GroupManagement/groupManagementApi';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Paper,
  Alert,
  Stack,
  Table,
  Drawer,
  Dialog,
  Button,
  Select,
  Switch,
  Tooltip,
  Divider,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  Autocomplete,
  DialogActions,
  DialogContent,
  InputAdornment,
  TableContainer,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetPolicyVersionsQuery,
  useGetPayrollPoliciesQuery,
  useGetAttendancePoliciesQuery,
  useClonePayrollPolicyMutation,
  useGetPolicyAuditSummaryQuery,
  useComparePolicyVersionsQuery,
  useGetHrEntityAuditEventsQuery,
  useGetHrPolicyAssignmentsQuery,
  useCreatePayrollPolicyMutation,
  usePreviewPolicyImpactMutation,
  useGetWorkCalendarPoliciesQuery,
  useCloneAttendancePolicyMutation,
  useCreateAttendancePolicyMutation,
  useGetPolicyAssignmentPreviewQuery,
  useCloneWorkCalendarPolicyMutation,
  useCreateWorkCalendarPolicyMutation,
  useRestorePolicyVersionDraftMutation,
  useGetPolicyHolidayImpactPreviewQuery,
  useUpdatePayrollPolicyWithTokenMutation,
  usePreviewPolicyAssignmentImpactMutation,
  useLazyGetWorkCalendarPolicyHolidaysQuery,
  useUpdateAttendancePolicyWithTokenMutation,
  useSetDefaultPayrollPolicyWithTokenMutation,
  useCreateHrPolicyAssignmentWithTokenMutation,
  useUpdateHrPolicyAssignmentWithTokenMutation,
  useUpdateWorkCalendarPolicyWithTokenMutation,
  useSetDefaultAttendancePolicyWithTokenMutation,
  useLazyGetWorkCalendarHolidayImportPreviewQuery,
} from 'src/redux/hr/hr-policy-api';

type WorkspaceTab =
  | 'calendars'
  | 'payroll'
  | 'attendance'
  | 'assignments'
  | 'holiday'
  | 'effective';
type PolicyAssignmentTargetType = 'employee' | 'group';
type DrawerKind = 'calendar' | 'payroll' | 'attendance' | 'assignment';

type HRPolicyWorkspaceProps = {
  focus?: WorkspaceTab;
};

type DrawerState = {
  kind: DrawerKind;
  mode: 'create' | 'edit';
  item?: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy | HrPolicyAssignment;
} | null;

type PendingImpactAction = {
  label: string;
  run: (token?: string) => Promise<void>;
} | null;

type AuditTarget = {
  entityType: string;
  entityId: string;
  title: string;
  policyType?: HrPolicyType;
  policyId?: string;
} | null;

type VersionTarget = {
  policyType: HrPolicyType;
  policyId: string;
  policyName: string;
} | null;

type WorkCalendarForm = {
  name: string;
  status: PolicyStatus;
  effectiveFrom: string;
  effectiveTo: string;
  weeklyOffPattern: string;
  customWeeklyOffs: number[];
  holidaySyncMode: string;
  holidays: WorkCalendarHoliday[];
};

type ManualHolidayForm = {
  holidayName: string;
  fromDate: string;
  toDate: string;
  notes: string;
};

type HolidayReviewFilter = 'all' | 'included' | 'removed' | 'central_calendar' | 'manual';

type PayrollForm = {
  name: string;
  status: PolicyStatus;
  workCalendarPolicyId: string;
  isDefault: boolean;
  dayCalculationType: string;
  manualMonthDays: Record<string, string>;
  saturdayWorkPolicy: string;
};

type AttendanceForm = {
  name: string;
  status: PolicyStatus;
  workCalendarPolicyId: string;
  isDefault: boolean;
  fullDayThresholdPercentage: string;
  halfDayThresholdPercentage: string;
  absentThresholdPercentage: string;
  missingPunchBehavior: string;
  manualCorrectionAllowed: boolean;
  graceTime: string;
  maxLateAllowedPerMonth: string;
  penaltyType: string;
  penaltyCountThreshold: string;
  earlyExitEnabled: boolean;
  earlyExitGraceTime: string;
  overtimeEnabled: boolean;
  overtimeRate: string;
  minOvertimeMinutes: string;
  holidayWorkBehavior: string;
  sandwichRuleEnabled: boolean;
  payrollPreviewEnabled: boolean;
};

type AttendanceAdvancedKey =
  | 'absentThresholdPercentage'
  | 'graceTime'
  | 'maxLateAllowedPerMonth'
  | 'penaltyType'
  | 'penaltyCountThreshold'
  | 'earlyExitEnabled'
  | 'earlyExitGraceTime'
  | 'overtimeEnabled'
  | 'overtimeRate'
  | 'minOvertimeMinutes'
  | 'holidayWorkBehavior'
  | 'sandwichRuleEnabled'
  | 'payrollPreviewEnabled';

type AssignmentForm = {
  targetType: PolicyAssignmentTargetType;
  targetKey: string;
  targetDisplayName: string;
  payrollPolicyId: string;
  attendancePolicyId: string;
  effectiveFrom: string;
  effectiveTo: string;
  priority: string;
  assignmentReason: string;
  isActive: boolean;
};

type AssignmentFilters = {
  search: string;
  targetType: 'all' | PolicyAssignmentTargetType;
  status: 'all' | 'active' | 'inactive';
  payrollPolicyId: string;
  attendancePolicyId: string;
  activeOnDate: string;
  effectiveFrom: string;
  effectiveTo: string;
};

type LookupOption = {
  id?: string;
  name?: string;
  displayName?: string;
  employeeName?: string;
  fullName?: string;
  shiftName?: string;
  userName?: string;
  department?: string | null;
  organizationNames?: string[];
  organizations?: Array<{ id?: string; name?: string | null }>;
  memberCount?: number;
  employeeCount?: number;
};

type AssignmentTableRow = {
  id: string;
  assignment: HrPolicyAssignment;
  target: string;
  targetKey: string;
  organization: string;
  sourceType: string;
  payrollPolicyName: string;
  attendancePolicyName: string;
  effective: string;
  priority: number;
  status: string;
  reason: string;
};

const tabs: Array<{ value: WorkspaceTab; label: string; icon: string; disabled?: boolean }> = [
  { value: 'calendars', label: 'Work Calendars', icon: 'mdi:calendar-month-outline' },
  { value: 'payroll', label: 'Payroll Policies', icon: 'mdi:cash-sync' },
  { value: 'attendance', label: 'Attendance Policies', icon: 'mdi:account-clock-outline' },
  { value: 'assignments', label: 'Assignments', icon: 'mdi:account-switch-outline' },
  {
    value: 'holiday',
    label: 'Holiday Impact',
    icon: 'mdi:calendar-search-outline',
    disabled: true,
  },
  { value: 'effective', label: 'Effective Preview', icon: 'mdi:source-branch-check' },
];

const findTab = (value?: WorkspaceTab | null) => tabs.find((item) => item.value === value);

const isDisabledTab = (value?: WorkspaceTab | null) => Boolean(findTab(value)?.disabled);

const resolveInitialTab = (focus?: WorkspaceTab, queryTab?: WorkspaceTab | null): WorkspaceTab => {
  if (focus && findTab(focus) && !isDisabledTab(focus)) return focus;
  if (queryTab && findTab(queryTab) && !isDisabledTab(queryTab)) return queryTab;
  return 'calendars';
};

const weekdayOptions = [
  { value: 0, short: 'Sun', label: 'Sunday' },
  { value: 1, short: 'Mon', label: 'Monday' },
  { value: 2, short: 'Tue', label: 'Tuesday' },
  { value: 3, short: 'Wed', label: 'Wednesday' },
  { value: 4, short: 'Thu', label: 'Thursday' },
  { value: 5, short: 'Fri', label: 'Friday' },
  { value: 6, short: 'Sat', label: 'Saturday' },
];

const weeklyRuleOptions = [
  { value: 'saturday_sunday', label: 'Saturday + Sunday Off' },
  { value: 'sunday', label: 'Sunday Off' },
  { value: 'no_weekly_off', label: 'No Weekly Off' },
  { value: 'custom', label: 'Custom' },
];

const payrollDayCalculationOptions = [
  {
    value: 'working-days',
    label: 'Working Days',
    description: 'Uses work calendar working days.',
  },
  {
    value: 'total-month-days',
    label: 'Total Month Days',
    description: 'Uses every calendar day in the month.',
  },
  {
    value: 'manual-days',
    label: 'Manual Days',
    description: 'Uses fixed HR-entered basis days.',
  },
];

const payrollSaturdayPolicyOptions = [
  {
    value: 'full-day',
    label: 'Full',
    description: 'Each working Saturday counts as 1 day.',
  },
  {
    value: 'half-day',
    label: 'Half',
    description: 'Each working Saturday counts as 0.5 day.',
  },
  {
    value: 'off',
    label: 'Off',
    description: 'Saturdays do not add working units.',
  },
];

const defaultCalendarForm = (start?: string | null, end?: string | null): WorkCalendarForm => ({
  name: '',
  status: 'active',
  effectiveFrom: toDateInput(start),
  effectiveTo: toDateInput(end),
  weeklyOffPattern: 'saturday_sunday',
  customWeeklyOffs: [],
  holidaySyncMode: 'snapshot',
  holidays: [],
});

const defaultPayrollForm = (calendarId = ''): PayrollForm => ({
  name: '',
  status: 'active',
  workCalendarPolicyId: calendarId,
  isDefault: false,
  dayCalculationType: 'working-days',
  manualMonthDays: {},
  saturdayWorkPolicy: 'full-day',
});

const defaultAttendanceForm = (calendarId = ''): AttendanceForm => ({
  name: '',
  status: 'active',
  workCalendarPolicyId: calendarId,
  isDefault: false,
  fullDayThresholdPercentage: '75',
  halfDayThresholdPercentage: '50',
  absentThresholdPercentage: '0',
  missingPunchBehavior: 'requires_review',
  manualCorrectionAllowed: true,
  graceTime: '0',
  maxLateAllowedPerMonth: '0',
  penaltyType: 'none',
  penaltyCountThreshold: '0',
  earlyExitEnabled: false,
  earlyExitGraceTime: '0',
  overtimeEnabled: false,
  overtimeRate: '',
  minOvertimeMinutes: '',
  holidayWorkBehavior: 'comp_off',
  sandwichRuleEnabled: false,
  payrollPreviewEnabled: true,
});

const attendanceAdvancedKeys: AttendanceAdvancedKey[] = [
  'absentThresholdPercentage',
  'graceTime',
  'maxLateAllowedPerMonth',
  'penaltyType',
  'penaltyCountThreshold',
  'earlyExitEnabled',
  'earlyExitGraceTime',
  'overtimeEnabled',
  'overtimeRate',
  'minOvertimeMinutes',
  'holidayWorkBehavior',
  'sandwichRuleEnabled',
  'payrollPreviewEnabled',
];

function applyAttendanceAdvancedDefaults(form: AttendanceForm): AttendanceForm {
  const defaults = defaultAttendanceForm(form.workCalendarPolicyId);
  return attendanceAdvancedKeys.reduce(
    (current, key) => ({ ...current, [key]: defaults[key] }),
    form
  );
}

function hasCustomAttendanceAdvancedSettings(form: AttendanceForm) {
  const defaults = defaultAttendanceForm(form.workCalendarPolicyId);
  return attendanceAdvancedKeys.some((key) => form[key] !== defaults[key]);
}

const defaultAssignmentForm = (start?: string | null): AssignmentForm => ({
  targetType: 'employee',
  targetKey: '',
  targetDisplayName: '',
  payrollPolicyId: '',
  attendancePolicyId: '',
  effectiveFrom: toDateInput(start) || dayjs().format('YYYY-MM-DD'),
  effectiveTo: '',
  priority: '0',
  assignmentReason: '',
  isActive: true,
});

const defaultAssignmentFilters = (): AssignmentFilters => ({
  search: '',
  targetType: 'all',
  status: 'all',
  payrollPolicyId: '',
  attendancePolicyId: '',
  activeOnDate: '',
  effectiveFrom: '',
  effectiveTo: '',
});

function toDateInput(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '';
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('DD MMM YYYY') : '-';
}

function formatRange(from?: string | null, to?: string | null) {
  return `${formatDate(from)} - ${formatDate(to)}`;
}

function isDateWithinRange(date: string, from?: string | null, to?: string | null) {
  const target = dayjs(date);
  if (!date || !target.isValid()) return true;
  const start = from ? dayjs(from) : null;
  const end = to ? dayjs(to) : null;
  return (
    (!start || target.isSame(start, 'day') || target.isAfter(start, 'day')) &&
    (!end || target.isSame(end, 'day') || target.isBefore(end, 'day'))
  );
}

function overlapsDateRange(item: HrPolicyAssignment, from: string, to: string) {
  const filterStart = from ? dayjs(from) : null;
  const filterEnd = to ? dayjs(to) : null;
  const assignmentStart = dayjs(item.effectiveFrom);
  const assignmentEnd = item.effectiveTo ? dayjs(item.effectiveTo) : null;

  if (filterStart && assignmentEnd && assignmentEnd.isBefore(filterStart, 'day')) return false;
  if (filterEnd && assignmentStart.isAfter(filterEnd, 'day')) return false;
  return true;
}

function getHolidayFromDate(item: WorkCalendarHoliday) {
  return item.fromDate || item.date;
}

function getHolidayToDate(item: WorkCalendarHoliday) {
  return item.toDate || item.fromDate || item.date;
}

function getHolidayDayCount(item: WorkCalendarHoliday) {
  if (typeof item.dayCount === 'number' && item.dayCount > 0) return item.dayCount;
  const from = dayjs(getHolidayFromDate(item));
  const to = dayjs(getHolidayToDate(item));
  if (!from.isValid() || !to.isValid()) return 1;
  return Math.max(1, to.diff(from, 'day') + 1);
}

function formatHolidayDateRange(item: WorkCalendarHoliday) {
  const from = getHolidayFromDate(item);
  const to = getHolidayToDate(item);
  if (!to || dayjs(from).isSame(dayjs(to), 'day')) return formatDate(from);
  return formatRange(from, to);
}

function getItems<T extends LookupOption>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }
  if (
    data &&
    typeof data === 'object' &&
    'result' in data &&
    Array.isArray((data as { result?: unknown }).result)
  ) {
    return (data as { result: T[] }).result;
  }
  return [];
}

function optionLabel(item: LookupOption | null | undefined) {
  return (
    item?.name ||
    item?.displayName ||
    item?.employeeName ||
    item?.fullName ||
    item?.shiftName ||
    item?.userName ||
    ''
  );
}

function getLookupOrganizationNames(item: LookupOption | null | undefined) {
  if (!item) return [];
  if (Array.isArray(item.organizationNames) && item.organizationNames.length > 0) {
    return item.organizationNames.filter(Boolean);
  }
  if (Array.isArray(item.organizations)) {
    return item.organizations.map((organization) => organization.name).filter(Boolean) as string[];
  }
  return [];
}

function getErrorMessage(error: unknown, fallback: string) {
  const value = error as
    | { data?: { error?: { message?: string }; message?: string }; error?: string }
    | undefined;
  return value?.data?.error?.message || value?.data?.message || value?.error || fallback;
}

function getAssignmentConflict(error: unknown): HrPolicyAssignmentConflict | null {
  const value = error as
    | { data?: { error?: { data?: { conflict?: unknown } }; conflict?: unknown } }
    | undefined;
  const raw = value?.data?.error?.data?.conflict || value?.data?.conflict;
  if (!raw) return null;
  if (typeof raw === 'object') return raw as HrPolicyAssignmentConflict;
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as HrPolicyAssignmentConflict;
  } catch {
    return null;
  }
}

function numberOrNull(value: string) {
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePayrollDayCalculationType(value?: string | null) {
  if (value === 'calendar-days') return 'total-month-days';
  if (value === 'manual') return 'manual-days';
  if (value === 'total-month-days' || value === 'manual-days' || value === 'working-days')
    return value;
  return 'working-days';
}

function isValidManualDayCount(value: number | null) {
  return value !== null && Number.isInteger(value) && value >= 1 && value <= 31;
}

function sortWeekDays(days: number[]) {
  return [...new Set(days)]
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)
    .sort((left, right) => left - right);
}

function formatWeekDays(days: number[]) {
  const cleanDays = sortWeekDays(days);
  if (!cleanDays.length) return 'None';
  return cleanDays
    .map((day) => weekdayOptions.find((item) => item.value === day)?.short)
    .filter(Boolean)
    .join(', ');
}

function normalizeWeeklyRule(pattern: string, customWeeklyOffs: number[]) {
  if (pattern === 'sunday_only') return 'sunday';
  if (pattern === 'custom' && sortWeekDays(customWeeklyOffs).length === 0) return 'no_weekly_off';
  return pattern || 'saturday_sunday';
}

function getWeeklyOffsForRule(pattern: string, customWeeklyOffs: number[]) {
  if (pattern === 'saturday_sunday') return [0, 6];
  if (pattern === 'sunday' || pattern === 'sunday_only') return [0];
  if (pattern === 'no_weekly_off') return [];
  return sortWeekDays(customWeeklyOffs);
}

function getWorkingDaysForRule(pattern: string, customWeeklyOffs: number[]) {
  const weeklyOffs = new Set(getWeeklyOffsForRule(pattern, customWeeklyOffs));
  return weekdayOptions.map((item) => item.value).filter((day) => !weeklyOffs.has(day));
}

function toApiWeeklyPattern(pattern: string) {
  if (pattern === 'no_weekly_off') return 'custom';
  if (pattern === 'sunday_only') return 'sunday';
  return pattern;
}

function getCalendarWeeklyRuleLabel(item: WorkCalendarPolicy) {
  const pattern = normalizeWeeklyRule(item.weeklyOffPattern, item.customWeeklyOffs || []);
  if (pattern === 'saturday_sunday') return 'Saturday + Sunday Off';
  if (pattern === 'sunday') return 'Sunday Off';
  if (pattern === 'no_weekly_off') return 'No Weekly Off';
  return `Custom: ${formatWeekDays(item.customWeeklyOffs || [])}`;
}

function getHolidaySummary(holidays: WorkCalendarHoliday[] = []) {
  return {
    total: holidays.length,
    included: holidays.filter((item) => item.isIncluded).length,
    removed: holidays.filter((item) => !item.isIncluded).length,
    manual: holidays.filter((item) => item.source === 'manual').length,
    central: holidays.filter((item) => item.source === 'central_calendar').length,
  };
}

function holidayRowKey(item: WorkCalendarHoliday) {
  const fromDate = dayjs(getHolidayFromDate(item)).format('YYYY-MM-DD');
  const toDate = dayjs(getHolidayToDate(item)).format('YYYY-MM-DD');
  return `${item.calendarHolidayId || item.source}-${fromDate}-${toDate}-${item.holidayName.trim().toLowerCase()}`;
}

function mergeHolidayRows(currentRows: WorkCalendarHoliday[], importedRows: WorkCalendarHoliday[]) {
  const existingKeys = new Set(currentRows.map(holidayRowKey));
  const additions = importedRows.filter((item) => !existingKeys.has(holidayRowKey(item)));
  return [...currentRows, ...additions].sort(
    (left, right) =>
      dayjs(getHolidayFromDate(left)).valueOf() - dayjs(getHolidayFromDate(right)).valueOf()
  );
}

function countNewHolidayRows(
  currentRows: WorkCalendarHoliday[],
  importedRows: WorkCalendarHoliday[]
) {
  const existingKeys = new Set(currentRows.map(holidayRowKey));
  return importedRows.filter((item) => !existingKeys.has(holidayRowKey(item))).length;
}

function isDateInsideRange(date: string, from?: string, to?: string) {
  const value = dayjs(date);
  if (!value.isValid()) return false;
  if (from && value.isBefore(dayjs(from), 'day')) return false;
  if (to && value.isAfter(dayjs(to), 'day')) return false;
  return true;
}

function isHolidayRangeInsideRange(fromDate: string, toDate: string, from?: string, to?: string) {
  return (
    isDateInsideRange(fromDate, from, to) &&
    isDateInsideRange(toDate, from, to) &&
    !dayjs(toDate).isBefore(dayjs(fromDate), 'day')
  );
}

function getHolidayMonthOptions(holidays: WorkCalendarHoliday[]) {
  return Array.from(
    new Set(holidays.map((holiday) => dayjs(getHolidayFromDate(holiday)).format('YYYY-MM')))
  )
    .filter((month) => month !== 'Invalid Date')
    .sort();
}

function formatBasisDays(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return '-';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getDateKey(value: dayjs.Dayjs) {
  return value.format('YYYY-MM-DD');
}

function getSaturdayUnit(policy: string) {
  if (policy === 'half-day') return 0.5;
  if (policy === 'off') return 0;
  return 1;
}

function getBaseWorkingUnit(date: dayjs.Dayjs, weeklyOffs: Set<number>, saturdayPolicy: string) {
  const day = date.day();
  if (weeklyOffs.has(day)) return 0;
  if (day === 6) return getSaturdayUnit(saturdayPolicy);
  return 1;
}

function getIncludedHolidayDateSet(
  fromDate: dayjs.Dayjs,
  toDate: dayjs.Dayjs,
  holidays: WorkCalendarHoliday[] = []
) {
  const dates = new Set<string>();
  holidays
    .filter((holiday) => holiday.isIncluded)
    .forEach((holiday) => {
      const holidayFrom = dayjs(getHolidayFromDate(holiday));
      const holidayTo = dayjs(getHolidayToDate(holiday));
      if (
        !holidayFrom.isValid() ||
        !holidayTo.isValid() ||
        holidayTo.isBefore(fromDate, 'day') ||
        holidayFrom.isAfter(toDate, 'day')
      ) {
        return;
      }
      let cursor = holidayFrom.isBefore(fromDate, 'day') ? fromDate : holidayFrom;
      const end = holidayTo.isAfter(toDate, 'day') ? toDate : holidayTo;
      while (!cursor.isAfter(end, 'day')) {
        dates.add(getDateKey(cursor));
        cursor = cursor.add(1, 'day');
      }
    });
  return dates;
}

function getAcademicYearMonthRanges(start?: string | null, end?: string | null) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  if (!startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate, 'day')) return [];
  const ranges: Array<{ monthStart: dayjs.Dayjs; fromDate: dayjs.Dayjs; toDate: dayjs.Dayjs }> = [];
  let cursor = startDate.startOf('month');
  while (!cursor.isAfter(endDate, 'month')) {
    const fromDate = cursor.isSame(startDate, 'month') ? startDate : cursor.startOf('month');
    const toDate = cursor.isSame(endDate, 'month') ? endDate : cursor.endOf('month');
    ranges.push({ monthStart: cursor, fromDate, toDate });
    cursor = cursor.add(1, 'month');
  }
  return ranges;
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function buildManualMonthDaysMap({
  academicYearStart,
  academicYearEnd,
  existing = {},
  fallbackDays,
}: {
  academicYearStart?: string | null;
  academicYearEnd?: string | null;
  existing?: Record<string, string>;
  fallbackDays?: number | null;
}) {
  return getAcademicYearMonthRanges(academicYearStart, academicYearEnd).reduce<
    Record<string, string>
  >((result, { monthStart }) => {
    const key = monthStart.format('YYYY-MM');
    result[key] = existing[key] ?? (fallbackDays == null ? '' : String(fallbackDays));
    return result;
  }, {});
}

function payrollManualMonthDaysToMap(
  items: Array<{ year: number; month: number; manualDays: number }> = []
) {
  return items.reduce<Record<string, string>>((result, item) => {
    result[getMonthKey(item.year, item.month)] = String(item.manualDays);
    return result;
  }, {});
}

function buildCalendarDaysMap(academicYearStart?: string | null, academicYearEnd?: string | null) {
  return getAcademicYearMonthRanges(academicYearStart, academicYearEnd).reduce<
    Record<string, string>
  >((result, { monthStart, fromDate, toDate }) => {
    result[monthStart.format('YYYY-MM')] = String(toDate.diff(fromDate, 'day') + 1);
    return result;
  }, {});
}

function buildManualMonthDaysPayload({
  academicYearStart,
  academicYearEnd,
  manualMonthDays,
}: {
  academicYearStart?: string | null;
  academicYearEnd?: string | null;
  manualMonthDays: Record<string, string>;
}) {
  const ranges = getAcademicYearMonthRanges(academicYearStart, academicYearEnd);
  const items: Array<{ year: number; month: number; manualDays: number }> = [];
  const invalidMonth = ranges.find(({ monthStart }) => {
    const value = numberOrNull((manualMonthDays[monthStart.format('YYYY-MM')] || '').trim());
    if (!isValidManualDayCount(value)) return true;
    items.push({ year: monthStart.year(), month: monthStart.month() + 1, manualDays: value! });
    return false;
  });
  return {
    items: invalidMonth ? [] : items,
    error: invalidMonth
      ? `${invalidMonth.monthStart.format('MMM YYYY')} must use payroll basis days between 1 and 31.`
      : '',
  };
}

function buildPayrollBasisPreviewRows({
  academicYearStart,
  academicYearEnd,
  calendar,
  dayCalculationType,
  saturdayWorkPolicy,
  manualMonthDays,
}: {
  academicYearStart?: string | null;
  academicYearEnd?: string | null;
  calendar?: WorkCalendarPolicy;
  dayCalculationType: string;
  saturdayWorkPolicy: string;
  manualMonthDays: Record<string, string>;
}) {
  const mode = normalizePayrollDayCalculationType(dayCalculationType);
  const weeklyPattern = calendar
    ? normalizeWeeklyRule(calendar.weeklyOffPattern, calendar.customWeeklyOffs || [])
    : 'saturday_sunday';
  const weeklyOffs = new Set(getWeeklyOffsForRule(weeklyPattern, calendar?.customWeeklyOffs || []));

  return getAcademicYearMonthRanges(academicYearStart, academicYearEnd).map(
    ({ monthStart, fromDate, toDate }) => {
      const calendarDays = toDate.diff(fromDate, 'day') + 1;
      const holidayDates = getIncludedHolidayDateSet(fromDate, toDate, calendar?.holidays || []);
      let grossWorkingUnits = 0;
      let holidayUnitsExcluded = 0;
      let saturdayCount = 0;
      let saturdayUnits = 0;
      let cursor = fromDate;
      while (!cursor.isAfter(toDate, 'day')) {
        const baseUnit = getBaseWorkingUnit(cursor, weeklyOffs, saturdayWorkPolicy);
        grossWorkingUnits += baseUnit;
        if (cursor.day() === 6) {
          saturdayCount += 1;
          saturdayUnits += baseUnit;
        }
        if (baseUnit > 0 && holidayDates.has(getDateKey(cursor))) {
          holidayUnitsExcluded += baseUnit;
        }
        cursor = cursor.add(1, 'day');
      }
      const workingUnits = grossWorkingUnits - holidayUnitsExcluded;
      const monthKey = monthStart.format('YYYY-MM');
      const manualBasis = numberOrNull((manualMonthDays[monthKey] || '').trim());
      const basisDays =
        mode === 'total-month-days'
          ? calendarDays
          : mode === 'manual-days'
            ? manualBasis
            : workingUnits;
      const source =
        mode === 'total-month-days'
          ? 'Calendar days'
          : mode === 'manual-days'
            ? 'Manual month'
            : 'Working days';

      return {
        monthKey,
        monthLabel: monthStart.format('MMM YYYY'),
        calendarDays,
        workingUnits,
        holidayUnitsExcluded,
        saturdayCount,
        saturdayUnits,
        basisDays,
        source,
        isCurrentMonth: monthStart.isSame(dayjs(), 'month'),
      };
    }
  );
}

function HolidayMetricCard({
  label,
  value,
  color = 'text.primary',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1.25,
        minWidth: 130,
        flex: { xs: '1 1 45%', sm: '0 0 auto' },
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  );
}

function StatusChip({ status, isDefault }: { status: string; isDefault?: boolean }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
      <Chip
        size="small"
        label={status}
        color={status === 'active' ? 'success' : status === 'archived' ? 'default' : 'warning'}
      />
      {isDefault ? <Chip size="small" label="Default" color="primary" variant="outlined" /> : null}
    </Stack>
  );
}

function EmptyRows({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          {message}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function PolicyName({
  id,
  items,
}: {
  id?: string | null;
  items: Array<{ id: string; name: string }>;
}) {
  if (!id) return <>-</>;
  return <>{items.find((item) => item.id === id)?.name || id}</>;
}

function toLabel(value?: string | null) {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatNumber(value?: number | null) {
  return value == null ? '-' : value.toLocaleString();
}

function DrawerHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      spacing={2}
      sx={{ px: 3, py: 1.75 }}
    >
      <Box>
        <Typography variant="h6">{title}</Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <IconButton onClick={onClose}>
        <Iconify icon="mdi:close" />
      </IconButton>
    </Stack>
  );
}

function PolicyDrawerLayout({
  title,
  subtitle,
  error,
  onClose,
  onSave,
  loading,
  disabled,
  children,
}: {
  title: string;
  subtitle: string;
  error?: string;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: 1, bgcolor: 'background.default' }}
    >
      <DrawerHeader title={title} subtitle={subtitle} onClose={onClose} />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5} sx={{ width: 1, maxWidth: 1080, mx: 'auto' }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {children}
        </Stack>
      </Box>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton variant="contained" disabled={disabled} loading={loading} onClick={onSave}>
          Save
        </LoadingButton>
      </Stack>
    </Box>
  );
}

function PolicySection({
  title,
  description,
  compact = false,
  children,
}: {
  title: string;
  description?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: compact ? { xs: 2, sm: 2.25 } : { xs: 2, sm: 2.5 },
        bgcolor: 'background.paper',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(145, 158, 171, 0.24)' : 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={compact ? 1.5 : 2}>
        <Box>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.35 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

function DrawerFormGrid({
  children,
  columns = 2,
  alignItems = 'flex-start',
  rowGap = 2,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  alignItems?: 'center' | 'flex-start';
  rowGap?: number;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(${columns}, minmax(0, 1fr))`,
        },
        columnGap: 2,
        rowGap,
        alignItems,
      }}
    >
      {children}
    </Box>
  );
}

function FieldLabel({ label, help }: { label: React.ReactNode; help?: string }) {
  return (
    <Stack component="span" direction="row" spacing={0.5} alignItems="center">
      <Box component="span">{label}</Box>
      {help ? (
        <Tooltip title={help} arrow>
          <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }}>
            <Iconify icon="mdi:information-outline" width={16} />
          </Box>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

function DrawerField({
  label,
  help,
  helperText,
  children,
}: {
  label: React.ReactNode;
  help?: string;
  helperText?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Typography
        component="label"
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1.2 }}
      >
        <FieldLabel label={label} help={help} />
      </Typography>
      {children}
      {helperText ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          {helperText}
        </Typography>
      ) : null}
    </Stack>
  );
}

function DrawerSelectField({
  label,
  help,
  value,
  onChange,
  children,
  disabled,
}: {
  label: React.ReactNode;
  help?: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <DrawerField label={label} help={help}>
      <FormControl fullWidth size="small" disabled={disabled}>
        <Select value={value} onChange={onChange}>
          {children}
        </Select>
      </FormControl>
    </DrawerField>
  );
}

function DrawerSwitchField({
  label,
  help,
  checked,
  onChange,
  disabled,
  compact = false,
}: {
  label: React.ReactNode;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        minHeight: compact ? 40 : 65,
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-end',
      }}
    >
      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
          />
        }
        label={<FieldLabel label={label} help={help} />}
      />
    </Box>
  );
}

function SectionTable({ children, columns }: { children: React.ReactNode; columns: string[] }) {
  return (
    <TableContainer
      sx={{ border: (theme) => `1px solid ${theme.vars.palette.divider}`, borderRadius: 1 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} align={column === 'Actions' ? 'right' : 'left'}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default function HRPolicyWorkspace({ focus }: HRPolicyWorkspaceProps) {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab') as WorkspaceTab | null;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const academicYearId = currentYear?.id;
  const [tab, setTab] = useState<WorkspaceTab>(() => resolveInitialTab(focus, queryTab));
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [formError, setFormError] = useState('');
  const [calendarForm, setCalendarForm] = useState<WorkCalendarForm>(
    defaultCalendarForm(currentYear?.startDate, currentYear?.endDate)
  );
  const [holidayReviewFilters, setHolidayReviewFilters] = useState<{
    search: string;
    month: string;
    source: HolidayReviewFilter;
  }>({ search: '', month: '', source: 'all' });
  const [centralHolidayPreviewRows, setCentralHolidayPreviewRows] = useState<WorkCalendarHoliday[]>(
    []
  );
  const [holidayReviewError, setHolidayReviewError] = useState('');
  const [holidayReviewInfo, setHolidayReviewInfo] = useState('');
  const [manualHolidayForm, setManualHolidayForm] = useState<ManualHolidayForm>({
    holidayName: '',
    fromDate: '',
    toDate: '',
    notes: '',
  });
  const [manualHolidayDialogOpen, setManualHolidayDialogOpen] = useState(false);
  const [editingManualHolidayIndex, setEditingManualHolidayIndex] = useState<number | null>(null);
  const [payrollForm, setPayrollForm] = useState<PayrollForm>(defaultPayrollForm());
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>(defaultAttendanceForm());
  const [attendanceAdvancedMode, setAttendanceAdvancedMode] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>(
    defaultAssignmentForm(currentYear?.startDate)
  );
  const [assignmentFilters, setAssignmentFilters] =
    useState<AssignmentFilters>(defaultAssignmentFilters);
  const [assignmentDateError, setAssignmentDateError] = useState('');
  const [assignmentConflict, setAssignmentConflict] = useState<HrPolicyAssignmentConflict | null>(
    null
  );
  const [impactPreview, setImpactPreview] = useState<HrPolicyImpactPreview | null>(null);
  const [pendingImpactAction, setPendingImpactAction] = useState<PendingImpactAction>(null);
  const [auditTarget, setAuditTarget] = useState<AuditTarget>(null);
  const [versionTarget, setVersionTarget] = useState<VersionTarget>(null);
  const [compareVersionIds, setCompareVersionIds] = useState({ from: '', to: '' });
  const [holidayFilters, setHolidayFilters] = useState({
    workCalendarPolicyId: '',
    payrollPolicyId: '',
    attendancePolicyId: '',
    month: dayjs().format('YYYY-MM'),
    fromDate: '',
    toDate: '',
  });
  const [effectiveFilters, setEffectiveFilters] = useState({
    employeeId: '',
    groupId: '',
    date: toDateInput(currentYear?.startDate) || dayjs().format('YYYY-MM-DD'),
  });
  const listArgs = { academicYearId, maxResultCount: 200 };
  const assignmentListArgs = { academicYearId, maxResultCount: 1000 };
  const { data: employees, isFetching: employeesLoading } = useGetEmployeeQuery(
    { page: 1, pageSize: 200 },
    { skip: !academicYearId }
  );
  const { data: groups, isFetching: groupsLoading } = useGetGroupsQuery(
    { academicYearId, maxResultCount: 200, includeDetails: false },
    { skip: !academicYearId }
  );
  const {
    data: workCalendarPolicies,
    isFetching: calendarsLoading,
    error: calendarsError,
  } = useGetWorkCalendarPoliciesQuery(listArgs, { skip: !academicYearId });
  const {
    data: payrollPolicies,
    isFetching: payrollLoading,
    error: payrollError,
  } = useGetPayrollPoliciesQuery(listArgs, { skip: !academicYearId });
  const {
    data: attendancePolicies,
    isFetching: attendanceLoading,
    error: attendanceError,
  } = useGetAttendancePoliciesQuery(listArgs, { skip: !academicYearId });
  const {
    data: assignments,
    isFetching: assignmentsLoading,
    error: assignmentsError,
  } = useGetHrPolicyAssignmentsQuery(assignmentListArgs, { skip: !academicYearId });

  const calendars = useMemo(() => workCalendarPolicies?.items || [], [workCalendarPolicies?.items]);
  const payroll = useMemo(() => payrollPolicies?.items || [], [payrollPolicies?.items]);
  const attendance = useMemo(() => attendancePolicies?.items || [], [attendancePolicies?.items]);
  const activeCalendars = calendars.filter((item) => item.status === 'active');
  const activePayroll = payroll.filter((item) => item.status === 'active');
  const activeAttendance = attendance.filter((item) => item.status === 'active');
  const defaultPayroll = payroll.find((item) => item.isDefault) || activePayroll[0];
  const defaultAttendance = attendance.find((item) => item.isDefault) || activeAttendance[0];
  const employeeOptions = getItems<LookupOption>(employees);
  const groupOptions = getItems<LookupOption>(groups);
  const assignmentRows = useMemo<AssignmentTableRow[]>(() => {
    const payrollNameById = new Map(payroll.map((item) => [item.id, item.name]));
    const attendanceNameById = new Map(attendance.map((item) => [item.id, item.name]));
    const employeeById = new Map(employeeOptions.map((item) => [item.id, item]));
    const search = assignmentFilters.search.trim().toLowerCase();

    return (assignments?.items || [])
      .filter((item) => {
        const employeeOption =
          item.targetType === 'employee' ? employeeById.get(item.targetKey) : undefined;
        const target =
          item.targetType === 'employee'
            ? item.targetDisplayName || optionLabel(employeeOption) || 'Unknown employee'
            : item.targetDisplayName || item.targetKey;
        const organization =
          item.targetType === 'employee'
            ? item.targetOrganizationNames?.filter(Boolean).join(', ') ||
              getLookupOrganizationNames(employeeOption).join(', ')
            : '';
        if (
          assignmentFilters.targetType !== 'all' &&
          item.targetType !== assignmentFilters.targetType
        )
          return false;
        if (assignmentFilters.status !== 'all') {
          const isActive = assignmentFilters.status === 'active';
          if (item.isActive !== isActive) return false;
        }
        if (
          assignmentFilters.payrollPolicyId &&
          item.payrollPolicyId !== assignmentFilters.payrollPolicyId
        )
          return false;
        if (
          assignmentFilters.attendancePolicyId &&
          item.attendancePolicyId !== assignmentFilters.attendancePolicyId
        )
          return false;
        if (
          assignmentFilters.activeOnDate &&
          !isDateWithinRange(assignmentFilters.activeOnDate, item.effectiveFrom, item.effectiveTo)
        )
          return false;
        if (
          (assignmentFilters.effectiveFrom || assignmentFilters.effectiveTo) &&
          !overlapsDateRange(item, assignmentFilters.effectiveFrom, assignmentFilters.effectiveTo)
        ) {
          return false;
        }
        if (!search) return true;

        const searchable = [
          target,
          item.targetType === 'employee' ? undefined : item.targetKey,
          organization,
          item.targetType,
          item.isActive ? 'active' : 'inactive',
          item.assignmentReason,
          payrollNameById.get(item.payrollPolicyId),
          attendanceNameById.get(item.attendancePolicyId),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchable.includes(search);
      })
      .map((item) => {
        const employeeOption =
          item.targetType === 'employee' ? employeeById.get(item.targetKey) : undefined;
        const target =
          item.targetType === 'employee'
            ? item.targetDisplayName || optionLabel(employeeOption) || 'Unknown employee'
            : item.targetDisplayName || item.targetKey;
        const organization =
          item.targetType === 'employee'
            ? item.targetOrganizationNames?.filter(Boolean).join(', ') ||
              getLookupOrganizationNames(employeeOption).join(', ') ||
              '-'
            : '-';

        return {
          id: item.id,
          assignment: item,
          target,
          targetKey: item.targetKey,
          organization,
          sourceType: toLabel(item.targetType),
          payrollPolicyName: payrollNameById.get(item.payrollPolicyId) || item.payrollPolicyId,
          attendancePolicyName:
            attendanceNameById.get(item.attendancePolicyId) || item.attendancePolicyId,
          effective: formatRange(item.effectiveFrom, item.effectiveTo),
          priority: item.priority,
          status: item.isActive ? 'Active' : 'Inactive',
          reason: item.assignmentReason || '-',
        };
      });
  }, [assignments?.items, assignmentFilters, attendance, employeeOptions, payroll]);
  const canCreatePolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.create);
  const canEditPolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.edit);
  const canArchivePolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.archive);
  const canSetDefaultPolicy = hasGrantedPermission(
    permissions,
    hrPermissions.policyActions.setDefault
  );
  const canAssignPolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.assign);
  const canClonePolicy = hasGrantedPermission(permissions, hrPermissions.policyActions.clone);
  const canPreviewImpact = hasGrantedPermission(
    permissions,
    hrPermissions.policyActions.previewImpact
  );
  const canViewAudit = hasGrantedPermission(permissions, hrPermissions.policyActions.viewAudit);
  const [createWorkCalendarPolicy, createCalendarState] = useCreateWorkCalendarPolicyMutation();
  const [updateWorkCalendarPolicyWithToken, updateCalendarState] =
    useUpdateWorkCalendarPolicyWithTokenMutation();
  const [cloneWorkCalendarPolicy, cloneCalendarState] = useCloneWorkCalendarPolicyMutation();
  const [loadCalendarHolidays, loadCalendarHolidaysState] =
    useLazyGetWorkCalendarPolicyHolidaysQuery();
  const [loadHolidayImportPreview, loadHolidayImportPreviewState] =
    useLazyGetWorkCalendarHolidayImportPreviewQuery();
  const [createPayrollPolicy, createPayrollState] = useCreatePayrollPolicyMutation();
  const [updatePayrollPolicyWithToken, updatePayrollState] =
    useUpdatePayrollPolicyWithTokenMutation();
  const [clonePayrollPolicy, clonePayrollState] = useClonePayrollPolicyMutation();
  const [createAttendancePolicy, createAttendanceState] = useCreateAttendancePolicyMutation();
  const [updateAttendancePolicyWithToken, updateAttendanceState] =
    useUpdateAttendancePolicyWithTokenMutation();
  const [cloneAttendancePolicy, cloneAttendanceState] = useCloneAttendancePolicyMutation();
  const [setDefaultPayrollPolicyWithToken, payrollDefaultState] =
    useSetDefaultPayrollPolicyWithTokenMutation();
  const [setDefaultAttendancePolicyWithToken, attendanceDefaultState] =
    useSetDefaultAttendancePolicyWithTokenMutation();
  const [createHrPolicyAssignmentWithToken, createAssignmentState] =
    useCreateHrPolicyAssignmentWithTokenMutation();
  const [updateHrPolicyAssignmentWithToken, updateAssignmentState] =
    useUpdateHrPolicyAssignmentWithTokenMutation();
  const [previewPolicyImpact, previewPolicyImpactState] = usePreviewPolicyImpactMutation();
  const [previewPolicyAssignmentImpact, previewPolicyAssignmentImpactState] =
    usePreviewPolicyAssignmentImpactMutation();
  const [restorePolicyVersionDraft, restoreVersionState] = useRestorePolicyVersionDraftMutation();
  const policyAuditTarget =
    auditTarget?.policyType && auditTarget.policyId
      ? { policyType: auditTarget.policyType, id: auditTarget.policyId }
      : null;
  const { data: auditSummary, isFetching: auditLoading } = useGetPolicyAuditSummaryQuery(
    policyAuditTarget || { policyType: 'work_calendar', id: '' },
    { skip: !policyAuditTarget }
  );
  const { data: auditEvents, isFetching: auditEventsLoading } = useGetHrEntityAuditEventsQuery(
    auditTarget
      ? { entityType: auditTarget.entityType, entityId: auditTarget.entityId, maxResultCount: 50 }
      : { entityType: 'work_calendar_policy', entityId: '' },
    { skip: !auditTarget }
  );
  const { data: versionHistory, isFetching: versionHistoryLoading } = useGetPolicyVersionsQuery(
    versionTarget
      ? {
          policyType: versionTarget.policyType,
          policyId: versionTarget.policyId,
          maxResultCount: 30,
        }
      : { policyType: 'work_calendar', policyId: '' },
    { skip: !versionTarget }
  );
  const { data: versionCompare, isFetching: versionCompareLoading } = useComparePolicyVersionsQuery(
    versionTarget && compareVersionIds.from && compareVersionIds.to
      ? {
          policyType: versionTarget.policyType,
          policyId: versionTarget.policyId,
          fromVersionId: compareVersionIds.from,
          toVersionId: compareVersionIds.to,
        }
      : { policyType: 'work_calendar', policyId: '', fromVersionId: '', toVersionId: '' },
    { skip: !versionTarget || !compareVersionIds.from || !compareVersionIds.to }
  );

  const selectedHolidayCalendarId =
    holidayFilters.workCalendarPolicyId ||
    defaultPayroll?.workCalendarPolicyId ||
    defaultAttendance?.workCalendarPolicyId ||
    activeCalendars[0]?.id;
  const selectedHolidayPayrollId = holidayFilters.payrollPolicyId || defaultPayroll?.id;
  const selectedHolidayAttendanceId = holidayFilters.attendancePolicyId || defaultAttendance?.id;
  const {
    data: holidayImpact,
    isFetching: holidayImpactLoading,
    error: holidayImpactError,
  } = useGetPolicyHolidayImpactPreviewQuery(
    {
      academicYearId,
      workCalendarPolicyId: selectedHolidayCalendarId,
      payrollPolicyId: selectedHolidayPayrollId,
      attendancePolicyId: selectedHolidayAttendanceId,
      month: holidayFilters.month || undefined,
      fromDate: holidayFilters.month ? undefined : holidayFilters.fromDate || undefined,
      toDate: holidayFilters.month ? undefined : holidayFilters.toDate || undefined,
    },
    { skip: !academicYearId || !selectedHolidayPayrollId || !selectedHolidayAttendanceId }
  );

  const {
    data: effectivePreview,
    isFetching: effectiveLoading,
    error: effectiveError,
  } = useGetPolicyAssignmentPreviewQuery(
    {
      academicYearId,
      date: effectiveFilters.date,
      employeeId: effectiveFilters.employeeId || undefined,
      groupId: effectiveFilters.groupId || undefined,
    },
    {
      skip:
        !academicYearId ||
        !effectiveFilters.date ||
        (!effectiveFilters.employeeId && !effectiveFilters.groupId),
    }
  );

  const {
    data: assignmentPreview,
    isFetching: assignmentPreviewLoading,
    error: assignmentPreviewError,
  } = useGetPolicyAssignmentPreviewQuery(
    {
      academicYearId,
      date: assignmentForm.effectiveFrom,
      employeeId: assignmentForm.targetType === 'employee' ? assignmentForm.targetKey : undefined,
      groupId: assignmentForm.targetType === 'group' ? assignmentForm.targetKey : undefined,
    },
    {
      skip:
        !drawer ||
        drawer.kind !== 'assignment' ||
        !academicYearId ||
        !assignmentForm.effectiveFrom ||
        !assignmentForm.targetKey,
    }
  );

  const isLoading =
    calendarsLoading ||
    payrollLoading ||
    attendanceLoading ||
    assignmentsLoading ||
    employeesLoading ||
    groupsLoading;

  const openCalendarDrawer = async (item?: WorkCalendarPolicy) => {
    setFormError('');
    const customWeeklyOffs = sortWeekDays(item?.customWeeklyOffs || []);
    setHolidayReviewFilters({ search: '', month: '', source: 'all' });
    setHolidayReviewError('');
    setHolidayReviewInfo('');
    setCentralHolidayPreviewRows([]);
    setManualHolidayForm({ holidayName: '', fromDate: '', toDate: '', notes: '' });
    setManualHolidayDialogOpen(false);
    setEditingManualHolidayIndex(null);
    const holidays = item?.id
      ? item.holidays?.length
        ? item.holidays
        : await loadCalendarHolidays({ id: item.id })
            .unwrap()
            .catch(() => [])
      : [];
    setCalendarForm(
      item
        ? {
            name: item.name,
            status: item.status,
            effectiveFrom: toDateInput(item.effectiveFrom),
            effectiveTo: toDateInput(item.effectiveTo),
            weeklyOffPattern: normalizeWeeklyRule(item.weeklyOffPattern, customWeeklyOffs),
            customWeeklyOffs,
            holidaySyncMode: 'snapshot',
            holidays,
          }
        : defaultCalendarForm(currentYear?.startDate, currentYear?.endDate)
    );
    setDrawer({ kind: 'calendar', mode: item ? 'edit' : 'create', item });
    if (academicYearId) {
      try {
        const previewRows = await loadHolidayImportPreview({ academicYearId }).unwrap();
        setCentralHolidayPreviewRows(previewRows);
        if (!item && previewRows.length === 0) {
          setHolidayReviewInfo(
            'No central holidays found for this academic year. Add manual holidays or create holidays in Calendar first.'
          );
        }
      } catch (error) {
        setHolidayReviewError(getErrorMessage(error, 'Could not load central Calendar holidays.'));
      }
    }
  };

  const openPayrollDrawer = (item?: PayrollPolicy) => {
    setFormError('');
    const existingManualMonthDays = item
      ? buildManualMonthDaysMap({
          academicYearStart: currentYear?.startDate,
          academicYearEnd: currentYear?.endDate,
          existing: payrollManualMonthDaysToMap(item.manualMonthDays || []),
          fallbackDays: item.manualDays,
        })
      : {};
    setPayrollForm(
      item
        ? {
            name: item.name,
            status: item.status,
            workCalendarPolicyId: item.workCalendarPolicyId,
            isDefault: item.isDefault,
            dayCalculationType: normalizePayrollDayCalculationType(item.dayCalculationType),
            manualMonthDays: existingManualMonthDays,
            saturdayWorkPolicy: item.saturdayWorkPolicy,
          }
        : defaultPayrollForm(activeCalendars[0]?.id || '')
    );
    setDrawer({ kind: 'payroll', mode: item ? 'edit' : 'create', item });
  };

  const openAttendanceDrawer = (item?: AttendancePolicy) => {
    setFormError('');
    const nextForm = item
      ? {
          name: item.name,
          status: item.status,
          workCalendarPolicyId: item.workCalendarPolicyId,
          isDefault: item.isDefault,
          fullDayThresholdPercentage: String(item.fullDayThresholdPercentage),
          halfDayThresholdPercentage: String(item.halfDayThresholdPercentage),
          absentThresholdPercentage: String(item.absentThresholdPercentage),
          missingPunchBehavior: item.missingPunchBehavior,
          manualCorrectionAllowed: item.manualCorrectionAllowed,
          graceTime: String(item.graceTime),
          maxLateAllowedPerMonth: String(item.maxLateAllowedPerMonth),
          penaltyType: item.penaltyType,
          penaltyCountThreshold: String(item.penaltyCountThreshold),
          earlyExitEnabled: item.earlyExitEnabled,
          earlyExitGraceTime: String(item.earlyExitGraceTime),
          overtimeEnabled: item.overtimeEnabled,
          overtimeRate: item.overtimeRate || '',
          minOvertimeMinutes:
            item.minOvertimeMinutes == null ? '' : String(item.minOvertimeMinutes),
          holidayWorkBehavior: item.holidayWorkBehavior,
          sandwichRuleEnabled: item.sandwichRuleEnabled,
          payrollPreviewEnabled: item.payrollPreviewEnabled,
        }
      : defaultAttendanceForm(activeCalendars[0]?.id || '');
    setAttendanceForm(nextForm);
    setAttendanceAdvancedMode(item ? hasCustomAttendanceAdvancedSettings(nextForm) : false);
    setDrawer({ kind: 'attendance', mode: item ? 'edit' : 'create', item });
  };

  const openAssignmentDrawer = (item?: HrPolicyAssignment) => {
    setFormError('');
    setAssignmentDateError('');
    setAssignmentConflict(null);
    setAssignmentForm(
      item
        ? {
            targetType: item.targetType,
            targetKey: item.targetKey,
            targetDisplayName: item.targetDisplayName || '',
            payrollPolicyId: item.payrollPolicyId,
            attendancePolicyId: item.attendancePolicyId,
            effectiveFrom: toDateInput(item.effectiveFrom),
            effectiveTo: toDateInput(item.effectiveTo),
            priority: String(item.priority ?? 0),
            assignmentReason: item.assignmentReason || '',
            isActive: item.isActive,
          }
        : {
            ...defaultAssignmentForm(currentYear?.startDate),
            payrollPolicyId: defaultPayroll?.id || '',
            attendancePolicyId: defaultAttendance?.id || '',
          }
    );
    setDrawer({ kind: 'assignment', mode: item ? 'edit' : 'create', item });
  };

  const closeDrawer = () => {
    setDrawer(null);
    setFormError('');
    setAssignmentDateError('');
    setAssignmentConflict(null);
  };

  const closeImpactDrawer = () => {
    setImpactPreview(null);
    setPendingImpactAction(null);
  };

  const runWithImpactConfirmation = async (
    preview: HrPolicyImpactPreview,
    label: string,
    run: (token?: string) => Promise<void>
  ) => {
    setImpactPreview(preview);
    if (preview.blockingWarnings?.length || preview.requiresConfirmation) {
      setPendingImpactAction({ label, run });
      return;
    }
    await run();
  };

  const confirmPendingImpactAction = async () => {
    if (!pendingImpactAction || !impactPreview) return;
    if (impactPreview.blockingWarnings?.length) return;
    try {
      await pendingImpactAction.run(impactPreview.confirmationToken || undefined);
      closeImpactDrawer();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not complete confirmed policy action.'));
    }
  };

  const previewPolicyRowImpact = async (
    policyType: 'work_calendar' | 'payroll' | 'attendance',
    item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy,
    action = 'update'
  ) => {
    try {
      const response = await previewPolicyImpact({
        policyType,
        policyId: item.id,
        academicYearId: item.academicYearId,
        action,
      }).unwrap();
      setImpactPreview(response);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not preview policy impact.'));
    }
  };

  const openVersionHistory = (
    policyType: HrPolicyType,
    item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy
  ) => {
    setVersionTarget({ policyType, policyId: item.id, policyName: item.name });
    setCompareVersionIds({ from: '', to: '' });
  };

  const openPolicyAudit = (
    policyType: HrPolicyType,
    item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy
  ) => {
    const entityType =
      policyType === 'work_calendar'
        ? 'work_calendar_policy'
        : policyType === 'payroll'
          ? 'payroll_policy'
          : 'attendance_policy';
    setAuditTarget({
      entityType,
      entityId: item.id,
      title: item.name,
      policyType,
      policyId: item.id,
    });
  };

  const openEntityAudit = (entityType: string, entityId: string, title: string) => {
    setAuditTarget({ entityType, entityId, title });
  };

  const restoreVersionAsDraft = async (version: HrPolicyVersion) => {
    if (!versionTarget) return;
    try {
      const restored = await restorePolicyVersionDraft({
        policyType: versionTarget.policyType,
        policyId: versionTarget.policyId,
        versionId: version.id,
        name: `${version.name} v${version.versionNumber} Restore Draft`,
        changeReason: 'Restored from version history',
      }).unwrap();
      toast.success('Version restored as draft');
      setVersionTarget(null);
      if (versionTarget.policyType === 'work_calendar') {
        openCalendarDrawer(restored as WorkCalendarPolicy);
      } else if (versionTarget.policyType === 'payroll') {
        openPayrollDrawer(restored as PayrollPolicy);
      } else {
        openAttendanceDrawer(restored as AttendancePolicy);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not restore policy version.'));
    }
  };

  const clonePolicy = async (
    type: 'calendar' | 'payroll' | 'attendance',
    item: WorkCalendarPolicy | PayrollPolicy | AttendancePolicy
  ) => {
    try {
      if (type === 'calendar') {
        const cloned = await cloneWorkCalendarPolicy({
          id: item.id,
          name: `${item.name} Copy`,
        }).unwrap();
        openCalendarDrawer(cloned);
      } else if (type === 'payroll') {
        const cloned = await clonePayrollPolicy({
          id: item.id,
          name: `${item.name} Copy`,
        }).unwrap();
        openPayrollDrawer(cloned);
      } else {
        const cloned = await cloneAttendancePolicy({
          id: item.id,
          name: `${item.name} Copy`,
        }).unwrap();
        openAttendanceDrawer(cloned);
      }
      toast.success('Draft policy cloned');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not clone policy.'));
    }
  };

  const saveCalendar = async () => {
    if (
      !academicYearId ||
      !calendarForm.name.trim() ||
      !calendarForm.effectiveFrom ||
      !calendarForm.weeklyOffPattern
    ) {
      setFormError('Name, effective from, and weekly rule are required.');
      return;
    }
    if (
      calendarForm.effectiveTo &&
      dayjs(calendarForm.effectiveTo).isBefore(dayjs(calendarForm.effectiveFrom), 'day')
    ) {
      setFormError('Effective to must be on or after effective from.');
      return;
    }
    const customWeeklyOffs = sortWeekDays(calendarForm.customWeeklyOffs);
    const weeklyOffs = getWeeklyOffsForRule(calendarForm.weeklyOffPattern, customWeeklyOffs);
    if (calendarForm.weeklyOffPattern === 'custom' && weeklyOffs.length === 0) {
      setFormError('Select at least one weekly off day for a custom weekly rule.');
      return;
    }
    const invalidHoliday = calendarForm.holidays.find(
      (holiday) =>
        !holiday.holidayName.trim() ||
        !getHolidayFromDate(holiday) ||
        !getHolidayToDate(holiday) ||
        !isHolidayRangeInsideRange(
          getHolidayFromDate(holiday),
          getHolidayToDate(holiday),
          calendarForm.effectiveFrom,
          calendarForm.effectiveTo
        )
    );
    if (invalidHoliday) {
      setFormError(
        'All finalized holidays need a name, valid date range, and must stay inside the work calendar effective date range.'
      );
      return;
    }
    const body = {
      academicYearId,
      name: calendarForm.name.trim(),
      status: calendarForm.status,
      effectiveFrom: calendarForm.effectiveFrom,
      effectiveTo: calendarForm.effectiveTo || null,
      weeklyOffPattern: toApiWeeklyPattern(calendarForm.weeklyOffPattern),
      customWeeklyOffs: weeklyOffs,
      holidaySyncMode: 'snapshot',
      holidays: calendarForm.holidays.map((holiday) => ({
        ...holiday,
        academicYearId,
        date: dayjs(getHolidayFromDate(holiday)).format('YYYY-MM-DD'),
        fromDate: dayjs(getHolidayFromDate(holiday)).format('YYYY-MM-DD'),
        toDate: dayjs(getHolidayToDate(holiday)).format('YYYY-MM-DD'),
        dayCount: getHolidayDayCount(holiday),
      })),
    };
    try {
      if (drawer?.mode === 'edit' && drawer.item?.id) {
        const preview = await previewPolicyImpact({
          policyType: 'work_calendar',
          policyId: drawer.item.id,
          academicYearId,
          action: 'update',
        }).unwrap();
        await runWithImpactConfirmation(preview, 'Save work calendar', async (token) => {
          await updateWorkCalendarPolicyWithToken({ id: drawer.item!.id, body, token }).unwrap();
          toast.success('Work calendar saved');
          closeDrawer();
        });
      } else {
        await createWorkCalendarPolicy(body).unwrap();
        toast.success('Work calendar saved');
        closeDrawer();
      }
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save work calendar policy.'));
    }
  };

  const savePayroll = async () => {
    if (!academicYearId || !payrollForm.name.trim() || !payrollForm.workCalendarPolicyId) {
      setFormError('Name and active work calendar are required.');
      return;
    }
    const dayCalculationType = normalizePayrollDayCalculationType(payrollForm.dayCalculationType);
    const isManualDays = dayCalculationType === 'manual-days';
    const manualMonthDaysResult = buildManualMonthDaysPayload({
      academicYearStart: currentYear?.startDate,
      academicYearEnd: currentYear?.endDate,
      manualMonthDays: payrollForm.manualMonthDays,
    });
    if (isManualDays) {
      if (getAcademicYearMonthRanges(currentYear?.startDate, currentYear?.endDate).length === 0) {
        setFormError('Manual Days mode requires an academic year with valid start and end dates.');
        return;
      }
      if (manualMonthDaysResult.error) {
        setFormError(manualMonthDaysResult.error);
        return;
      }
    }
    const body = {
      academicYearId,
      workCalendarPolicyId: payrollForm.workCalendarPolicyId,
      name: payrollForm.name.trim(),
      status: payrollForm.status,
      isDefault: payrollForm.isDefault,
      dayCalculationType,
      manualDays: null,
      manualMonthDays: isManualDays ? manualMonthDaysResult.items : [],
      saturdayWorkPolicy: payrollForm.saturdayWorkPolicy,
      holidayOverrides: (drawer?.item as PayrollPolicy | undefined)?.holidayOverrides || [],
    };
    try {
      if (drawer?.mode === 'edit' && drawer.item?.id) {
        const preview = await previewPolicyImpact({
          policyType: 'payroll',
          policyId: drawer.item.id,
          academicYearId,
          action: 'update',
        }).unwrap();
        await runWithImpactConfirmation(preview, 'Save payroll policy', async (token) => {
          await updatePayrollPolicyWithToken({ id: drawer.item!.id, body, token }).unwrap();
          toast.success('Payroll policy saved');
          closeDrawer();
        });
      } else {
        await createPayrollPolicy(body).unwrap();
        toast.success('Payroll policy saved');
        closeDrawer();
      }
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save payroll policy.'));
    }
  };

  const saveAttendance = async () => {
    const formToSave = attendanceAdvancedMode
      ? attendanceForm
      : applyAttendanceAdvancedDefaults(attendanceForm);
    const full = Number(formToSave.fullDayThresholdPercentage);
    const half = Number(formToSave.halfDayThresholdPercentage);
    const absent = Number(formToSave.absentThresholdPercentage);
    if (!academicYearId || !formToSave.name.trim() || !formToSave.workCalendarPolicyId) {
      setFormError('Name and active work calendar are required.');
      return;
    }
    if (!(full >= half && half >= absent)) {
      setFormError('Thresholds must be ordered as full day >= half day >= absent.');
      return;
    }
    const body = {
      academicYearId,
      workCalendarPolicyId: formToSave.workCalendarPolicyId,
      name: formToSave.name.trim(),
      status: formToSave.status,
      isDefault: formToSave.isDefault,
      fullDayThresholdPercentage: full,
      halfDayThresholdPercentage: half,
      absentThresholdPercentage: absent,
      missingPunchBehavior: formToSave.missingPunchBehavior,
      manualCorrectionAllowed: formToSave.manualCorrectionAllowed,
      graceTime: Number(formToSave.graceTime || 0),
      maxLateAllowedPerMonth: Number(formToSave.maxLateAllowedPerMonth || 0),
      penaltyType: formToSave.penaltyType,
      penaltyCountThreshold: Number(formToSave.penaltyCountThreshold || 0),
      earlyExitEnabled: formToSave.earlyExitEnabled,
      earlyExitGraceTime: Number(formToSave.earlyExitGraceTime || 0),
      overtimeEnabled: formToSave.overtimeEnabled,
      overtimeRate: formToSave.overtimeRate || null,
      minOvertimeMinutes: numberOrNull(formToSave.minOvertimeMinutes),
      holidayWorkBehavior: formToSave.holidayWorkBehavior,
      sandwichRuleEnabled: formToSave.sandwichRuleEnabled,
      payrollPreviewEnabled: formToSave.payrollPreviewEnabled,
    };
    try {
      if (drawer?.mode === 'edit' && drawer.item?.id) {
        const preview = await previewPolicyImpact({
          policyType: 'attendance',
          policyId: drawer.item.id,
          academicYearId,
          action: 'update',
        }).unwrap();
        await runWithImpactConfirmation(preview, 'Save attendance policy', async (token) => {
          await updateAttendancePolicyWithToken({ id: drawer.item!.id, body, token }).unwrap();
          toast.success('Attendance policy saved');
          closeDrawer();
        });
      } else {
        await createAttendancePolicy(body).unwrap();
        toast.success('Attendance policy saved');
        closeDrawer();
      }
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save attendance policy.'));
    }
  };

  const saveAssignment = async () => {
    if (
      !academicYearId ||
      !assignmentForm.targetKey.trim() ||
      !assignmentForm.payrollPolicyId ||
      !assignmentForm.attendancePolicyId ||
      !assignmentForm.effectiveFrom
    ) {
      setFormError('Target, policies, and effective from are required.');
      if (!assignmentForm.effectiveFrom) {
        setAssignmentDateError('Effective from is required.');
      }
      return;
    }
    const body = {
      academicYearId,
      targetType: assignmentForm.targetType,
      targetKey: assignmentForm.targetKey.trim(),
      targetDisplayName: assignmentForm.targetDisplayName || null,
      payrollPolicyId: assignmentForm.payrollPolicyId,
      attendancePolicyId: assignmentForm.attendancePolicyId,
      effectiveFrom: assignmentForm.effectiveFrom,
      effectiveTo: assignmentForm.effectiveTo || null,
      priority: Number(assignmentForm.priority || 0),
      assignmentReason: assignmentForm.assignmentReason || null,
      isActive: assignmentForm.isActive,
    };
    try {
      setAssignmentConflict(null);
      const action = drawer?.mode === 'edit' ? 'update' : 'create';
      const assignmentId = drawer?.mode === 'edit' ? drawer.item?.id : undefined;
      const preview = await previewPolicyAssignmentImpact({
        action,
        assignmentId,
        assignment: body,
      }).unwrap();
      if (drawer?.mode === 'edit' && drawer.item?.id) {
        await runWithImpactConfirmation(preview, 'Save policy assignment', async (token) => {
          await updateHrPolicyAssignmentWithToken({ id: drawer.item!.id, body, token }).unwrap();
          toast.success('Policy assignment saved');
          closeDrawer();
        });
      } else {
        await runWithImpactConfirmation(preview, 'Save policy assignment', async (token) => {
          await createHrPolicyAssignmentWithToken({ body, token }).unwrap();
          toast.success('Policy assignment saved');
          closeDrawer();
        });
      }
    } catch (error) {
      const conflict = getAssignmentConflict(error);
      const message = getErrorMessage(
        error,
        'Assignment overlaps an active rule for the same target and date range.'
      );
      if (conflict) {
        setAssignmentConflict(conflict);
        setAssignmentDateError('This date range overlaps another active assignment.');
      } else if (message.toLowerCase().includes('overlap')) {
        setAssignmentDateError(message);
      } else {
        setFormError(message);
      }
    }
  };

  const archivePolicy = async (
    type: 'payroll' | 'attendance' | 'calendar',
    item: PayrollPolicy | AttendancePolicy | WorkCalendarPolicy
  ) => {
    try {
      const policyType = type === 'calendar' ? 'work_calendar' : type;
      const preview = await previewPolicyImpact({
        policyType,
        policyId: item.id,
        academicYearId: item.academicYearId,
        action: 'archive',
      }).unwrap();
      await runWithImpactConfirmation(preview, 'Archive policy', async (token) => {
        if (type === 'payroll') {
          await updatePayrollPolicyWithToken({
            id: item.id,
            body: { ...(item as PayrollPolicy), status: 'archived' },
            token,
          }).unwrap();
        } else if (type === 'attendance') {
          await updateAttendancePolicyWithToken({
            id: item.id,
            body: { ...(item as AttendancePolicy), status: 'archived' },
            token,
          }).unwrap();
        } else {
          await updateWorkCalendarPolicyWithToken({
            id: item.id,
            body: { ...(item as WorkCalendarPolicy), status: 'archived' },
            token,
          }).unwrap();
        }
        toast.success('Policy archived');
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not archive policy.'));
    }
  };

  const setDefaultWithImpact = async (
    type: 'payroll' | 'attendance',
    item: PayrollPolicy | AttendancePolicy
  ) => {
    try {
      const preview = await previewPolicyImpact({
        policyType: type,
        policyId: item.id,
        academicYearId: item.academicYearId,
        action: 'set-default',
      }).unwrap();
      await runWithImpactConfirmation(preview, 'Set default policy', async (token) => {
        if (type === 'payroll') {
          await setDefaultPayrollPolicyWithToken({ id: item.id, token }).unwrap();
        } else {
          await setDefaultAttendancePolicyWithToken({ id: item.id, token }).unwrap();
        }
        toast.success('Default policy updated');
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not set default policy.'));
    }
  };

  const setTarget = (key: string, displayName?: string) => {
    setAssignmentForm((current) => ({
      ...current,
      targetKey: key,
      targetDisplayName: displayName || '',
    }));
  };

  const previewCurrentAssignmentImpact = async () => {
    if (!academicYearId || !assignmentForm.targetKey || !assignmentForm.effectiveFrom) {
      setFormError('Target and effective from are required before impact preview.');
      return;
    }

    try {
      const response = await previewPolicyAssignmentImpact({
        action: drawer?.mode === 'edit' ? 'update' : 'create',
        assignmentId: drawer?.item?.id,
        assignment: {
          academicYearId,
          targetType: assignmentForm.targetType,
          targetKey: assignmentForm.targetKey.trim(),
          targetDisplayName: assignmentForm.targetDisplayName || null,
          payrollPolicyId: assignmentForm.payrollPolicyId,
          attendancePolicyId: assignmentForm.attendancePolicyId,
          effectiveFrom: assignmentForm.effectiveFrom,
          effectiveTo: assignmentForm.effectiveTo || null,
          priority: Number(assignmentForm.priority || 0),
          assignmentReason: assignmentForm.assignmentReason || null,
          isActive: assignmentForm.isActive,
        },
      }).unwrap();
      setImpactPreview(response);
    } catch (error) {
      const conflict = getAssignmentConflict(error);
      if (conflict) {
        setAssignmentConflict(conflict);
      }
      toast.error(getErrorMessage(error, 'Could not preview assignment impact.'));
    }
  };

  const renderAssignmentTargetPicker = () => {
    if (assignmentForm.targetType === 'employee') {
      return (
        <DrawerField label="Employee *">
          <Autocomplete
            options={employeeOptions}
            getOptionLabel={optionLabel}
            value={employeeOptions.find((item) => item.id === assignmentForm.targetKey) || null}
            onChange={(_, value) => setTarget(value?.id || '', optionLabel(value))}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </DrawerField>
      );
    }
    return (
      <DrawerField label="Group *">
        <Autocomplete
          options={groupOptions}
          getOptionLabel={optionLabel}
          value={groupOptions.find((item) => item.id === assignmentForm.targetKey) || null}
          onChange={(_, value) => setTarget(value?.id || '', optionLabel(value))}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Stack spacing={0} sx={{ minWidth: 0 }}>
                <Typography variant="body2">{optionLabel(option)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatNumber(option.employeeCount ?? option.memberCount ?? 0)} members
                </Typography>
              </Stack>
            </li>
          )}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </DrawerField>
    );
  };

  const showError = (error: unknown, fallback: string) =>
    error ? <Alert severity="error">{getErrorMessage(error, fallback)}</Alert> : null;

  const renderCalendars = () => (
    <Card sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Work Calendars</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={() => openCalendarDrawer()}
          disabled={!academicYearId || !canCreatePolicy}
        >
          New Calendar
        </Button>
      </Stack>
      {showError(calendarsError, 'Could not load work calendars.')}
      <SectionTable
        columns={[
          'Name',
          'Status',
          'Effective',
          'Weekly Rule',
          'Holidays',
          'Version',
          'Updated',
          'Actions',
        ]}
      >
        {calendars.length ? (
          calendars.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <StatusChip status={item.status} />
              </TableCell>
              <TableCell>{formatRange(item.effectiveFrom, item.effectiveTo)}</TableCell>
              <TableCell>{getCalendarWeeklyRuleLabel(item)}</TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    {item.holidaySummary?.includedCount ?? 0} included
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Finalized from Calendar
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>{item.version}</TableCell>
              <TableCell>
                {formatDate(item.lastModificationTime || item.lastUpdatedAt || item.creationTime)}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Who is affected?">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canPreviewImpact}
                      onClick={() => previewPolicyRowImpact('work_calendar', item)}
                    >
                      <Iconify icon="mdi:account-search-outline" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Audit trail">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canViewAudit}
                      onClick={() => openPolicyAudit('work_calendar', item)}
                    >
                      <Iconify icon="mdi:history" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Version history">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canViewAudit}
                      onClick={() => openVersionHistory('work_calendar', item)}
                    >
                      <Iconify icon="mdi:timeline-clock-outline" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Clone draft">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canClonePolicy || cloneCalendarState.isLoading}
                      onClick={() => clonePolicy('calendar', item)}
                    >
                      <Iconify icon="mdi:content-copy" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Edit">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canEditPolicy}
                      onClick={() => openCalendarDrawer(item)}
                    >
                      <Iconify icon="mdi:pencil-outline" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Archive">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!canArchivePolicy || item.status === 'archived'}
                      onClick={() => archivePolicy('calendar', item)}
                    >
                      <Iconify icon="mdi:archive-outline" />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <EmptyRows colSpan={8} message="No work calendars." />
        )}
      </SectionTable>
    </Card>
  );

  const renderPolicyTable = (type: 'payroll' | 'attendance') => {
    const items = type === 'payroll' ? payroll : attendance;
    const error = type === 'payroll' ? payrollError : attendanceError;
    return (
      <Card sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Stack spacing={0.25}>
            <Typography variant="h6">
              {type === 'payroll' ? 'Payroll Policies' : 'Attendance Policies'}
            </Typography>
            {type === 'attendance' ? (
              <Typography variant="body2" color="text.secondary">
                Most schools can use one standard policy and keep Advanced Settings off.
              </Typography>
            ) : null}
          </Stack>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => (type === 'payroll' ? openPayrollDrawer() : openAttendanceDrawer())}
            disabled={!academicYearId || activeCalendars.length === 0 || !canCreatePolicy}
          >
            {type === 'attendance' ? 'New Standard Policy' : 'New Policy'}
          </Button>
        </Stack>
        {activeCalendars.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Create an active work calendar first.
          </Alert>
        ) : null}
        {showError(error, `Could not load ${type} policies.`)}
        <SectionTable
          columns={[
            'Name',
            'Status',
            'Calendar',
            type === 'payroll' ? 'Day Mode' : 'Thresholds',
            'Integration',
            'Version',
            'Updated',
            'Actions',
          ]}
        >
          {items.length ? (
            items.map((item: PayrollPolicy | AttendancePolicy) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <StatusChip status={item.status} isDefault={item.isDefault} />
                </TableCell>
                <TableCell>
                  <PolicyName id={item.workCalendarPolicyId} items={calendars} />
                </TableCell>
                <TableCell>
                  {'dayCalculationType' in item
                    ? `${item.dayCalculationType} / ${item.saturdayWorkPolicy}`
                    : `${item.fullDayThresholdPercentage}% / ${item.halfDayThresholdPercentage}%`}
                </TableCell>
                <TableCell>
                  <Chip size="small" label="Per employee attendance" variant="outlined" />
                </TableCell>
                <TableCell>{item.version}</TableCell>
                <TableCell>
                  {formatDate(item.lastModificationTime || item.lastUpdatedAt || item.creationTime)}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Who is affected?">
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canPreviewImpact}
                        onClick={() =>
                          previewPolicyRowImpact(
                            type === 'payroll' ? 'payroll' : 'attendance',
                            item
                          )
                        }
                      >
                        <Iconify icon="mdi:account-search-outline" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Audit trail">
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canViewAudit}
                        onClick={() => openPolicyAudit(type, item)}
                      >
                        <Iconify icon="mdi:history" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Version history">
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canViewAudit}
                        onClick={() => openVersionHistory(type, item)}
                      >
                        <Iconify icon="mdi:timeline-clock-outline" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Clone draft">
                    <span>
                      <IconButton
                        size="small"
                        disabled={
                          !canClonePolicy ||
                          clonePayrollState.isLoading ||
                          cloneAttendanceState.isLoading
                        }
                        onClick={() => clonePolicy(type, item)}
                      >
                        <Iconify icon="mdi:content-copy" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Set default">
                    <span>
                      <IconButton
                        size="small"
                        disabled={
                          !canSetDefaultPolicy ||
                          item.isDefault ||
                          item.status !== 'active' ||
                          payrollDefaultState.isLoading ||
                          attendanceDefaultState.isLoading
                        }
                        onClick={() => setDefaultWithImpact(type, item)}
                      >
                        <Iconify icon="mdi:star-check-outline" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canEditPolicy}
                        onClick={() =>
                          type === 'payroll'
                            ? openPayrollDrawer(item as PayrollPolicy)
                            : openAttendanceDrawer(item as AttendancePolicy)
                        }
                      >
                        <Iconify icon="mdi:pencil-outline" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Archive">
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canArchivePolicy || item.status === 'archived'}
                        onClick={() => archivePolicy(type, item)}
                      >
                        <Iconify icon="mdi:archive-outline" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyRows
              colSpan={8}
              message={
                type === 'attendance'
                  ? 'No attendance policy yet. Create one standard policy for the academic year to start.'
                  : `No ${type} policies.`
              }
            />
          )}
        </SectionTable>
      </Card>
    );
  };

  const previewAssignment = (item: HrPolicyAssignment) => {
    setEffectiveFilters({
      employeeId: item.targetType === 'employee' ? item.targetKey : '',
      groupId: item.targetType === 'group' ? item.targetKey : '',
      date: toDateInput(item.effectiveFrom) || dayjs().format('YYYY-MM-DD'),
    });
    setTab('effective');
  };

  const renderAssignments = () => {
    const assignmentColumns: IColumn[] = [
      {
        id: 'target',
        label: 'Target',
        minWidth: 240,
        render: (_, row) => {
          const item = row as AssignmentTableRow;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {item.target}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'sourceType',
        label: 'Source',
        filterType: 'enum',
        enumOptions: [
          { label: 'Employee', value: 'Employee' },
          { label: 'Group', value: 'Group' },
        ],
        render: (value) => <Chip size="small" label={value} variant="outlined" />,
      },
      {
        id: 'organization',
        label: 'Organization',
        minWidth: 180,
        render: (value) => (
          <Typography
            variant="body2"
            noWrap
            color={value === '-' ? 'text.secondary' : 'text.primary'}
          >
            {value || '-'}
          </Typography>
        ),
      },
      { id: 'payrollPolicyName', label: 'Payroll Policy', minWidth: 180 },
      { id: 'attendancePolicyName', label: 'Attendance Policy', minWidth: 180 },
      { id: 'effective', label: 'Effective', minWidth: 180 },
      { id: 'priority', label: 'Priority', filterType: 'number', align: 'right', width: 110 },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
        ],
        render: (value) => (
          <Chip size="small" label={value} color={value === 'Active' ? 'success' : 'default'} />
        ),
      },
      { id: 'reason', label: 'Reason', minWidth: 220, defaultHidden: true },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        width: 140,
        isFilter: false,
        render: (_, row) => {
          const item = (row as AssignmentTableRow).assignment;
          return (
            <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
              <Tooltip title="Preview">
                <IconButton size="small" onClick={() => previewAssignment(item)}>
                  <Iconify icon="mdi:source-branch-check" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Audit trail">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canViewAudit}
                    onClick={() =>
                      openEntityAudit(
                        'policy_assignment',
                        item.id,
                        item.targetDisplayName || item.targetKey
                      )
                    }
                  >
                    <Iconify icon="mdi:history" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Edit">
                <span>
                  <IconButton
                    size="small"
                    disabled={!canAssignPolicy}
                    onClick={() => openAssignmentDrawer(item)}
                  >
                    <Iconify icon="mdi:pencil-outline" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ];

    return (
      <Stack spacing={2}>
        <Card sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Stack spacing={0.25}>
              <Typography variant="h6">Assignments</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatNumber(assignmentRows.length)} of{' '}
                {formatNumber(assignments?.totalCount || 0)} assignments
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => openAssignmentDrawer()}
              disabled={
                !academicYearId ||
                activePayroll.length === 0 ||
                activeAttendance.length === 0 ||
                !canAssignPolicy
              }
            >
              New Assignment
            </Button>
          </Stack>
          {activePayroll.length === 0 || activeAttendance.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Active payroll and attendance policies are required.
            </Alert>
          ) : null}
          {showError(assignmentsError, 'Could not load policy assignments.')}
          <Stack spacing={1.5}>
            <TextField
              size="small"
              value={assignmentFilters.search}
              onChange={(event) =>
                setAssignmentFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search target, organization, policy, source, status, or reason"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:magnify" />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  label="Source"
                  value={assignmentFilters.targetType}
                  onChange={(event) =>
                    setAssignmentFilters((current) => ({
                      ...current,
                      targetType: event.target.value as AssignmentFilters['targetType'],
                    }))
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={assignmentFilters.status}
                  onChange={(event) =>
                    setAssignmentFilters((current) => ({
                      ...current,
                      status: event.target.value as AssignmentFilters['status'],
                    }))
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Payroll Policy</InputLabel>
                <Select
                  label="Payroll Policy"
                  value={assignmentFilters.payrollPolicyId}
                  onChange={(event) =>
                    setAssignmentFilters((current) => ({
                      ...current,
                      payrollPolicyId: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {payroll.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Attendance Policy</InputLabel>
                <Select
                  label="Attendance Policy"
                  value={assignmentFilters.attendancePolicyId}
                  onChange={(event) =>
                    setAssignmentFilters((current) => ({
                      ...current,
                      attendancePolicyId: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {attendance.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ md: 'center' }}
            >
              <TextField
                size="small"
                type="date"
                label="Active on"
                InputLabelProps={{ shrink: true }}
                value={assignmentFilters.activeOnDate}
                onChange={(event) =>
                  setAssignmentFilters((current) => ({
                    ...current,
                    activeOnDate: event.target.value,
                  }))
                }
                sx={{ minWidth: 180 }}
              />
              <TextField
                size="small"
                type="date"
                label="Effective from"
                InputLabelProps={{ shrink: true }}
                value={assignmentFilters.effectiveFrom}
                onChange={(event) =>
                  setAssignmentFilters((current) => ({
                    ...current,
                    effectiveFrom: event.target.value,
                  }))
                }
                sx={{ minWidth: 180 }}
              />
              <TextField
                size="small"
                type="date"
                label="Effective to"
                InputLabelProps={{ shrink: true }}
                value={assignmentFilters.effectiveTo}
                onChange={(event) =>
                  setAssignmentFilters((current) => ({
                    ...current,
                    effectiveTo: event.target.value,
                  }))
                }
                sx={{ minWidth: 180 }}
              />
              <Button
                variant="text"
                onClick={() => setAssignmentFilters(defaultAssignmentFilters())}
                startIcon={<Iconify icon="mdi:filter-remove-outline" />}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Card>
        <CustomizableTable
          tableId="hr-policy-assignments"
          columns={assignmentColumns}
          data={assignmentRows}
          isLoading={assignmentsLoading}
          isSearch={false}
          isFilter
          isPagination
          tableTitle="HR Policy Assignments"
          noDataText="No assignments match the current filters."
          tableContainerProps={{ sx: { maxHeight: 620 } }}
        />
      </Stack>
    );
  };

  const renderHoliday = () => (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Holiday Impact
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Work Calendar</InputLabel>
          <Select
            label="Work Calendar"
            value={selectedHolidayCalendarId || ''}
            onChange={(event) =>
              setHolidayFilters((current) => ({
                ...current,
                workCalendarPolicyId: event.target.value,
              }))
            }
          >
            {calendars.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Payroll Policy</InputLabel>
          <Select
            label="Payroll Policy"
            value={selectedHolidayPayrollId || ''}
            onChange={(event) =>
              setHolidayFilters((current) => ({ ...current, payrollPolicyId: event.target.value }))
            }
          >
            {payroll.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Attendance Policy</InputLabel>
          <Select
            label="Attendance Policy"
            value={selectedHolidayAttendanceId || ''}
            onChange={(event) =>
              setHolidayFilters((current) => ({
                ...current,
                attendancePolicyId: event.target.value,
              }))
            }
          >
            {attendance.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          type="month"
          label="Month"
          InputLabelProps={{ shrink: true }}
          value={holidayFilters.month}
          onChange={(event) =>
            setHolidayFilters((current) => ({
              ...current,
              month: event.target.value,
              fromDate: '',
              toDate: '',
            }))
          }
          sx={{ minWidth: 180 }}
        />
        <TextField
          size="small"
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={holidayFilters.fromDate}
          disabled={Boolean(holidayFilters.month)}
          onChange={(event) =>
            setHolidayFilters((current) => ({ ...current, fromDate: event.target.value }))
          }
        />
        <TextField
          size="small"
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={holidayFilters.toDate}
          disabled={Boolean(holidayFilters.month)}
          onChange={(event) =>
            setHolidayFilters((current) => ({ ...current, toDate: event.target.value }))
          }
        />
        <Button
          variant="text"
          onClick={() =>
            setHolidayFilters((current) => ({ ...current, month: '', fromDate: '', toDate: '' }))
          }
        >
          Clear Dates
        </Button>
      </Stack>
      {holidayImpactLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {showError(holidayImpactError, 'Could not load holiday impact.')}
      <SectionTable
        columns={[
          'Date',
          'Holiday',
          'Calendar',
          'Attendance',
          'Payroll',
          'Basis',
          'Difference',
          'Actions',
        ]}
      >
        {holidayImpact?.items?.length ? (
          holidayImpact.items.map((item) => (
            <TableRow
              key={`${item.calendarHolidayId}-${item.date}`}
              hover
              selected={item.hasDifference}
            >
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.holidayName}</TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2">
                    {item.workCalendarPolicyName || item.workCalendarPolicyId || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {toLabel(item.calendarSource)}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={item.isAttendanceWorkingDay ? 'Working' : 'Non-working'}
                    color={item.isAttendanceWorkingDay ? 'warning' : 'default'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={item.isPunchRequired ? 'Punch required' : 'No punch'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={toLabel(item.holidayWorkBehavior || item.attendanceImpact)}
                    variant="outlined"
                  />
                  {item.attendanceBehaviorText ? (
                    <Typography variant="caption">{item.attendanceBehaviorText}</Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={item.isPaidInPayroll ? 'Paid' : 'Unpaid'}
                    color={item.isPaidInPayroll ? 'success' : 'error'}
                    variant="outlined"
                  />
                  <Chip size="small" label={`${item.payableUnit ?? 0} unit`} variant="outlined" />
                  <Chip
                    size="small"
                    label={toLabel(item.payrollOverrideSource || item.payrollImpact)}
                    variant="outlined"
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Chip
                    size="small"
                    label={`${item.payrollBasisDayDelta ?? 0} basis day`}
                    color={(item.payrollBasisDayDelta ?? 0) < 0 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                  {item.payrollBasisImpactText ? (
                    <Typography variant="caption">{item.payrollBasisImpactText}</Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                {item.hasDifference ? <Chip size="small" color="warning" label="Review" /> : '-'}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Open payroll policy overrides">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const policy = payroll.find((row) => row.id === selectedHolidayPayrollId);
                      if (policy) openPayrollDrawer(policy);
                    }}
                  >
                    <Iconify icon="mdi:calendar-edit" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <EmptyRows colSpan={8} message="No holiday impact rows." />
        )}
      </SectionTable>
    </Card>
  );

  const renderEffective = () => (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Effective Preview
      </Typography>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <Autocomplete
          options={employeeOptions}
          getOptionLabel={optionLabel}
          sx={{ minWidth: 220, flex: 1 }}
          value={employeeOptions.find((item) => item.id === effectiveFilters.employeeId) || null}
          onChange={(_, value) =>
            setEffectiveFilters((current) => ({
              ...current,
              employeeId: value?.id || '',
              groupId: value?.id ? '' : current.groupId,
            }))
          }
          renderInput={(params) => <TextField {...params} label="Employee" size="small" />}
        />
        <Autocomplete
          options={groupOptions}
          getOptionLabel={optionLabel}
          sx={{ minWidth: 220, flex: 1 }}
          value={groupOptions.find((item) => item.id === effectiveFilters.groupId) || null}
          onChange={(_, value) =>
            setEffectiveFilters((current) => ({
              ...current,
              groupId: value?.id || '',
              employeeId: value?.id ? '' : current.employeeId,
            }))
          }
          renderInput={(params) => <TextField {...params} label="Group" size="small" />}
        />
        <TextField
          size="small"
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={effectiveFilters.date}
          onChange={(event) =>
            setEffectiveFilters((current) => ({ ...current, date: event.target.value }))
          }
        />
      </Stack>
      {effectiveLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {showError(effectiveError, 'Could not resolve effective policies.')}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Alert severity="info" sx={{ flex: 1 }}>
          Source: {effectivePreview?.policySource || '-'}
          {effectivePreview?.matchedTargetDisplayName
            ? ` (${effectivePreview.matchedTargetDisplayName})`
            : ''}
        </Alert>
        <Alert severity="success" sx={{ flex: 1 }}>
          Payroll: {effectivePreview?.payrollPolicy?.name || '-'} /{' '}
          {effectivePreview?.payrollWorkCalendarPolicy?.name || '-'}
        </Alert>
        <Alert severity="success" sx={{ flex: 1 }}>
          Attendance: {effectivePreview?.attendancePolicy?.name || '-'} /{' '}
          {effectivePreview?.attendanceWorkCalendarPolicy?.name || '-'}
        </Alert>
      </Stack>
      {effectivePreview?.resolutionSteps?.length ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Resolution Chain
          </Typography>
          <SectionTable columns={['Scope', 'Target', 'Status', 'Reason', 'Priority']}>
            {effectivePreview.resolutionSteps.map((step, index) => (
              <TableRow
                key={`${step.source}-${step.assignmentId || step.targetKey || index}`}
                hover
                selected={step.status === 'matched'}
              >
                <TableCell>{toLabel(step.targetType || step.source)}</TableCell>
                <TableCell>
                  {step.targetDisplayName || step.targetKey || 'Academic year default'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={toLabel(step.status)}
                    color={step.status === 'matched' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{toLabel(step.skipReason)}</TableCell>
                <TableCell>{step.priority ?? '-'}</TableCell>
              </TableRow>
            ))}
          </SectionTable>
        </Box>
      ) : null}
    </Card>
  );

  const renderAssignmentPreviewPanel = () => (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 1, bgcolor: (theme) => theme.vars.palette.background.neutral }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={700}>
            Assignment Preview
          </Typography>
          {assignmentPreviewLoading ? <Chip size="small" label="Resolving..." /> : null}
        </Stack>
        {assignmentPreviewError ? (
          <Alert severity="warning">
            {getErrorMessage(assignmentPreviewError, 'Could not resolve this assignment preview.')}
          </Alert>
        ) : null}
        <Box>
          <Typography variant="caption" color="text.secondary">
            This assignment applies to
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {assignmentForm.targetDisplayName || assignmentForm.targetKey || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {toLabel(assignmentForm.targetType)} ·{' '}
            {formatRange(assignmentForm.effectiveFrom, assignmentForm.effectiveTo)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`Payroll: ${
              payroll.find((item) => item.id === assignmentForm.payrollPolicyId)?.name || '-'
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`Attendance: ${
              attendance.find((item) => item.id === assignmentForm.attendancePolicyId)?.name || '-'
            }`}
            color="success"
            variant="outlined"
          />
        </Stack>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Current effective policy
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {assignmentPreview?.policySource
              ? `${toLabel(assignmentPreview.policySource)} scope`
              : `${toLabel(assignmentForm.targetType)} scope`}
            {assignmentPreview?.matchedPriority != null
              ? ` · Priority ${assignmentPreview.matchedPriority}`
              : assignmentForm.priority
                ? ` · Priority ${assignmentForm.priority}`
                : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {assignmentPreview?.matchedTargetDisplayName ||
              assignmentPreview?.matchedTargetKey ||
              assignmentForm.targetDisplayName ||
              assignmentForm.targetKey ||
              'No matching scope selected yet'}
          </Typography>
        </Box>
        <Divider />
        <Typography variant="caption" color="text.secondary">
          Precedence: Employee &gt; Shift &gt; Role &gt; Department &gt; Employee Type &gt; Default
        </Typography>
      </Stack>
    </Paper>
  );

  const renderImpactDrawer = () => (
    <Drawer
      anchor="right"
      open={Boolean(impactPreview)}
      onClose={closeImpactDrawer}
      PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}
    >
      <DrawerHeader title="Policy Impact" onClose={closeImpactDrawer} />
      <Divider />
      <Stack spacing={2} sx={{ p: 2.5 }}>
        {previewPolicyImpactState.isLoading || previewPolicyAssignmentImpactState.isLoading ? (
          <LinearProgress />
        ) : null}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={toLabel(impactPreview?.policyType)}
            color="primary"
            variant="outlined"
          />
          <Chip size="small" label={toLabel(impactPreview?.action)} variant="outlined" />
          <Chip
            size="small"
            label={`v${impactPreview?.currentVersion ?? '-'} -> v${impactPreview?.proposedVersion ?? '-'}`}
          />
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`${formatNumber(impactPreview?.affectedEmployeeCount)} employees`}
          />
          <Chip
            size="small"
            label={`${formatNumber(impactPreview?.affectedAssignmentCount)} assignments`}
          />
          <Chip
            size="small"
            label={`${formatNumber(impactPreview?.lockedPayrollMonths?.length)} locked months`}
            color={impactPreview?.lockedPayrollMonths?.length ? 'error' : 'default'}
          />
        </Stack>
        {impactPreview?.warnings?.map((warning) => (
          <Alert
            key={`${warning.code}-${warning.message}`}
            severity={warning.severity === 'blocking' ? 'error' : warning.severity}
          >
            {warning.message}
          </Alert>
        ))}
        {impactPreview?.requiresConfirmation ? (
          <Alert severity={impactPreview.blockingWarnings?.length ? 'error' : 'warning'}>
            {impactPreview.blockingWarnings?.length
              ? 'This action is blocked until the listed risks are resolved.'
              : `Confirmation is required${impactPreview.expiresAt ? ` before ${formatDate(impactPreview.expiresAt)}` : ''}.`}
          </Alert>
        ) : null}
        {impactPreview?.effectiveAssignmentConflicts?.length ? (
          <Alert severity="warning">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Effective policy conflicts
            </Typography>
            <Stack spacing={1}>
              {impactPreview.effectiveAssignmentConflicts.slice(0, 5).map((conflict) => (
                <Box key={`${conflict.employeeId}-${conflict.date}`}>
                  <Typography variant="body2" fontWeight={600}>
                    {conflict.employeeName || conflict.employeeId}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Winner:{' '}
                    {conflict.winningAssignment?.targetDisplayName ||
                      conflict.winningAssignment?.targetKey ||
                      '-'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Candidates:{' '}
                    {conflict.candidateAssignments
                      .map(
                        (candidate) =>
                          `${candidate.targetDisplayName || candidate.targetKey} (${candidate.status}: ${candidate.skipReason})`
                      )
                      .join(', ')}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Alert>
        ) : null}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Affected Employees
          </Typography>
          <SectionTable columns={['Employee', 'Department', 'Type']}>
            {impactPreview?.affectedEmployees?.length ? (
              impactPreview.affectedEmployees.map((employee) => (
                <TableRow key={employee.employeeId} hover>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">
                        {employee.employeeName || employee.employeeId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.employeeCode}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell>{employee.employeeType || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRows colSpan={3} message="No employees found in preview." />
            )}
          </SectionTable>
        </Box>
        {pendingImpactAction ? (
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={closeImpactDrawer}>Cancel</Button>
            <LoadingButton
              variant="contained"
              color="warning"
              disabled={Boolean(impactPreview?.blockingWarnings?.length)}
              onClick={confirmPendingImpactAction}
            >
              Confirm {pendingImpactAction.label}
            </LoadingButton>
          </Stack>
        ) : null}
      </Stack>
    </Drawer>
  );

  const renderAuditDrawer = () => (
    <Drawer
      anchor="right"
      open={Boolean(auditTarget)}
      onClose={() => setAuditTarget(null)}
      PaperProps={{ sx: { width: { xs: '100%', md: 520 } } }}
    >
      <DrawerHeader title="Audit Trail" onClose={() => setAuditTarget(null)} />
      <Divider />
      <Stack spacing={2} sx={{ p: 2.5 }}>
        {auditLoading || auditEventsLoading ? <LinearProgress /> : null}
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">
            {auditTarget?.title || auditSummary?.name || 'Audit Trail'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {auditTarget?.entityType ? toLabel(auditTarget.entityType) : 'HR audit event timeline'}
          </Typography>
        </Stack>
        {auditSummary ? (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Created by {auditSummary.createdByName || auditSummary.creatorId || 'Unknown'} on{' '}
              {formatDate(auditSummary.creationTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last edited by{' '}
              {auditSummary.lastModifiedByName || auditSummary.lastModifierId || 'Unknown'} on{' '}
              {formatDate(auditSummary.lastModificationTime)}
            </Typography>
          </Stack>
        ) : null}
        <Divider />
        {(auditEvents?.items || []).length ? (
          <Stack spacing={1.5}>
            {auditEvents!.items.map((event) => (
              <Paper key={event.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Chip
                      size="small"
                      label={toLabel(event.action)}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.occurredAt)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>
                    {event.summary}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {event.actorNameSnapshot || event.actorUserId || 'Unknown actor'}
                  </Typography>
                  {event.reason ? (
                    <Typography variant="body2">Reason: {event.reason}</Typography>
                  ) : null}
                  {event.changedFields?.length ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Field</TableCell>
                          <TableCell>Before</TableCell>
                          <TableCell>After</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {event.changedFields.slice(0, 8).map((field) => (
                          <TableRow key={field.field}>
                            <TableCell>{toLabel(field.field)}</TableCell>
                            <TableCell>{field.oldValue || '-'}</TableCell>
                            <TableCell>{field.newValue || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                  {event.contextJson ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      Context: {event.contextJson}
                    </Typography>
                  ) : null}
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : auditSummary ? (
          <Stack spacing={1.5}>
            {(auditSummary.events || []).length ? (
              auditSummary.events!.map((event, index) => (
                <Paper
                  key={`${event.timestamp}-${event.action}-${index}`}
                  variant="outlined"
                  sx={{ p: 1.5 }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={700}>
                      {toLabel(event.action)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.timestamp)} ·{' '}
                      {event.actorName || event.actorId || 'Unknown actor'}
                    </Typography>
                    {event.sourceMethod ? (
                      <Typography variant="caption" color="text.secondary">
                        {event.sourceMethod}
                      </Typography>
                    ) : null}
                    {event.changedFieldsSummary ? (
                      <Typography variant="body2">{event.changedFieldsSummary}</Typography>
                    ) : null}
                  </Stack>
                </Paper>
              ))
            ) : (
              <Alert severity="info">No detailed audit events found.</Alert>
            )}
          </Stack>
        ) : (
          <Alert severity="info">No detailed audit events found.</Alert>
        )}
      </Stack>
    </Drawer>
  );

  const renderVersionDrawer = () => {
    const versions = versionHistory?.items || [];
    return (
      <Drawer
        anchor="right"
        open={Boolean(versionTarget)}
        onClose={() => setVersionTarget(null)}
        PaperProps={{ sx: { width: { xs: '100%', md: 720 } } }}
      >
        <DrawerHeader title="Policy Versions" onClose={() => setVersionTarget(null)} />
        <Divider />
        <Stack spacing={2} sx={{ p: 2.5 }}>
          {versionHistoryLoading || versionCompareLoading ? <LinearProgress /> : null}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">{versionTarget?.policyName}</Typography>
            <Typography variant="caption" color="text.secondary">
              Immutable snapshots created after policy changes. Restore creates a draft and does not
              modify the active policy.
            </Typography>
          </Stack>
          <SectionTable columns={['Version', 'Action', 'Created', 'Reason', 'Actions']}>
            {versions.length ? (
              versions.map((version) => (
                <TableRow
                  key={version.id}
                  hover
                  selected={
                    compareVersionIds.from === version.id || compareVersionIds.to === version.id
                  }
                >
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">v{version.versionNumber}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {toLabel(version.status)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{toLabel(version.changeAction)}</TableCell>
                  <TableCell>{formatDate(version.creationTime)}</TableCell>
                  <TableCell>{version.changeReason || '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Compare from this version">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCompareVersionIds((current) => ({ ...current, from: version.id }))
                        }
                      >
                        <Iconify icon="mdi:compare-horizontal" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compare to this version">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCompareVersionIds((current) => ({ ...current, to: version.id }))
                        }
                      >
                        <Iconify icon="mdi:compare" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore as draft">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!canClonePolicy || restoreVersionState.isLoading}
                          onClick={() => restoreVersionAsDraft(version)}
                        >
                          <Iconify icon="mdi:file-restore-outline" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRows colSpan={5} message="No policy versions captured yet." />
            )}
          </SectionTable>
          {versionCompare ? (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  Comparing v{versionCompare.fromVersion.versionNumber} to v
                  {versionCompare.toVersion.versionNumber}
                </Typography>
                <SectionTable columns={['Field', 'From', 'To']}>
                  {versionCompare.differences.length ? (
                    versionCompare.differences.map((diff) => (
                      <TableRow key={diff.field}>
                        <TableCell>{toLabel(diff.field)}</TableCell>
                        <TableCell sx={{ maxWidth: 240, wordBreak: 'break-word' }}>
                          {diff.fromValue || '-'}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 240, wordBreak: 'break-word' }}>
                          {diff.toValue || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <EmptyRows colSpan={3} message="No differences found." />
                  )}
                </SectionTable>
              </Stack>
            </Paper>
          ) : versions.length >= 2 ? (
            <Alert severity="info">Select one version as “from” and one as “to” to compare.</Alert>
          ) : null}
        </Stack>
      </Drawer>
    );
  };

  const importCentralHolidays = async () => {
    if (!academicYearId) {
      setHolidayReviewError('Select an academic year before importing central holidays.');
      return;
    }
    setHolidayReviewError('');
    setHolidayReviewInfo('');
    try {
      const rows = centralHolidayPreviewRows.length
        ? centralHolidayPreviewRows
        : await loadHolidayImportPreview({ academicYearId }).unwrap();
      setCentralHolidayPreviewRows(rows);
      if (!rows.length) {
        setHolidayReviewInfo(
          'No central holidays found for this academic year. Add manual holidays or create holidays in Calendar first.'
        );
        return;
      }
      setCalendarForm((current) => ({
        ...current,
        holidays: mergeHolidayRows(current.holidays, rows),
      }));
      const importedCount = countNewHolidayRows(calendarForm.holidays, rows);
      toast.success(
        importedCount
          ? `${importedCount} central holidays added`
          : 'Central holidays are already in this work calendar'
      );
    } catch (error) {
      setHolidayReviewError(getErrorMessage(error, 'Could not import central holidays.'));
    }
  };

  const openManualHolidayDialog = (index?: number) => {
    const existing = typeof index === 'number' ? calendarForm.holidays[index] : null;
    setEditingManualHolidayIndex(typeof index === 'number' ? index : null);
    setManualHolidayForm(
      existing
        ? {
            holidayName: existing.holidayName,
            fromDate: toDateInput(getHolidayFromDate(existing)),
            toDate: toDateInput(getHolidayToDate(existing)),
            notes: existing.notes || '',
          }
        : { holidayName: '', fromDate: '', toDate: '', notes: '' }
    );
    setFormError('');
    setManualHolidayDialogOpen(true);
  };

  const closeManualHolidayDialog = () => {
    setManualHolidayDialogOpen(false);
    setEditingManualHolidayIndex(null);
    setManualHolidayForm({ holidayName: '', fromDate: '', toDate: '', notes: '' });
  };

  const saveManualHoliday = () => {
    const toDate = manualHolidayForm.toDate || manualHolidayForm.fromDate;
    if (
      !academicYearId ||
      !manualHolidayForm.holidayName.trim() ||
      !manualHolidayForm.fromDate ||
      !toDate
    ) {
      setFormError('Manual holiday name, from date, and to date are required.');
      return;
    }
    if (dayjs(toDate).isBefore(dayjs(manualHolidayForm.fromDate), 'day')) {
      setFormError('Manual holiday to date must be on or after from date.');
      return;
    }
    if (
      !isHolidayRangeInsideRange(
        manualHolidayForm.fromDate,
        toDate,
        calendarForm.effectiveFrom,
        calendarForm.effectiveTo
      )
    ) {
      setFormError('Manual holiday range must be inside the work calendar effective date range.');
      return;
    }
    const row: WorkCalendarHoliday = {
      academicYearId,
      date: manualHolidayForm.fromDate,
      fromDate: manualHolidayForm.fromDate,
      toDate,
      dayCount: dayjs(toDate).diff(dayjs(manualHolidayForm.fromDate), 'day') + 1,
      holidayName: manualHolidayForm.holidayName.trim(),
      source: 'manual',
      calendarHolidayId: null,
      isIncluded: true,
      notes: manualHolidayForm.notes.trim() || null,
    };
    setCalendarForm((current) => ({
      ...current,
      holidays:
        editingManualHolidayIndex === null
          ? mergeHolidayRows(current.holidays, [row])
          : current.holidays
              .map((item, itemIndex) =>
                itemIndex === editingManualHolidayIndex ? { ...item, ...row } : item
              )
              .sort(
                (left, right) =>
                  dayjs(getHolidayFromDate(left)).valueOf() -
                  dayjs(getHolidayFromDate(right)).valueOf()
              ),
    }));
    setFormError('');
    closeManualHolidayDialog();
  };

  const updateCalendarHoliday = (index: number, changes: Partial<WorkCalendarHoliday>) => {
    setCalendarForm((current) => ({
      ...current,
      holidays: current.holidays.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item
      ),
    }));
  };

  const removeManualHoliday = (index: number) => {
    setCalendarForm((current) => ({
      ...current,
      holidays: current.holidays.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const renderDrawerContent = () => {
    if (!drawer) return null;
    if (drawer.kind === 'calendar') {
      const previewWeeklyOffs = getWeeklyOffsForRule(
        calendarForm.weeklyOffPattern,
        calendarForm.customWeeklyOffs
      );
      const previewWorkingDays = getWorkingDaysForRule(
        calendarForm.weeklyOffPattern,
        calendarForm.customWeeklyOffs
      );
      const holidaySummary = getHolidaySummary(calendarForm.holidays);
      const holidayMonthOptions = getHolidayMonthOptions([
        ...calendarForm.holidays,
        ...centralHolidayPreviewRows,
      ]);
      const filtersActive = Boolean(
        holidayReviewFilters.search ||
        holidayReviewFilters.month ||
        holidayReviewFilters.source !== 'all'
      );
      const hasCentralPreview = centralHolidayPreviewRows.length > 0;
      const hasFinalizedHolidays = calendarForm.holidays.length > 0;
      const reviewHolidayRows = hasFinalizedHolidays
        ? calendarForm.holidays
        : centralHolidayPreviewRows;
      const filteredHolidays = reviewHolidayRows.filter((holiday) => {
        const search = holidayReviewFilters.search.trim().toLowerCase();
        const matchesSearch = !search || holiday.holidayName.toLowerCase().includes(search);
        const matchesMonth =
          !holidayReviewFilters.month ||
          dayjs(getHolidayFromDate(holiday)).format('YYYY-MM') === holidayReviewFilters.month;
        const matchesSource =
          holidayReviewFilters.source === 'all' ||
          (holidayReviewFilters.source === 'included' && holiday.isIncluded) ||
          (holidayReviewFilters.source === 'removed' && !holiday.isIncluded) ||
          holiday.source === holidayReviewFilters.source;
        return matchesSearch && matchesMonth && matchesSource;
      });
      return (
        <PolicyDrawerLayout
          title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Work Calendar`}
          subtitle="Define the active working pattern and holiday set used by attendance and payroll policies."
          error={formError}
          onClose={closeDrawer}
          onSave={saveCalendar}
          disabled={drawer.mode === 'edit' ? !canEditPolicy : !canCreatePolicy}
          loading={createCalendarState.isLoading || updateCalendarState.isLoading}
        >
          <PolicySection title="Policy Details">
            <DrawerFormGrid>
              <DrawerField label="Name *">
                <TextField
                  fullWidth
                  size="small"
                  value={calendarForm.name}
                  onChange={(event) =>
                    setCalendarForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </DrawerField>
              <DrawerSelectField
                label="Status"
                value={calendarForm.status}
                onChange={(event) =>
                  setCalendarForm((current) => ({
                    ...current,
                    status: event.target.value as PolicyStatus,
                  }))
                }
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </DrawerSelectField>
              <DrawerField label="Effective From *">
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={calendarForm.effectiveFrom}
                  onChange={(event) =>
                    setCalendarForm((current) => ({
                      ...current,
                      effectiveFrom: event.target.value,
                    }))
                  }
                />
              </DrawerField>
              <DrawerField label="Effective To">
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={calendarForm.effectiveTo}
                  onChange={(event) =>
                    setCalendarForm((current) => ({ ...current, effectiveTo: event.target.value }))
                  }
                />
              </DrawerField>
            </DrawerFormGrid>
          </PolicySection>
          <PolicySection
            title="Weekly Schedule"
            description="Weekly offs repeat every week. Use Holiday Rules for one-time dates."
          >
            <DrawerFormGrid>
              <DrawerSelectField
                label="Weekly Rule *"
                value={calendarForm.weeklyOffPattern}
                onChange={(event) =>
                  setCalendarForm((current) => ({
                    ...current,
                    weeklyOffPattern: event.target.value,
                  }))
                }
              >
                {weeklyRuleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </DrawerSelectField>
              <Box>
                <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'action.hover', height: 1 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Weekly preview
                    </Typography>
                    <Typography variant="body2">
                      Working days: {formatWeekDays(previewWorkingDays)}
                    </Typography>
                    <Typography variant="body2">
                      Weekly offs: {formatWeekDays(previewWeeklyOffs)}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </DrawerFormGrid>
            {calendarForm.weeklyOffPattern === 'custom' ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Select weekly off days</Typography>
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {weekdayOptions.map((day) => {
                    const selected = calendarForm.customWeeklyOffs.includes(day.value);
                    return (
                      <Chip
                        key={day.value}
                        clickable
                        label={day.short}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        onClick={() =>
                          setCalendarForm((current) => ({
                            ...current,
                            customWeeklyOffs: selected
                              ? current.customWeeklyOffs.filter((item) => item !== day.value)
                              : sortWeekDays([...current.customWeeklyOffs, day.value]),
                          }))
                        }
                      />
                    );
                  })}
                </Stack>
              </Stack>
            ) : null}
          </PolicySection>
          <PolicySection
            title="Holiday Review"
            description="These holidays belong to this work calendar. Payroll and Attendance policies decide how each holiday is treated."
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
              >
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <HolidayMetricCard
                    label="Central Available"
                    value={centralHolidayPreviewRows.length}
                  />
                  <HolidayMetricCard
                    label="Included"
                    value={holidaySummary.included}
                    color="success.main"
                  />
                  <HolidayMetricCard
                    label="Removed"
                    value={holidaySummary.removed}
                    color="warning.main"
                  />
                  <HolidayMetricCard
                    label="Manual"
                    value={holidaySummary.manual}
                    color="info.main"
                  />
                </Stack>
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:calendar-import" />}
                  disabled={!academicYearId}
                  loading={loadHolidayImportPreviewState.isFetching}
                  onClick={importCentralHolidays}
                >
                  {hasFinalizedHolidays ? 'Import from central Calendar' : 'Add all to calendar'}
                </LoadingButton>
              </Stack>
              {holidayReviewError ? <Alert severity="error">{holidayReviewError}</Alert> : null}
              {holidayReviewInfo ? <Alert severity="info">{holidayReviewInfo}</Alert> : null}
              {!academicYearId ? (
                <Alert severity="warning">
                  Select an academic year before importing central holidays.
                </Alert>
              ) : null}
              {academicYearId && !hasFinalizedHolidays && hasCentralPreview ? (
                <Alert severity="info">
                  {centralHolidayPreviewRows.length} central holidays are available. Review them,
                  then add all to this work calendar.
                </Alert>
              ) : null}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: filtersActive
                      ? 'minmax(0, 1fr) minmax(180px, 220px) auto'
                      : 'minmax(0, 1fr) minmax(180px, 220px)',
                  },
                  gap: 1.25,
                  alignItems: 'flex-end',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search holiday name"
                    value={holidayReviewFilters.search}
                    onChange={(event) =>
                      setHolidayReviewFilters((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="mdi:magnify" width={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <DrawerField label="Month">
                    <FormControl fullWidth size="small">
                      <Select
                        value={holidayReviewFilters.month}
                        onChange={(event) =>
                          setHolidayReviewFilters((current) => ({
                            ...current,
                            month: event.target.value,
                          }))
                        }
                      >
                        <MenuItem value="">All months</MenuItem>
                        {holidayMonthOptions.map((month) => (
                          <MenuItem key={month} value={month}>
                            {dayjs(`${month}-01`).format('MMM YYYY')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </DrawerField>
                </Box>
                {filtersActive ? (
                  <Button
                    size="small"
                    sx={{ whiteSpace: 'nowrap' }}
                    onClick={() =>
                      setHolidayReviewFilters({ search: '', month: '', source: 'all' })
                    }
                  >
                    Clear filters
                  </Button>
                ) : null}
              </Box>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {[
                  ['all', 'All'],
                  ['included', 'Included'],
                  ['removed', 'Removed'],
                  ['central_calendar', 'Central'],
                  ['manual', 'Manual'],
                ].map(([value, label]) => (
                  <Chip
                    key={value}
                    size="small"
                    clickable
                    label={label}
                    color={holidayReviewFilters.source === value ? 'primary' : 'default'}
                    variant={holidayReviewFilters.source === value ? 'filled' : 'outlined'}
                    onClick={() =>
                      setHolidayReviewFilters((current) => ({
                        ...current,
                        source: value as HolidayReviewFilter,
                      }))
                    }
                  />
                ))}
              </Stack>
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => openManualHolidayDialog()}
                  startIcon={<Iconify icon="mdi:plus" />}
                >
                  Add Manual Holiday
                </Button>
              </Stack>
              {loadCalendarHolidaysState.isFetching ? <LinearProgress /> : null}
              <TableContainer
                sx={{
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  borderRadius: 1,
                  maxHeight: 360,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        'Date / Range',
                        'Days',
                        'Holiday',
                        'Source',
                        'Status',
                        'Notes',
                        'Actions',
                      ].map((column) => (
                        <TableCell key={column} align={column === 'Actions' ? 'right' : 'left'}>
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHolidays.length ? (
                      filteredHolidays.map((holiday) => {
                        const originalIndex = calendarForm.holidays.indexOf(holiday);
                        return (
                          <TableRow
                            key={`${holiday.calendarHolidayId || holiday.holidayName}-${getHolidayFromDate(holiday)}-${getHolidayToDate(holiday)}-${originalIndex}`}
                            hover
                            sx={{ opacity: holiday.isIncluded ? 1 : 0.55 }}
                          >
                            <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 190 }}>
                              {formatHolidayDateRange(holiday)}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {getHolidayDayCount(holiday)}
                            </TableCell>
                            <TableCell sx={{ minWidth: 180 }}>{holiday.holidayName}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={holiday.source === 'manual' ? 'Manual' : 'Central'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color={
                                  hasFinalizedHolidays
                                    ? holiday.isIncluded
                                      ? 'success'
                                      : 'default'
                                    : 'info'
                                }
                                label={
                                  hasFinalizedHolidays
                                    ? holiday.isIncluded
                                      ? 'Included'
                                      : 'Removed'
                                    : 'Available'
                                }
                                variant={holiday.isIncluded ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: 220, maxWidth: 300 }}>
                              <Tooltip
                                title={holiday.notes || ''}
                                disableHoverListener={!holiday.notes}
                              >
                                <Typography variant="body2" noWrap>
                                  {holiday.notes || '-'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {!hasFinalizedHolidays ? (
                                <Typography variant="caption" color="text.secondary">
                                  Add all first
                                </Typography>
                              ) : holiday.source === 'manual' ? (
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                  <Tooltip title="Edit manual holiday">
                                    <IconButton
                                      size="small"
                                      onClick={() => openManualHolidayDialog(originalIndex)}
                                    >
                                      <Iconify icon="mdi:pencil-outline" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete manual holiday">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => removeManualHoliday(originalIndex)}
                                    >
                                      <Iconify icon="mdi:delete-outline" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              ) : (
                                <Tooltip
                                  title={
                                    holiday.isIncluded
                                      ? 'Remove from this calendar'
                                      : 'Restore to calendar'
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    color={holiday.isIncluded ? 'error' : 'primary'}
                                    onClick={() =>
                                      updateCalendarHoliday(originalIndex, {
                                        isIncluded: !holiday.isIncluded,
                                      })
                                    }
                                  >
                                    <Iconify
                                      icon={
                                        holiday.isIncluded ? 'mdi:trash-can-outline' : 'mdi:restore'
                                      }
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <EmptyRows
                        colSpan={7}
                        message={
                          hasCentralPreview && !hasFinalizedHolidays
                            ? 'Central holidays are available. Add them to finalize this calendar.'
                            : 'No holidays match current filters.'
                        }
                      />
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary">
                  Save summary
                </Typography>
                <Typography variant="body2">
                  This calendar will store {holidaySummary.included} included holidays,{' '}
                  {holidaySummary.removed} removed central holidays, and {holidaySummary.manual}{' '}
                  manual holidays.
                </Typography>
              </Paper>
            </Stack>
          </PolicySection>
        </PolicyDrawerLayout>
      );
    }
    if (drawer.kind === 'payroll') {
      const selectedPayrollCalendar = calendars.find(
        (item) => item.id === payrollForm.workCalendarPolicyId
      );
      const payrollBasisPreviewRows = buildPayrollBasisPreviewRows({
        academicYearStart: currentYear?.startDate,
        academicYearEnd: currentYear?.endDate,
        calendar: selectedPayrollCalendar,
        dayCalculationType: payrollForm.dayCalculationType,
        saturdayWorkPolicy: payrollForm.saturdayWorkPolicy,
        manualMonthDays: payrollForm.manualMonthDays,
      });
      const payrollPreviewMode = normalizePayrollDayCalculationType(payrollForm.dayCalculationType);
      const payrollPreviewTotalBasis = payrollBasisPreviewRows.reduce(
        (total, row) => total + (row.basisDays ?? 0),
        0
      );
      const payrollPreviewMissingManualDays =
        payrollPreviewMode === 'manual-days' &&
        payrollBasisPreviewRows.some((row) => row.basisDays == null);
      const saturdayPolicyLabel =
        payrollSaturdayPolicyOptions.find(
          (option) => option.value === payrollForm.saturdayWorkPolicy
        )?.label || 'Full Day';
      const calendarDaysManualMap = buildCalendarDaysMap(
        currentYear?.startDate,
        currentYear?.endDate
      );
      const selectPayrollDayCalculationType = (value: string) => {
        setPayrollForm((current) => ({
          ...current,
          dayCalculationType: value,
          manualMonthDays:
            value === 'manual-days'
              ? buildManualMonthDaysMap({
                  academicYearStart: currentYear?.startDate,
                  academicYearEnd: currentYear?.endDate,
                  existing: Object.keys(current.manualMonthDays).length
                    ? current.manualMonthDays
                    : calendarDaysManualMap,
                })
              : current.manualMonthDays,
        }));
      };
      const copyCalendarDaysToManualMonths = () => {
        setPayrollForm((current) => ({
          ...current,
          manualMonthDays: buildManualMonthDaysMap({
            academicYearStart: currentYear?.startDate,
            academicYearEnd: currentYear?.endDate,
            existing: calendarDaysManualMap,
          }),
        }));
      };
      return (
        <PolicyDrawerLayout
          title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Payroll Policy`}
          subtitle="Configure how salary basis days are calculated for payroll preview, lock, and salary slips."
          error={formError}
          onClose={closeDrawer}
          onSave={savePayroll}
          disabled={drawer.mode === 'edit' ? !canEditPolicy : !canCreatePolicy}
          loading={createPayrollState.isLoading || updatePayrollState.isLoading}
        >
          <PolicySection title="Policy Details">
            <DrawerFormGrid alignItems="center">
              <DrawerField label="Name *">
                <TextField
                  fullWidth
                  size="small"
                  value={payrollForm.name}
                  onChange={(event) =>
                    setPayrollForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </DrawerField>
              <DrawerSelectField
                label="Status"
                value={payrollForm.status}
                onChange={(event) =>
                  setPayrollForm((current) => ({
                    ...current,
                    status: event.target.value as PolicyStatus,
                  }))
                }
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </DrawerSelectField>
              <DrawerSelectField
                label="Work Calendar *"
                value={payrollForm.workCalendarPolicyId}
                onChange={(event) =>
                  setPayrollForm((current) => ({
                    ...current,
                    workCalendarPolicyId: event.target.value,
                  }))
                }
              >
                {activeCalendars.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </DrawerSelectField>
              <DrawerSwitchField
                label="Default policy"
                checked={payrollForm.isDefault}
                disabled={payrollForm.status !== 'active'}
                onChange={(checked) =>
                  setPayrollForm((current) => ({ ...current, isDefault: checked }))
                }
              />
            </DrawerFormGrid>
          </PolicySection>
          <PolicySection
            title="Payroll Day Calculation"
            description="Choose the salary proration basis for preview, lock, and slips."
          >
            <Stack spacing={1.75}>
              <DrawerFormGrid columns={3}>
                {payrollDayCalculationOptions.map((option) => {
                  const selected =
                    normalizePayrollDayCalculationType(payrollForm.dayCalculationType) ===
                    option.value;
                  return (
                    <Box key={option.value}>
                      <Paper
                        variant="outlined"
                        role="button"
                        tabIndex={0}
                        onClick={() => selectPayrollDayCalculationType(option.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            selectPayrollDayCalculationType(option.value);
                          }
                        }}
                        sx={{
                          p: 1.25,
                          height: 1,
                          minHeight: 84,
                          cursor: 'pointer',
                          borderColor: selected ? 'primary.main' : 'divider',
                          borderWidth: 1,
                          bgcolor: (theme) =>
                            selected
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(0, 167, 111, 0.1)'
                                : 'rgba(0, 167, 111, 0.06)'
                              : 'background.paper',
                          transition: (theme) =>
                            theme.transitions.create(['background-color', 'border-color'], {
                              duration: theme.transitions.duration.shortest,
                            }),
                          '&:hover': {
                            borderColor: selected ? 'primary.main' : 'text.secondary',
                            bgcolor: selected ? undefined : 'action.hover',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Iconify
                            icon={selected ? 'mdi:radiobox-marked' : 'mdi:radiobox-blank'}
                            color={selected ? 'primary.main' : 'text.secondary'}
                            width={19}
                          />
                          <Stack spacing={0.35}>
                            <Typography variant="subtitle2">{option.label}</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1.35 }}
                            >
                              {option.description}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    </Box>
                  );
                })}
              </DrawerFormGrid>
              <Paper variant="outlined" sx={{ px: 1.25, py: 1, bgcolor: 'background.default' }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.25}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack spacing={0.25}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography variant="subtitle2">Saturday</Typography>
                      <Chip size="small" variant="outlined" label={saturdayPolicyLabel} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Applies only when Saturdays are working days.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {payrollSaturdayPolicyOptions.map((option) => {
                      const selected = payrollForm.saturdayWorkPolicy === option.value;
                      return (
                        <Tooltip key={option.value} title={option.description} arrow>
                          <Button
                            key={option.value}
                            size="small"
                            variant={selected ? 'contained' : 'outlined'}
                            color={selected ? 'primary' : 'inherit'}
                            onClick={() =>
                              setPayrollForm((current) => ({
                                ...current,
                                saturdayWorkPolicy: option.value,
                              }))
                            }
                            sx={{
                              minWidth: 70,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {selected ? <Iconify icon="mdi:check" width={16} /> : null}
                            {option.label}
                          </Button>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </PolicySection>
          <PolicySection
            title="Academic Year Preview"
            description="This preview estimates the payroll denominator used for proration. Final payroll may also depend on locked attendance and holiday overrides."
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Academic year: ${formatRange(currentYear?.startDate, currentYear?.endDate)}`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Mode: ${toLabel(payrollPreviewMode)}`}
                />
                <Chip size="small" variant="outlined" label={`Saturday: ${saturdayPolicyLabel}`} />
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`Total basis: ${formatBasisDays(payrollPreviewTotalBasis)}`}
                />
              </Stack>
              {payrollPreviewMode === 'manual-days' ? (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Typography variant="body2" color="text.secondary">
                    Calendar days are filled by default. Edit only the months that need a different
                    payroll basis.
                  </Typography>
                  <Button size="small" variant="outlined" onClick={copyCalendarDaysToManualMonths}>
                    Copy calendar days
                  </Button>
                </Stack>
              ) : null}
              {!selectedPayrollCalendar ? (
                <Alert severity="warning">
                  Select a work calendar to preview working-day basis correctly.
                </Alert>
              ) : null}
              {payrollPreviewMissingManualDays ? (
                <Alert severity="warning">
                  Manual Days mode needs valid payroll basis days for every month in the academic
                  year.
                </Alert>
              ) : null}
              <TableContainer
                sx={{
                  border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                  borderRadius: 1,
                  maxHeight: 320,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        'Month',
                        'Calendar Days',
                        'Saturdays',
                        'Saturday Units',
                        'Working Units',
                        'Holiday Units Excluded',
                        'Payroll Basis Days',
                        'Calculation Source',
                      ].map((column) => (
                        <TableCell key={column}>{column}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payrollBasisPreviewRows.length ? (
                      payrollBasisPreviewRows.map((row) => (
                        <TableRow
                          key={row.monthKey}
                          hover
                          sx={{
                            bgcolor: row.isCurrentMonth ? 'action.hover' : 'inherit',
                          }}
                        >
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.monthLabel}</TableCell>
                          <TableCell>{row.calendarDays}</TableCell>
                          <TableCell>{row.saturdayCount}</TableCell>
                          <TableCell
                            sx={{
                              color:
                                payrollPreviewMode === 'working-days'
                                  ? 'primary.main'
                                  : 'text.primary',
                              fontWeight: payrollPreviewMode === 'working-days' ? 700 : 400,
                            }}
                          >
                            {formatBasisDays(row.saturdayUnits)}
                          </TableCell>
                          <TableCell
                            sx={{
                              color:
                                payrollPreviewMode === 'working-days'
                                  ? 'primary.main'
                                  : 'text.primary',
                              fontWeight: payrollPreviewMode === 'working-days' ? 700 : 400,
                            }}
                          >
                            {formatBasisDays(row.workingUnits)}
                          </TableCell>
                          <TableCell>{formatBasisDays(row.holidayUnitsExcluded)}</TableCell>
                          <TableCell>
                            {payrollPreviewMode === 'manual-days' ? (
                              <TextField
                                size="small"
                                type="number"
                                value={payrollForm.manualMonthDays[row.monthKey] || ''}
                                error={
                                  Boolean(payrollForm.manualMonthDays[row.monthKey]) &&
                                  !isValidManualDayCount(
                                    numberOrNull(payrollForm.manualMonthDays[row.monthKey])
                                  )
                                }
                                inputProps={{ min: 1, max: 31, step: 1 }}
                                sx={{ width: 120 }}
                                onChange={(event) =>
                                  setPayrollForm((current) => ({
                                    ...current,
                                    manualMonthDays: {
                                      ...current.manualMonthDays,
                                      [row.monthKey]: event.target.value,
                                    },
                                  }))
                                }
                              />
                            ) : (
                              <Typography variant="subtitle2">
                                {formatBasisDays(row.basisDays)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{row.source}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <EmptyRows
                        colSpan={8}
                        message="Select an academic year with valid start and end dates to preview payroll basis days."
                      />
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </PolicySection>
        </PolicyDrawerLayout>
      );
    }
    if (drawer.kind === 'attendance') {
      return (
        <PolicyDrawerLayout
          title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Attendance Policy`}
          subtitle="Start with the standard school setup. Use Advanced Settings only when the school has special attendance rules."
          error={formError}
          onClose={closeDrawer}
          onSave={saveAttendance}
          disabled={drawer.mode === 'edit' ? !canEditPolicy : !canCreatePolicy}
          loading={createAttendanceState.isLoading || updateAttendanceState.isLoading}
        >
          <PolicySection title="Policy Details">
            <DrawerFormGrid columns={4} rowGap={1.5} alignItems="center">
              <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                <DrawerField label="Name *">
                  <TextField
                    fullWidth
                    size="small"
                    value={attendanceForm.name}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </DrawerField>
              </Box>
              <DrawerSelectField
                label="Status"
                value={attendanceForm.status}
                onChange={(event) =>
                  setAttendanceForm((current) => ({
                    ...current,
                    status: event.target.value as PolicyStatus,
                  }))
                }
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </DrawerSelectField>
              <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                <DrawerSelectField
                  label="Work Calendar *"
                  value={attendanceForm.workCalendarPolicyId}
                  onChange={(event) =>
                    setAttendanceForm((current) => ({
                      ...current,
                      workCalendarPolicyId: event.target.value,
                    }))
                  }
                >
                  {activeCalendars.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </DrawerSelectField>
              </Box>
              <DrawerSwitchField
                compact
                label="Default policy"
                checked={attendanceForm.isDefault}
                disabled={attendanceForm.status !== 'active'}
                onChange={(checked) =>
                  setAttendanceForm((current) => ({ ...current, isDefault: checked }))
                }
              />
            </DrawerFormGrid>
          </PolicySection>
          <PolicySection
            title="Attendance Thresholds"
            description="Set the worked-time percentages used to classify full-day and half-day attendance."
          >
            <DrawerFormGrid>
              <DrawerField
                label="Full day threshold"
                help="Minimum worked time percentage required to count the day as a full day."
              >
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={attendanceForm.fullDayThresholdPercentage}
                  onChange={(event) =>
                    setAttendanceForm((current) => ({
                      ...current,
                      fullDayThresholdPercentage: event.target.value,
                    }))
                  }
                />
              </DrawerField>
              <DrawerField
                label="Half day threshold"
                help="Minimum worked time percentage required to count the day as a half day."
              >
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={attendanceForm.halfDayThresholdPercentage}
                  onChange={(event) =>
                    setAttendanceForm((current) => ({
                      ...current,
                      halfDayThresholdPercentage: event.target.value,
                    }))
                  }
                />
              </DrawerField>
            </DrawerFormGrid>
          </PolicySection>
          <Alert severity="info" sx={{ mb: 2 }}>
            Standard setup uses 75% for full day, 50% for half day, missing punches require review,
            manual correction is allowed, and payroll impact remains visible.
          </Alert>
          <PolicySection title="Exceptions">
            <DrawerFormGrid columns={3} rowGap={1} alignItems="center">
              <DrawerSelectField
                label="Missing Punch"
                help="Controls what happens when an employee has incomplete punch data for the day."
                value={attendanceForm.missingPunchBehavior}
                onChange={(event) =>
                  setAttendanceForm((current) => ({
                    ...current,
                    missingPunchBehavior: event.target.value,
                  }))
                }
              >
                <MenuItem value="requires_review">Requires Review</MenuItem>
                <MenuItem value="mark_absent">Mark Absent</MenuItem>
                <MenuItem value="ignore">Ignore</MenuItem>
              </DrawerSelectField>
              <DrawerSwitchField
                compact
                label="Manual correction"
                help="Allows HR users to correct attendance records manually when punch data is wrong or incomplete."
                checked={attendanceForm.manualCorrectionAllowed}
                onChange={(checked) =>
                  setAttendanceForm((current) => ({ ...current, manualCorrectionAllowed: checked }))
                }
              />
              <DrawerSwitchField
                compact
                label="Advanced settings"
                help="Show detailed attendance, penalty, overtime, holiday, and payroll integration rules. Turning this off uses the default rules."
                checked={attendanceAdvancedMode}
                onChange={(checked) => {
                  setAttendanceAdvancedMode(checked);
                  if (!checked) {
                    setAttendanceForm((current) => applyAttendanceAdvancedDefaults(current));
                  }
                }}
              />
            </DrawerFormGrid>
          </PolicySection>
          {attendanceAdvancedMode ? (
            <PolicySection
              title="Advanced Rules"
              description="Detailed attendance, penalty, overtime, holiday, and payroll integration rules."
            >
              <DrawerFormGrid columns={3} alignItems="center">
                <DrawerField
                  label="Absent threshold"
                  help="Worked time percentage at or below this value is treated as absent."
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={attendanceForm.absentThresholdPercentage}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        absentThresholdPercentage: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerField
                  label="Late grace minutes"
                  help="Late arrival minutes ignored before the employee is counted as late."
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={attendanceForm.graceTime}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        graceTime: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerField
                  label="Allowed late arrivals per month"
                  help="Number of late arrivals allowed in a month before penalties can apply."
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={attendanceForm.maxLateAllowedPerMonth}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        maxLateAllowedPerMonth: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerSelectField
                  label="Penalty"
                  help="Attendance deduction applied after the configured late-arrival threshold is crossed."
                  value={attendanceForm.penaltyType}
                  onChange={(event) =>
                    setAttendanceForm((current) => ({
                      ...current,
                      penaltyType: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="half_day">Half Day</MenuItem>
                  <MenuItem value="full_day">Full Day</MenuItem>
                </DrawerSelectField>
                <DrawerField
                  label="Late count before deduction"
                  help="Number of qualifying late instances required before the selected penalty is applied."
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={attendanceForm.penaltyCountThreshold}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        penaltyCountThreshold: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerSwitchField
                  label="Early exit"
                  help="Tracks employees leaving before the scheduled end time."
                  checked={attendanceForm.earlyExitEnabled}
                  onChange={(checked) =>
                    setAttendanceForm((current) => ({ ...current, earlyExitEnabled: checked }))
                  }
                />
                <DrawerSwitchField
                  label="Overtime"
                  help="Enables overtime calculation when employees work beyond the scheduled time."
                  checked={attendanceForm.overtimeEnabled}
                  onChange={(checked) =>
                    setAttendanceForm((current) => ({ ...current, overtimeEnabled: checked }))
                  }
                />
                <DrawerField
                  label="Early exit grace minutes"
                  help="Early departure minutes ignored before the exit is flagged."
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={attendanceForm.earlyExitGraceTime}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        earlyExitGraceTime: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerField
                  label="Minimum overtime minutes"
                  help="Minimum extra minutes required before overtime is counted."
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={attendanceForm.minOvertimeMinutes}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        minOvertimeMinutes: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerField
                  label="Overtime Rate"
                  help="Optional rate or multiplier used by payroll when overtime is paid."
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={attendanceForm.overtimeRate}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        overtimeRate: event.target.value,
                      }))
                    }
                  />
                </DrawerField>
                <DrawerSelectField
                  label="Work on holiday"
                  help="Defines how attendance on holidays should be handled."
                  value={attendanceForm.holidayWorkBehavior}
                  onChange={(event) =>
                    setAttendanceForm((current) => ({
                      ...current,
                      holidayWorkBehavior: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="comp_off">Comp Off</MenuItem>
                  <MenuItem value="overtime">Overtime</MenuItem>
                  <MenuItem value="ignore">Ignore</MenuItem>
                </DrawerSelectField>
                <DrawerSwitchField
                  label="Sandwich rule"
                  help="Counts leave or absence between non-working days according to the organization's sandwich policy."
                  checked={attendanceForm.sandwichRuleEnabled}
                  onChange={(checked) =>
                    setAttendanceForm((current) => ({ ...current, sandwichRuleEnabled: checked }))
                  }
                />
                <DrawerSwitchField
                  label="Show payroll impact"
                  help="Allows payroll impact to be previewed from attendance and leave records."
                  checked={attendanceForm.payrollPreviewEnabled}
                  onChange={(checked) =>
                    setAttendanceForm((current) => ({ ...current, payrollPreviewEnabled: checked }))
                  }
                />
              </DrawerFormGrid>
            </PolicySection>
          ) : null}
        </PolicyDrawerLayout>
      );
    }
    return (
      <>
        <DrawerHeader
          title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Assignment`}
          onClose={closeDrawer}
        />
        <Divider />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {formError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          ) : null}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
              <DrawerSelectField
                label="Target Type"
                value={assignmentForm.targetType}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    targetType: event.target.value as PolicyAssignmentTargetType,
                    targetKey: '',
                    targetDisplayName: '',
                  }))
                }
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="group">Group</MenuItem>
              </DrawerSelectField>
              {renderAssignmentTargetPicker()}
              <DrawerSelectField
                label="Payroll Policy *"
                value={assignmentForm.payrollPolicyId}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    payrollPolicyId: event.target.value,
                  }))
                }
              >
                {activePayroll.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </DrawerSelectField>
              <DrawerSelectField
                label="Attendance Policy *"
                value={assignmentForm.attendancePolicyId}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    attendancePolicyId: event.target.value,
                  }))
                }
              >
                {activeAttendance.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </DrawerSelectField>
              <DrawerFormGrid>
                <DrawerField label="Effective From *">
                  <TextField
                    fullWidth
                    error={Boolean(assignmentDateError)}
                    type="date"
                    size="small"
                    value={assignmentForm.effectiveFrom}
                    onChange={(event) => {
                      setAssignmentDateError('');
                      setAssignmentForm((current) => ({
                        ...current,
                        effectiveFrom: event.target.value,
                      }));
                    }}
                  />
                </DrawerField>
                <DrawerField label="Effective To" helperText={assignmentDateError}>
                  <TextField
                    fullWidth
                    error={Boolean(assignmentDateError)}
                    type="date"
                    size="small"
                    value={assignmentForm.effectiveTo}
                    onChange={(event) => {
                      setAssignmentDateError('');
                      setAssignmentForm((current) => ({
                        ...current,
                        effectiveTo: event.target.value,
                      }));
                    }}
                  />
                </DrawerField>
              </DrawerFormGrid>
              {assignmentConflict ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      size="small"
                      onClick={() =>
                        previewAssignment({
                          id: assignmentConflict.assignmentId,
                          academicYearId: academicYearId || '',
                          targetType: assignmentConflict.targetType as PolicyAssignmentTargetType,
                          targetKey: assignmentConflict.targetKey,
                          targetDisplayName: assignmentConflict.targetDisplayName,
                          payrollPolicyId: assignmentConflict.payrollPolicyId,
                          attendancePolicyId: assignmentConflict.attendancePolicyId,
                          effectiveFrom: assignmentConflict.effectiveFrom,
                          effectiveTo: assignmentConflict.effectiveTo,
                          priority: assignmentConflict.priority,
                          isActive: true,
                          assignmentReason: null,
                        })
                      }
                    >
                      Preview
                    </Button>
                  }
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={700}>
                      Conflicts with{' '}
                      {assignmentConflict.targetDisplayName || assignmentConflict.targetKey}
                    </Typography>
                    <Typography variant="caption">
                      {formatRange(
                        assignmentConflict.effectiveFrom,
                        assignmentConflict.effectiveTo
                      )}{' '}
                      · Priority {assignmentConflict.priority}
                    </Typography>
                    <Typography variant="caption">
                      Payroll: {assignmentConflict.payrollPolicyName} · Attendance:{' '}
                      {assignmentConflict.attendancePolicyName}
                    </Typography>
                  </Stack>
                </Alert>
              ) : null}
              <DrawerField label="Priority">
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  value={assignmentForm.priority}
                  onChange={(event) =>
                    setAssignmentForm((current) => ({ ...current, priority: event.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label="Reason">
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={assignmentForm.assignmentReason}
                  onChange={(event) =>
                    setAssignmentForm((current) => ({
                      ...current,
                      assignmentReason: event.target.value,
                    }))
                  }
                />
              </DrawerField>
              <DrawerSwitchField
                label="Active"
                checked={assignmentForm.isActive}
                onChange={(checked) =>
                  setAssignmentForm((current) => ({ ...current, isActive: checked }))
                }
              />
              <Stack direction="row" spacing={1}>
                <LoadingButton
                  variant="outlined"
                  disabled={!canPreviewImpact}
                  loading={previewPolicyAssignmentImpactState.isLoading}
                  onClick={previewCurrentAssignmentImpact}
                >
                  Preview impact
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  disabled={!canAssignPolicy}
                  loading={createAssignmentState.isLoading || updateAssignmentState.isLoading}
                  onClick={saveAssignment}
                >
                  Save
                </LoadingButton>
              </Stack>
            </Stack>
            <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
              {renderAssignmentPreviewPanel()}
            </Box>
          </Stack>
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography variant="h4">Policies & Rules</Typography>
            <Typography variant="caption" color="text.secondary">
              {currentYear?.name || 'No academic year selected'}
            </Typography>
          </Box>
        </Stack>
        {!academicYearId ? (
          <Alert severity="warning">Select an academic year to manage HR policies.</Alert>
        ) : null}
        {isLoading ? <LinearProgress /> : null}
        <Card
          sx={{
            px: 1,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={tab}
            variant="scrollable"
            scrollButtons="auto"
            onChange={(_, value) => setTab(value)}
            sx={{
              minHeight: 48,
              '& .MuiTabs-flexContainer': {
                gap: 1.5,
              },
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: 1,
              },
            }}
          >
            {tabs.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                label={item.label}
                icon={<Iconify icon={item.icon} />}
                iconPosition="start"
                disabled={item.disabled}
                sx={{
                  minHeight: 48,
                  px: 1,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  '&.Mui-selected': {
                    fontWeight: 700,
                  },
                  '& .MuiTab-iconWrapper': {
                    mr: 0.75,
                    mb: 0,
                  },
                }}
              />
            ))}
          </Tabs>
        </Card>
        {tab === 'calendars' ? renderCalendars() : null}
        {tab === 'payroll' ? renderPolicyTable('payroll') : null}
        {tab === 'attendance' ? renderPolicyTable('attendance') : null}
        {tab === 'assignments' ? renderAssignments() : null}
        {tab === 'holiday' ? renderHoliday() : null}
        {tab === 'effective' ? renderEffective() : null}
      </Stack>
      <Drawer
        anchor="right"
        open={Boolean(drawer)}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 'min(1180px, 92vw)' }, maxWidth: '100%' } }}
      >
        {renderDrawerContent()}
      </Drawer>
      <Dialog
        open={manualHolidayDialogOpen}
        onClose={closeManualHolidayDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingManualHolidayIndex === null ? 'Add Manual Holiday' : 'Edit Manual Holiday'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Holiday name *"
              value={manualHolidayForm.holidayName}
              onChange={(event) =>
                setManualHolidayForm((current) => ({ ...current, holidayName: event.target.value }))
              }
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From date *"
              InputLabelProps={{ shrink: true }}
              value={manualHolidayForm.fromDate}
              onChange={(event) =>
                setManualHolidayForm((current) => ({
                  ...current,
                  fromDate: event.target.value,
                  toDate: current.toDate || event.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To date *"
              InputLabelProps={{ shrink: true }}
              value={manualHolidayForm.toDate}
              onChange={(event) =>
                setManualHolidayForm((current) => ({ ...current, toDate: event.target.value }))
              }
            />
            <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">
                Days
              </Typography>
              <Typography variant="body2">
                {manualHolidayForm.fromDate &&
                manualHolidayForm.toDate &&
                !dayjs(manualHolidayForm.toDate).isBefore(dayjs(manualHolidayForm.fromDate), 'day')
                  ? dayjs(manualHolidayForm.toDate).diff(dayjs(manualHolidayForm.fromDate), 'day') +
                    1
                  : '-'}
              </Typography>
            </Paper>
            <TextField
              fullWidth
              size="small"
              label="Notes"
              value={manualHolidayForm.notes}
              onChange={(event) =>
                setManualHolidayForm((current) => ({ ...current, notes: event.target.value }))
              }
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManualHolidayDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveManualHoliday}>
            Save Holiday
          </Button>
        </DialogActions>
      </Dialog>
      {renderImpactDrawer()}
      {renderAuditDrawer()}
      {renderVersionDrawer()}
    </Box>
  );
}
