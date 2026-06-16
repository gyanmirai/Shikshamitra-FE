import dayjs from 'dayjs';

export function formatAcademicYearDateForPayload(value: dayjs.Dayjs | null | undefined): string {
  return value?.isValid() ? value.format('YYYY-MM-DD') : '';
}

export function parseAcademicYearDateForPicker(value?: string | null): dayjs.Dayjs {
  const dateOnly = String(value || '').slice(0, 10);
  return dayjs(dateOnly);
}
