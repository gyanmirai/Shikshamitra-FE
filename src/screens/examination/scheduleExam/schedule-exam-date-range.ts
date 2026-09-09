import { formatDateOnly } from 'src/utils/date-only';

// Exam summary boundaries carry school calendar/clock values with offset
// metadata. Preserve their calendar dates instead of converting them to the
// browser timezone, which can push an evening end time into the next day.
export function formatExamDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return '';

  const start = formatDateOnly(startDate);
  const end = endDate ? formatDateOnly(endDate) : start;
  return start === end ? start : `${start} - ${end}`;
}
