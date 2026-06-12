import type {
  HrPolicyAssignment,
  WorkCalendarPolicy,
  WorkCalendarHoliday,
  HrPolicyAssignmentConflict,
} from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';
import {
  getHolidayToDate,
  getHolidayFromDate,
  mergeNonOverlappingHolidayRows,
} from 'src/screens/hr/policies/holiday-overlap-utils';

import { WEEKDAY_OPTIONS } from './hr-policy-workspace.constants';

import type { LookupOption, AssignmentForm } from './types/hr-policy-workspace.types';

// --- Date Formatting ----------------------------------------------------------

export function toDateInput(value?: string | null): string {
  return parseDateOnly(value)?.format('YYYY-MM-DD') ?? '';
}

export function formatDate(value?: string | null): string {
  return parseDateOnly(value)?.format('DD MMM YYYY') ?? '-';
}

export function formatRange(from?: string | null, to?: string | null): string {
  return `${formatDate(from)} - ${to ? formatDate(to) : 'No end date'}`;
}

// --- Date Range Checks --------------------------------------------------------

export function isDateWithinRange(date: string, from?: string | null, to?: string | null): boolean {
  const target = dayjs(date);
  if (!date || !target.isValid()) return true;
  const start = from ? dayjs(from) : null;
  const end = to ? dayjs(to) : null;
  return (
    (!start || target.isSame(start, 'day') || target.isAfter(start, 'day')) &&
    (!end || target.isSame(end, 'day') || target.isBefore(end, 'day'))
  );
}

export function overlapsDateRange(item: HrPolicyAssignment, from: string, to: string): boolean {
  const filterStart = from ? dayjs(from) : null;
  const filterEnd = to ? dayjs(to) : null;
  const assignmentStart = dayjs(item.effectiveFrom);
  const assignmentEnd = item.effectiveTo ? dayjs(item.effectiveTo) : null;

  if (filterStart && assignmentEnd && assignmentEnd.isBefore(filterStart, 'day')) return false;
  if (filterEnd && assignmentStart.isAfter(filterEnd, 'day')) return false;
  return true;
}

export function getAssignmentFormValidationError(form: AssignmentForm): string {
  if (!form.payrollPolicyId || !form.attendancePolicyId || !form.leavePolicyId) {
    return 'Payroll, attendance, and leave policies are required.';
  }

  const effectiveFrom = form.effectiveFrom ? dayjs(form.effectiveFrom) : null;
  if (!effectiveFrom?.isValid()) {
    return 'Effective from must be a valid date.';
  }

  const effectiveTo = form.effectiveTo ? dayjs(form.effectiveTo) : null;
  if (form.effectiveTo && !effectiveTo?.isValid()) {
    return 'Effective to must be a valid date.';
  }

  if (form.effectiveTo && effectiveTo?.isBefore(effectiveFrom, 'day')) {
    return 'Effective to must be on or after effective from.';
  }

  const priority = Number(form.priority || 0);
  if (!Number.isFinite(priority) || priority < -1000 || priority > 1000) {
    return 'Priority must be between -1000 and 1000.';
  }

  return '';
}

export function selectSingleActiveDefaultPolicy<T extends { status?: string; isDefault?: boolean }>(
  policies: T[]
): T | undefined {
  const activeDefaults = policies.filter(
    (item) => String(item.status || '').toLowerCase() === 'active' && item.isDefault
  );
  return activeDefaults.length === 1 ? activeDefaults[0] : undefined;
}

export function getEffectiveAssignmentLeavePolicyId(
  assignment: { leavePolicyId?: string | null },
  defaultLeavePolicyId?: string | null
): string {
  return assignment.leavePolicyId || defaultLeavePolicyId || '';
}

export function assignmentMatchesLeavePolicyFilter(
  assignment: { leavePolicyId?: string | null },
  leavePolicyFilterId: string | null | undefined,
  defaultLeavePolicyId?: string | null
): boolean {
  if (!leavePolicyFilterId) return true;
  return (
    getEffectiveAssignmentLeavePolicyId(assignment, defaultLeavePolicyId) === leavePolicyFilterId
  );
}

export function isDateInsideRange(date: string, from?: string, to?: string): boolean {
  const value = dayjs(date);
  if (!value.isValid()) return false;
  if (from && value.isBefore(dayjs(from), 'day')) return false;
  if (to && value.isAfter(dayjs(to), 'day')) return false;
  return true;
}

export function isHolidayRangeInsideRange(
  fromDate: string,
  toDate: string,
  from?: string,
  to?: string
): boolean {
  return (
    isDateInsideRange(fromDate, from, to) &&
    isDateInsideRange(toDate, from, to) &&
    !dayjs(toDate).isBefore(dayjs(fromDate), 'day')
  );
}

// --- Holiday Helpers ----------------------------------------------------------

export function getHolidayDayCount(item: WorkCalendarHoliday): number {
  if (typeof item.dayCount === 'number' && item.dayCount > 0) return item.dayCount;
  const from = dayjs(getHolidayFromDate(item));
  const to = dayjs(getHolidayToDate(item));
  if (!from.isValid() || !to.isValid()) return 1;
  return Math.max(1, to.diff(from, 'day') + 1);
}

export function formatHolidayDateRange(item: WorkCalendarHoliday): string {
  const from = getHolidayFromDate(item);
  const to = getHolidayToDate(item);
  if (!to || dayjs(from).isSame(dayjs(to), 'day')) return formatDate(from);
  return formatRange(from, to);
}

export function getHolidaySummary(holidays: WorkCalendarHoliday[] = []): {
  total: number;
  included: number;
  removed: number;
  manual: number;
  central: number;
} {
  return {
    total: holidays.length,
    included: holidays.filter((item) => item.isIncluded).length,
    removed: holidays.filter((item) => !item.isIncluded).length,
    manual: holidays.filter((item) => item.source === 'manual').length,
    central: holidays.filter((item) => item.source === 'central_calendar').length,
  };
}

export function holidayRowKey(item: WorkCalendarHoliday): string {
  const fromDate = dayjs(getHolidayFromDate(item)).format('YYYY-MM-DD');
  const toDate = dayjs(getHolidayToDate(item)).format('YYYY-MM-DD');
  return `${item.calendarHolidayId || item.source}-${fromDate}-${toDate}-${item.holidayName.trim().toLowerCase()}`;
}

export function mergeHolidayRows(
  currentRows: WorkCalendarHoliday[],
  importedRows: WorkCalendarHoliday[]
): WorkCalendarHoliday[] {
  return mergeNonOverlappingHolidayRows(currentRows, importedRows, holidayRowKey).rows;
}

export function formatHolidayOverlapMessage(conflict: {
  holiday: WorkCalendarHoliday;
  overlapFrom: string;
  overlapTo: string;
}): string {
  const dateText =
    conflict.overlapFrom === conflict.overlapTo
      ? conflict.overlapFrom
      : `${conflict.overlapFrom} to ${conflict.overlapTo}`;
  return `Holiday overlaps with ${conflict.holiday.holidayName} on ${dateText}. Remove or edit the existing holiday first.`;
}

export function getHolidayMonthOptions(holidays: WorkCalendarHoliday[]): string[] {
  return Array.from(
    new Set(holidays.map((holiday) => dayjs(getHolidayFromDate(holiday)).format('YYYY-MM')))
  )
    .filter((month) => month !== 'Invalid Date')
    .sort();
}

// --- Payroll Calculation Helpers ----------------------------------------------

export function formatBasisDays(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function numberOrNull(value: string): number | null {
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizePayrollDayCalculationType(value?: string | null): string {
  if (value === 'calendar-days') return 'total-month-days';
  if (value === 'manual') return 'manual-days';
  if (value === 'total-month-days' || value === 'manual-days' || value === 'working-days')
    return value;
  return 'working-days';
}

export function isValidManualDayCount(value: number | null): boolean {
  return value !== null && Number.isInteger(value) && value >= 1 && value <= 31;
}

function getDateKey(value: dayjs.Dayjs): string {
  return value.format('YYYY-MM-DD');
}

function parseDateOnly(value?: string | null): dayjs.Dayjs | null {
  if (!value) return null;
  const datePart = value.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  const parsed = dayjs(datePart || value);
  return parsed.isValid() ? parsed : null;
}

function getSaturdayUnit(policy: string): number {
  if (policy === 'half-day') return 0.5;
  if (policy === 'off') return 0;
  return 1;
}

function getBaseWorkingUnit(
  date: dayjs.Dayjs,
  weeklyOffs: Set<number>,
  saturdayPolicy: string
): number {
  const day = date.day();
  if (weeklyOffs.has(day)) return 0;
  if (day === 6) return getSaturdayUnit(saturdayPolicy);
  return 1;
}

function getIncludedHolidayDateSet(
  fromDate: dayjs.Dayjs,
  toDate: dayjs.Dayjs,
  holidays: WorkCalendarHoliday[] = []
): Set<string> {
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

export function getAcademicYearMonthRanges(
  start?: string | null,
  end?: string | null
): Array<{ monthStart: dayjs.Dayjs; fromDate: dayjs.Dayjs; toDate: dayjs.Dayjs }> {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);
  if (!startDate || !endDate || endDate.isBefore(startDate, 'day')) return [];
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

export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function buildManualMonthDaysMap({
  academicYearStart,
  academicYearEnd,
  existing = {},
  fallbackDays,
}: {
  academicYearStart?: string | null;
  academicYearEnd?: string | null;
  existing?: Record<string, string>;
  fallbackDays?: number | null;
}): Record<string, string> {
  return getAcademicYearMonthRanges(academicYearStart, academicYearEnd).reduce<
    Record<string, string>
  >((result, { monthStart }) => {
    const key = monthStart.format('YYYY-MM');
    result[key] = existing[key] ?? (fallbackDays == null ? '' : String(fallbackDays));
    return result;
  }, {});
}

export function payrollManualMonthDaysToMap(
  items: Array<{ year: number; month: number; manualDays: number }> = []
): Record<string, string> {
  return items.reduce<Record<string, string>>((result, item) => {
    result[getMonthKey(item.year, item.month)] = String(item.manualDays);
    return result;
  }, {});
}

export function buildCalendarDaysMap(
  academicYearStart?: string | null,
  academicYearEnd?: string | null
): Record<string, string> {
  return getAcademicYearMonthRanges(academicYearStart, academicYearEnd).reduce<
    Record<string, string>
  >((result, { monthStart, fromDate, toDate }) => {
    result[monthStart.format('YYYY-MM')] = String(toDate.diff(fromDate, 'day') + 1);
    return result;
  }, {});
}

export function buildManualMonthDaysPayload({
  academicYearStart,
  academicYearEnd,
  manualMonthDays,
}: {
  academicYearStart?: string | null;
  academicYearEnd?: string | null;
  manualMonthDays: Record<string, string>;
}): { items: Array<{ year: number; month: number; manualDays: number }>; error: string } {
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

export function buildPayrollBasisPreviewRows({
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
}): Array<{
  monthKey: string;
  monthLabel: string;
  calendarDays: number;
  workingUnits: number;
  holidayUnitsExcluded: number;
  saturdayCount: number;
  saturdayUnits: number;
  basisDays: number | null;
  source: string;
  isCurrentMonth: boolean;
}> {
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

// --- Weekly Rule Helpers ------------------------------------------------------

export function sortWeekDays(days: number[]): number[] {
  return [...new Set(days)]
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)
    .sort((left, right) => left - right);
}

export function formatWeekDays(days: number[]): string {
  const cleanDays = sortWeekDays(days);
  if (!cleanDays.length) return 'None';
  return cleanDays
    .map((day) => WEEKDAY_OPTIONS.find((item) => item.value === day)?.short)
    .filter(Boolean)
    .join(', ');
}

export function normalizeWeeklyRule(pattern: string, customWeeklyOffs: number[]): string {
  if (pattern === 'sunday_only') return 'sunday';
  return pattern || 'saturday_sunday';
}

export function getWeeklyOffsForRule(pattern: string, customWeeklyOffs: number[]): number[] {
  if (pattern === 'saturday_sunday') return [0, 6];
  if (pattern === 'sunday' || pattern === 'sunday_only') return [0];
  return sortWeekDays(customWeeklyOffs);
}

export function getWorkingDaysForRule(pattern: string, customWeeklyOffs: number[]): number[] {
  const weeklyOffs = new Set(getWeeklyOffsForRule(pattern, customWeeklyOffs));
  return WEEKDAY_OPTIONS.map((item) => item.value).filter((day) => !weeklyOffs.has(day));
}

export function isSaturdayWorkingForCalendar(calendar?: WorkCalendarPolicy | null): boolean {
  if (!calendar) return false;
  const pattern = normalizeWeeklyRule(calendar.weeklyOffPattern, calendar.customWeeklyOffs || []);
  return !getWeeklyOffsForRule(pattern, calendar.customWeeklyOffs || []).includes(6);
}

export function toApiWeeklyPattern(pattern: string): string {
  if (pattern === 'sunday_only') return 'sunday';
  return pattern;
}

export function getCalendarWeeklyRuleLabel(item: WorkCalendarPolicy): string {
  const pattern = normalizeWeeklyRule(item.weeklyOffPattern, item.customWeeklyOffs || []);
  if (pattern === 'saturday_sunday') return 'Saturday + Sunday Off';
  if (pattern === 'sunday') return 'Sunday Off';
  return `Custom: ${formatWeekDays(item.customWeeklyOffs || [])}`;
}

// --- Lookup / Display Helpers -------------------------------------------------

export function getItems<T extends LookupOption>(data: unknown): T[] {
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

export function optionLabel(item: LookupOption | null | undefined): string {
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

export function getLookupOrganizationNames(item: LookupOption | null | undefined): string[] {
  if (!item) return [];
  if (Array.isArray(item.organizationNames) && item.organizationNames.length > 0) {
    return item.organizationNames.filter(Boolean);
  }
  if (Array.isArray(item.organizations)) {
    return item.organizations.map((org) => org.name).filter(Boolean) as string[];
  }
  return [];
}

export function toLabel(value?: string | null): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatNumber(value?: number | null): string {
  return value == null ? '-' : value.toLocaleString();
}

// --- Error Extraction ---------------------------------------------------------

export function getErrorMessage(error: unknown, fallback: string): string {
  const value = error as
    | { data?: { error?: { message?: string }; message?: string }; error?: string }
    | undefined;
  return value?.data?.error?.message || value?.data?.message || value?.error || fallback;
}

export function getAssignmentConflict(error: unknown): HrPolicyAssignmentConflict | null {
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
