import dayjs from 'dayjs';

export function loanAsOfDate(value: string | null | undefined): string | null | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    dayjs(value).isValid() &&
    dayjs(value).format('YYYY-MM-DD') === value
    ? value
    : null;
}
export const invalidLoanAsOf = { detail: 'Choose a valid school as-of date or clear it.' };
