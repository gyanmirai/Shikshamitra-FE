import { CalendarStatus } from 'src/enums/academic-calendar';

type CalendarCandidate = {
  id: string;
  status?: number;
  isDefault?: boolean;
  startDate?: string;
  endDate?: string;
};

// Calendar lists arrive newest first. Preserve that order within each priority.
export function resolveAcademicCalendarId(calendars: CalendarCandidate[], date: string): string {
  const covering = calendars.filter(
    (calendar) =>
      calendar.status !== CalendarStatus.Archived &&
      (!calendar.startDate || calendar.startDate.slice(0, 10) <= date) &&
      (!calendar.endDate || calendar.endDate.slice(0, 10) >= date)
  );
  return (
    covering.find((calendar) => calendar.status === CalendarStatus.Published)?.id ||
    covering.find((calendar) => calendar.isDefault)?.id ||
    covering[0]?.id ||
    ''
  );
}
