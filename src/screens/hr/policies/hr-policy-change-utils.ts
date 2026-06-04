import type {
  PolicyStatus,
  PayrollPolicy,
  AttendancePolicy,
  WorkCalendarPolicy,
  WorkCalendarHoliday,
  CreateUpdatePayrollPolicy,
  CreateUpdateAttendancePolicy,
  CreateUpdateWorkCalendarPolicy,
} from 'src/redux/hr/hr-policy-api';

export type PolicyArchiveView = 'current' | 'archived';

type PolicyWithStatus = { status: PolicyStatus };

const normalizeDate = (value?: string | null) => (value ? value.slice(0, 10) : null);

const normalizeText = (value?: string | null) => (value || '').trim();

const normalizeNumberOrNull = (value: unknown) => {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const sortNumbers = (items?: number[] | null) =>
  [...new Set(items || [])].sort((left, right) => left - right);

const normalizeHoliday = (holiday: Partial<WorkCalendarHoliday>) => ({
  academicYearId: holiday.academicYearId || '',
  date: normalizeDate(holiday.fromDate || holiday.date),
  fromDate: normalizeDate(holiday.fromDate || holiday.date),
  toDate: normalizeDate(holiday.toDate || holiday.fromDate || holiday.date),
  holidayName: normalizeText(holiday.holidayName),
  source: holiday.source || 'manual',
  calendarHolidayId: holiday.calendarHolidayId || null,
  isIncluded: Boolean(holiday.isIncluded),
  notes: normalizeText(holiday.notes),
});

const normalizeHolidays = (holidays?: Partial<WorkCalendarHoliday>[] | null) =>
  (holidays || [])
    .map(normalizeHoliday)
    .sort((left, right) =>
      [
        left.fromDate || '',
        left.toDate || '',
        left.holidayName,
        left.source,
        left.calendarHolidayId || '',
      ]
        .join('|')
        .localeCompare(
          [
            right.fromDate || '',
            right.toDate || '',
            right.holidayName,
            right.source,
            right.calendarHolidayId || '',
          ].join('|')
        )
    );

const normalizeManualMonths = (
  items?: Array<{ year?: number; month?: number; manualDays?: number }> | null
) =>
  (items || [])
    .map((item) => ({
      year: Number(item.year),
      month: Number(item.month),
      manualDays: Number(item.manualDays),
    }))
    .sort((left, right) => left.year - right.year || left.month - right.month);

const normalizePayrollHolidayOverrides = (
  items?: Array<{
    date?: string | null;
    holidayName?: string | null;
    includedInPayroll?: boolean;
    calendarHolidayId?: string | null;
  }> | null
) =>
  (items || [])
    .map((item) => ({
      date: normalizeDate(item.date),
      holidayName: normalizeText(item.holidayName),
      includedInPayroll: Boolean(item.includedInPayroll),
      calendarHolidayId: item.calendarHolidayId || null,
    }))
    .sort((left, right) =>
      [left.date || '', left.holidayName, left.calendarHolidayId || '']
        .join('|')
        .localeCompare(
          [right.date || '', right.holidayName, right.calendarHolidayId || ''].join('|')
        )
    );

const stableJson = (value: unknown) => JSON.stringify(value);

export const filterPoliciesByArchiveView = <T extends PolicyWithStatus>(
  items: T[],
  archiveView: PolicyArchiveView
) =>
  archiveView === 'archived'
    ? items.filter((item) => item.status === 'archived')
    : items.filter((item) => item.status !== 'archived');

export function isWorkCalendarPolicyUnchanged(
  policy: WorkCalendarPolicy,
  payload: CreateUpdateWorkCalendarPolicy
) {
  return (
    policy.academicYearId === payload.academicYearId &&
    normalizeText(policy.name) === normalizeText(payload.name) &&
    policy.status === payload.status &&
    normalizeDate(policy.effectiveFrom) === normalizeDate(payload.effectiveFrom as string | null) &&
    normalizeDate(policy.effectiveTo) === normalizeDate(payload.effectiveTo as string | null) &&
    policy.weeklyOffPattern === payload.weeklyOffPattern &&
    stableJson(sortNumbers(policy.customWeeklyOffs)) ===
      stableJson(sortNumbers(payload.customWeeklyOffs as number[] | undefined)) &&
    policy.holidaySyncMode === payload.holidaySyncMode &&
    stableJson(normalizeHolidays(policy.holidays)) ===
      stableJson(normalizeHolidays(payload.holidays as WorkCalendarHoliday[] | undefined))
  );
}

export function isPayrollPolicyUnchanged(
  policy: PayrollPolicy,
  payload: CreateUpdatePayrollPolicy
) {
  return (
    policy.academicYearId === payload.academicYearId &&
    policy.workCalendarPolicyId === payload.workCalendarPolicyId &&
    normalizeText(policy.name) === normalizeText(payload.name) &&
    policy.status === payload.status &&
    policy.isDefault === payload.isDefault &&
    policy.dayCalculationType === payload.dayCalculationType &&
    normalizeNumberOrNull(policy.manualDays) === normalizeNumberOrNull(payload.manualDays) &&
    policy.saturdayWorkPolicy === payload.saturdayWorkPolicy &&
    stableJson(normalizeManualMonths(policy.manualMonthDays)) ===
      stableJson(normalizeManualMonths(payload.manualMonthDays)) &&
    stableJson(normalizePayrollHolidayOverrides(policy.holidayOverrides)) ===
      stableJson(normalizePayrollHolidayOverrides(payload.holidayOverrides))
  );
}

export function isAttendancePolicyUnchanged(
  policy: AttendancePolicy,
  payload: CreateUpdateAttendancePolicy
) {
  return (
    policy.academicYearId === payload.academicYearId &&
    policy.workCalendarPolicyId === payload.workCalendarPolicyId &&
    normalizeText(policy.name) === normalizeText(payload.name) &&
    policy.status === payload.status &&
    policy.isDefault === payload.isDefault &&
    (policy.captureMode || 'integrated') === (payload.captureMode || 'integrated') &&
    policy.fullDayThresholdPercentage ===
      normalizeNumberOrNull(payload.fullDayThresholdPercentage) &&
    policy.halfDayThresholdPercentage ===
      normalizeNumberOrNull(payload.halfDayThresholdPercentage) &&
    policy.absentThresholdPercentage === normalizeNumberOrNull(payload.absentThresholdPercentage) &&
    policy.missingPunchBehavior === payload.missingPunchBehavior &&
    policy.manualCorrectionAllowed === payload.manualCorrectionAllowed &&
    policy.graceTime === normalizeNumberOrNull(payload.graceTime) &&
    policy.maxLateAllowedPerMonth === normalizeNumberOrNull(payload.maxLateAllowedPerMonth) &&
    policy.penaltyType === payload.penaltyType &&
    policy.penaltyCountThreshold === normalizeNumberOrNull(payload.penaltyCountThreshold) &&
    policy.earlyExitEnabled === payload.earlyExitEnabled &&
    policy.earlyExitGraceTime === normalizeNumberOrNull(payload.earlyExitGraceTime) &&
    policy.overtimeEnabled === payload.overtimeEnabled &&
    normalizeText(policy.overtimeRate) === normalizeText(payload.overtimeRate as string | null) &&
    normalizeNumberOrNull(policy.minOvertimeMinutes) ===
      normalizeNumberOrNull(payload.minOvertimeMinutes) &&
    policy.holidayWorkBehavior === payload.holidayWorkBehavior &&
    policy.sandwichRuleEnabled === payload.sandwichRuleEnabled &&
    policy.payrollPreviewEnabled === payload.payrollPreviewEnabled
  );
}
