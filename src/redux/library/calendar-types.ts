import type { LibraryDayCountingMode } from './policy-types';

export type LibraryCalendarSettings = {
  timeZoneId: string | null;
  source: 'Library' | 'LegacyHr' | 'Unconfigured';
  needsConfiguration: boolean;
  hasValidOpenWeekday: boolean | null;
  canPublishAutomatedPolicy: boolean;
  canManageCalendar: boolean;
  configurationIssues: string[];
};
export type LibraryCalendarClosureRequest = {
  fromDate: string;
  toDate: string;
  sectionId?: string | null;
  reason: string;
  concurrencyStamp?: string | null;
};
export type LibraryCalendarClosure = LibraryCalendarClosureRequest & { id: string };
export type LibraryCalendarCalculateRequest = {
  academicYearId: string;
  startDate: string;
  days: number;
  dayCountingMode: LibraryDayCountingMode;
  sectionId?: string | null;
  moveToNextOpenDay: boolean;
};
export type LibraryCalendarCalculation = LibraryCalendarSettings & { dueDate: string };
