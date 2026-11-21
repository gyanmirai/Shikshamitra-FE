import { parseDateOnly } from 'src/utils/date-only';

/** Inquiry dates are local calendar days; the server receives a half-open UTC interval. */
export function inquiryDateRange(from: string, to: string) {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    !start ||
    !end ||
    start.format('YYYY-MM-DD') !== from ||
    end.format('YYYY-MM-DD') !== to ||
    start.isAfter(end, 'day')
  )
    return undefined;
  return {
    value: [start, end] as [typeof start, typeof end],
    creationTimeFrom: start.startOf('day').toISOString(),
    creationTimeBefore: end.add(1, 'day').startOf('day').toISOString(),
  };
}
