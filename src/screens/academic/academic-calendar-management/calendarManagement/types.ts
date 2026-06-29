import type { DayType, HolidayCategory } from 'src/enums/academic-calendar';

export interface CalendarFormValues {
  academicYearId: string;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isDefault: boolean;
}

export interface CalendarDayFormValues {
  date: string | null;
  endDate: string | null;
  dayType: DayType | '';
  holidayCategory: HolidayCategory | '';
  title: string;
  description: string;
  appliesToAll: boolean;
  standardId: string;
  divisionId: string;
  startTime: string;
  endTime: string;
  blocksTimetable: boolean;
  blocksHomeworkDueDate: boolean;
  blocksExamSchedule: boolean;
  blocksLessonPlan: boolean;
  blocksOnlineClass: boolean;
  exemptAttendance: boolean;
  changeReason: string;
}
