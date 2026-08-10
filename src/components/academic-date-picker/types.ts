import type { Dayjs } from 'dayjs';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';

import type { DayType } from 'src/enums/academic-calendar';

export type AcademicCalendarDay = {
  id: string;
  date: string;
  dayType: DayType;
  title?: string | null;
  description?: string | null;
  appliesToAll?: boolean;
  standardId?: string | null;
  divisionId?: string | null;
  status?: number | null;
};

export type AcademicDatePickerValidationType =
  | 'Timetable'
  | 'HomeworkDueDate'
  | 'AssignmentDueDate'
  | 'ExamSchedule'
  | 'LessonPlan'
  | 'OnlineClass'
  | 'AttendanceSession'
  | 'PTMBooking'
  | 'EventSchedule'
  | string;

export type AcademicDatePickerProps = Omit<
  DatePickerProps,
  'shouldDisableDate' | 'slots' | 'slotProps'
> & {
  academicYearId?: string;
  academicMediumId?: string;
  calendarId?: string;
  standardId?: string | null;
  divisionId?: string | null;
  validationType?: AcademicDatePickerValidationType;
  blockedDayTypes?: DayType[];
  showCalendarMarkers?: boolean;
  helperText?: string;
  onBlockedDateClick?: (day: AcademicCalendarDay) => void;
  shouldDisableDate?: DatePickerProps['shouldDisableDate'];
  slots?: DatePickerProps['slots'];
  slotProps?: DatePickerProps['slotProps'];
};

export type AcademicDateTimePickerProps = Omit<
  DateTimePickerProps,
  'shouldDisableDate' | 'slots' | 'slotProps'
> & {
  academicYearId?: string;
  academicMediumId?: string;
  calendarId?: string;
  standardId?: string | null;
  divisionId?: string | null;
  validationType?: AcademicDatePickerValidationType;
  blockedDayTypes?: DayType[];
  showCalendarMarkers?: boolean;
  helperText?: string;
  onBlockedDateClick?: (day: AcademicCalendarDay) => void;
  shouldDisableDate?: DateTimePickerProps['shouldDisableDate'];
  slots?: DateTimePickerProps['slots'];
  slotProps?: DateTimePickerProps['slotProps'];
};
