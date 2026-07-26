import type { Dayjs } from 'dayjs';

export type PayslipSelection = {
  employeeId: string;
  monthYear: string;
  key: string;
};

export const buildPayslipSelection = (
  employeeId?: string | null,
  month?: Dayjs | null
): PayslipSelection | null => {
  if (!employeeId || !month?.isValid()) {
    return null;
  }

  const monthYear = month.format('YYYY-MM');
  return {
    employeeId,
    monthYear,
    key: `${employeeId}:${monthYear}`,
  };
};

const PAYROLL_MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

export const normalizePayslipResponseMonth = (value?: string | null): string | null => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase();
  const canonicalMatch = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(normalized);
  if (canonicalMatch) {
    return `${canonicalMatch[1]}-${canonicalMatch[2]}`;
  }

  const apiMatch = /^([A-Z]+)-(\d{4})$/.exec(normalized);
  if (!apiMatch) {
    return null;
  }

  const monthIndex = PAYROLL_MONTHS.indexOf(apiMatch[1] as (typeof PAYROLL_MONTHS)[number]);
  return monthIndex < 0 ? null : `${apiMatch[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
};

export const payslipMatchesSelection = (
  slip: { employeeId?: string; monthYear?: string } | null | undefined,
  selection: PayslipSelection | null
) =>
  Boolean(
    slip &&
    selection &&
    String(slip.employeeId || '').toLowerCase() === selection.employeeId.toLowerCase() &&
    normalizePayslipResponseMonth(slip.monthYear) === selection.monthYear
  );

const getPayslipErrorStatus = (error: unknown): number | null => {
  if (!error || typeof error !== 'object') return null;

  const { status, originalStatus } = error as {
    status?: unknown;
    originalStatus?: unknown;
  };
  const candidate = status === 'PARSING_ERROR' ? originalStatus : status;
  if (typeof candidate === 'number') return candidate;
  if (typeof candidate === 'string' && /^\d+$/.test(candidate)) return Number(candidate);
  return null;
};

export const isPayslipNotFoundError = (error: unknown) => getPayslipErrorStatus(error) === 404;
