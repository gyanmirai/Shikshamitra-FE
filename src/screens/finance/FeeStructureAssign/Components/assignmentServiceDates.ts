import type { Dayjs } from 'dayjs';
import type {
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';

export type AssignmentYearBounds = { start: Dayjs; end: Dayjs };

function calendarDate(value?: string | null) {
  const key = value?.slice(0, 10);
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return undefined;
  const date = dayjs(key);
  return date.isValid() && date.format('YYYY-MM-DD') === key ? date : undefined;
}

export function assignmentYearBounds(
  year: { id?: string; startDate?: string; endDate?: string } | undefined,
  academicYearId: string
): AssignmentYearBounds | undefined {
  if (year?.id !== academicYearId) return undefined;
  const start = calendarDate(year.startDate);
  const end = calendarDate(year.endDate);
  return start && end && !end.isBefore(start, 'day') ? { start, end } : undefined;
}

// Service dates are calendar boundaries; preserve the selected day at UTC midnight.
export const serializeServiceDate = (date: Dayjs | null) =>
  date?.isValid() ? `${date.format('YYYY-MM-DD')}T00:00:00Z` : undefined;

export function servicePeriodErrors(
  period: AssignmentServicePeriod,
  bounds?: AssignmentYearBounds
) {
  if (period.source !== 'ManualOverride') return {};
  if (!bounds) return { start: 'Selected academic year dates are unavailable.' };
  const start = calendarDate(period.startDate);
  const end = calendarDate(period.endDate);
  const outside = (date: Dayjs) =>
    date.isBefore(bounds.start, 'day') || date.isAfter(bounds.end, 'day');
  return {
    start: !start
      ? 'Enter a valid start date.'
      : outside(start)
        ? 'Choose a date within the selected academic year.'
        : undefined,
    end: !end
      ? 'Enter a valid end date.'
      : outside(end)
        ? 'Choose a date within the selected academic year.'
        : start && end.isBefore(start, 'day')
          ? 'End date must be on or after start date.'
          : undefined,
    reason: !period.reason?.trim() ? 'Enter a reason for changing dates.' : undefined,
  };
}

export function assignmentServiceDateError(
  candidate: AssignmentCandidate,
  request: AssignmentRequest,
  bounds?: AssignmentYearBounds
): string | undefined {
  return candidate.heads
    .filter((head) => !head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId))
    .map((head) => {
      const period = request.servicePeriods.find((item) => item.feeHeadId === head.feeHeadId);
      if (!period) return undefined;
      const errors = servicePeriodErrors(period, bounds);
      const message = errors.start || errors.end || errors.reason;
      return message ? `${head.feeHeadName}: ${message}` : undefined;
    })
    .find(Boolean);
}
