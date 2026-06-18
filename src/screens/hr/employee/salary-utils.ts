import dayjs from 'dayjs';

/**
 * Determines whether a salary component is "fixed" using a unified rule:
 *
 * 1. If the payroll setting uses percentage calculation → **false**
 * 2. If the payroll setting uses amount calculation → **true**
 * 3. If only earning/deduction type exists, use the existing fixed/variable mapping
 * 4. If neither type field exists, fall back to the existing `isFixed` boolean
 *
 * This single helper replaces the duplicated inline checks in:
 *   - Salary structure modal submit mapping  (employee.tsx)
 *   - Employee payroll form submit mapping   (employee-form.tsx)
 *   - Payroll component renderer             (PayrollFields.tsx)
 */
export function isSalaryComponentFixed(item: Record<string, any>): boolean {
  // earningType / deductionType is the primary source of truth for fixed vs variable.
  if (item?.earningType === 'FIXED' || item?.deductionType === 'FIXED') {
    return true;
  }
  if (item?.earningType === 'VARIABLE' || item?.deductionType === 'VARIABLE') {
    return false;
  }

  // Numeric calculationType fallback (legacy / in-progress form data)
  if (item?.calculationType === 0) return true;
  if (item?.calculationType === 1) return false;

  // Neither type field is present — item came from the backend with only `isFixed`
  if (item?.earningType === undefined && item?.deductionType === undefined) {
    return !!item?.isFixed;
  }

  return false;
}

export function isPercentageSalaryComponent(item: Record<string, any>): boolean {
  return item?.calculationType === 1 || item?.calculationType === 'PERCENTAGE';
}

export function getSalaryComponentPayloadAmount(item: Record<string, any>): number | null {
  if (isPercentageSalaryComponent(item)) {
    return null;
  }

  return Number(item?.amount ?? 0);
}

function getYearMonth(value: any): { year: string; month: string } | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{1,2})/);
    if (match) {
      const month = match[2].padStart(2, '0');
      const monthNumber = Number(month);
      if (monthNumber >= 1 && monthNumber <= 12) {
        return { year: match[1], month };
      }
    }
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) return null;

  return {
    year: parsed.format('YYYY'),
    month: parsed.format('MM'),
  };
}

export function toApplicableMonthPayload(value: any): string | null {
  const yearMonth = getYearMonth(value);
  return yearMonth ? `${yearMonth.year}-${yearMonth.month}-01` : null;
}

export function formatApplicableMonthLabel(value: any): string {
  const payload = toApplicableMonthPayload(value);
  return payload ? dayjs(payload).format('MMM YYYY') : '-';
}
