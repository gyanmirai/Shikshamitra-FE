import dayjs from 'dayjs';
import * as Yup from 'yup';

export type LibraryHour = {
  day: string;
  startTime: string;
  endTime: string;
  status: number;
  isConfigured?: boolean;
};
export type LibraryHoursResponse = { items: LibraryHour[]; canManageHours?: boolean };
export const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function clockSeconds(value: string) {
  const match = /^(\d{1,2}):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,7}))?)?$/.exec(value);
  if (!match || Number(match[1]) > 23) return null;
  return (
    Number(match[1]) * 3600 +
    Number(match[2]) * 60 +
    Number(match[3] || 0) +
    Number(`0.${match[4] || 0}`)
  );
}
export function clockValue(raw: string) {
  if (clockSeconds(raw) === null) return null;
  const parts = raw.split(':');
  return dayjs(`2000-01-01T${parts[0].padStart(2, '0')}:${parts[1]}:${parts[2] || '00'}`);
}
export function needsClockReview(row: LibraryHour) {
  const start = clockSeconds(row.startTime);
  const end = clockSeconds(row.endTime);
  return row.status === 0 && (start === null || end === null || end <= start);
}
export function validHours(rows: LibraryHour[]) {
  return (
    rows.length > 0 &&
    rows.every((row) => {
      const start = clockSeconds(row.startTime);
      const end = clockSeconds(row.endTime);
      return (
        [0, 1, 2].includes(row.status) &&
        Boolean(row.day) &&
        (row.status !== 0 || (start !== null && end !== null && end > start))
      );
    })
  );
}
export function hoursDraft(source: LibraryHoursResponse): { hours: LibraryHour[] } {
  const rows = source.items.map((row) => ({ ...row, isConfigured: true }));
  weekdays
    .filter((day) => !source.items.some((row) => row.day.toLowerCase() === day.toLowerCase()))
    .forEach((day) =>
      rows.push({ day, startTime: '', endTime: '', status: 1, isConfigured: false })
    );
  const order = (day: string) =>
    weekdays.findIndex((known) => known.toLowerCase() === day.toLowerCase());
  return { hours: rows.sort((a, b) => order(a.day) - order(b.day)) };
}
export const hoursPayload = (hours: LibraryHour[]) => ({
  hours: hours.map(({ day, status, startTime, endTime }) => ({
    day,
    status,
    startTime: startTime || '00:00:00',
    endTime: endTime || '00:00:00',
  })),
});
export const hoursSchema = Yup.object({
  hours: Yup.array().of(
    Yup.object({
      day: Yup.string().required('Day is required'),
      status: Yup.number().oneOf([0, 1, 2]).required('Choose a status'),
      startTime: Yup.string().test(
        'clock',
        'Enter a valid 24-hour opening time',
        function valid(value) {
          return this.parent.status !== 0 || clockSeconds(value || '') !== null;
        }
      ),
      endTime: Yup.string().test(
        'clock',
        'Closing time must be later than opening time',
        function valid(value) {
          if (this.parent.status !== 0) return true;
          const start = clockSeconds(this.parent.startTime || '');
          const end = clockSeconds(value || '');
          return start !== null && end !== null && end > start;
        }
      ),
    })
  ),
});
