import dayjs from 'dayjs';

export interface AcademicPeriod {
  id: string;
  startDate: string;
  endDate: string;
}
export function academicMonthOptions(
  period?: Pick<AcademicPeriod, 'startDate' | 'endDate'> | null
) {
  if (!period) return [];
  const start = dayjs(period.startDate);
  const end = dayjs(period.endDate);
  if (!start.isValid() || !end.isValid() || start.isAfter(end, 'day')) return [];
  const options: { value: string; label: string }[] = [];
  for (
    let cursor = start.startOf('month');
    !cursor.isAfter(end, 'month');
    cursor = cursor.add(1, 'month')
  ) {
    options.push({ value: cursor.format('YYYY-MM'), label: cursor.format('MMMM YYYY') });
  }
  return options;
}
export function defaultAcademicMonth(options: { value: string }[], today = dayjs()) {
  const current = today.format('YYYY-MM');
  return options.some((option) => option.value === current)
    ? current
    : (options[0]?.value ?? 'all');
}
export function entryDate(period: AcademicPeriod, month: string, today = dayjs()) {
  const start = dayjs(period.startDate);
  const end = dayjs(period.endDate);
  let date = month === 'all' ? today : dayjs(`${month}-01`);
  if (month === today.format('YYYY-MM')) date = today;
  if (date.isBefore(start, 'day')) date = start;
  if (date.isAfter(end, 'day')) date = end;
  return date.format('YYYY-MM-DD');
}
