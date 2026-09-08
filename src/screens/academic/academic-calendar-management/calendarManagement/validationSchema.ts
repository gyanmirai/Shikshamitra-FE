import * as Yup from 'yup';
import { DayType } from 'src/enums/academic-calendar';

import { normalizeCalendarDayTitle } from './calendarDayText';
import {
  CALENDAR_DAY_TITLE_MAX_LENGTH,
  CALENDAR_DAY_DESCRIPTION_MAX_LENGTH,
  CALENDAR_DAY_TITLE_MAX_LENGTH_MESSAGE,
  CALENDAR_DAY_DESCRIPTION_MAX_LENGTH_MESSAGE,
} from './calendarDay.constants';

export const calendarValidationSchema = Yup.object().shape({
  academicMediumId: Yup.string().required('Academic Medium is required'),
  name: Yup.string()
    .min(3, 'Calendar name must be at least 3 characters')
    .required('Calendar name is required'),
  startDate: Yup.mixed().required('Start date is required'),
  endDate: Yup.mixed()
    .required('End date is required')
    .test('end-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return new Date(value as string) > new Date(startDate as string);
    }),
});

export const calendarDayValidationSchema = (isPublished: boolean) =>
  Yup.object()
    .shape({
      title: Yup.string()
        .transform(normalizeCalendarDayTitle)
        .required('Title is required')
        .min(2, 'Title must be at least 2 characters')
        .max(CALENDAR_DAY_TITLE_MAX_LENGTH, CALENDAR_DAY_TITLE_MAX_LENGTH_MESSAGE),
      description: Yup.string().max(
        CALENDAR_DAY_DESCRIPTION_MAX_LENGTH,
        CALENDAR_DAY_DESCRIPTION_MAX_LENGTH_MESSAGE
      ),
      dayType: Yup.mixed().required('Day Type is required').notOneOf([''], 'Day Type is required'),
      date: Yup.mixed().required('Date is required'),
      endDate: Yup.mixed().when('dayType', {
        is: (v: any) => Number(v) === DayType.Vacation,
        then: (schema) => schema.required('End date is required for vacation'),
        otherwise: (schema) => schema.nullable(),
      }),
      holidayCategory: Yup.mixed().when('dayType', {
        is: (v: any) => Number(v) === DayType.Holiday,
        then: (schema) =>
          schema
            .required('Holiday Category is required')
            .notOneOf([''], 'Holiday Category is required'),
        otherwise: (schema) => schema.nullable(),
      }),
      startTime: Yup.string().when('dayType', {
        is: (v: any) => [DayType.HalfDay, DayType.PTM].includes(Number(v)),
        then: (schema) => schema.required('Start time is required for this day type'),
        otherwise: (schema) => schema,
      }),
      endTime: Yup.string().when('dayType', {
        is: (v: any) => [DayType.HalfDay, DayType.PTM].includes(Number(v)),
        then: (schema) => schema.required('End time is required for this day type'),
        otherwise: (schema) => schema,
      }),
      venue: Yup.string().when('dayType', {
        is: (v: any) => Number(v) === DayType.Event,
        then: (schema) => schema.max(256, 'Venue cannot exceed 256 characters'),
        otherwise: (schema) => schema.strip(),
      }),
      examTypeId: Yup.string().when('dayType', {
        is: (v: any) => Number(v) === DayType.Exam,
        then: (schema) => schema.required('Exam type is required'),
        otherwise: (schema) => schema.strip(),
      }),
      linkedExamId: Yup.string().when('dayType', {
        is: (v: any) => Number(v) === DayType.Exam,
        then: (schema) => schema,
        otherwise: (schema) => schema.strip(),
      }),
      examStartTime: Yup.string().when(['dayType', 'linkedExamId'], {
        is: (dayType: any, linkedExamId: string) =>
          Number(dayType) === DayType.Exam && Boolean(linkedExamId),
        then: (schema) => schema,
        otherwise: (schema) => schema.strip(),
      }),
      examEndTime: Yup.string().when(['dayType', 'linkedExamId'], {
        is: (dayType: any, linkedExamId: string) =>
          Number(dayType) === DayType.Exam && Boolean(linkedExamId),
        then: (schema) => schema,
        otherwise: (schema) => schema.strip(),
      }),
      ptmMode: Yup.string().when('dayType', {
        is: (v: any) => Number(v) === DayType.PTM,
        then: (schema) => schema.required('PTM mode is required'),
        otherwise: (schema) => schema.strip(),
      }),
      roomId: Yup.string().when(['dayType', 'ptmMode'], {
        is: (dayType: any, ptmMode: string) =>
          Number(dayType) === DayType.PTM && ['inPerson', 'hybrid'].includes(ptmMode),
        then: (schema) => schema.required('Room is required for in-person PTM'),
        otherwise: (schema) => schema.strip(),
      }),
      meetingLink: Yup.string().when(['dayType', 'ptmMode'], {
        is: (dayType: any, ptmMode: string) =>
          Number(dayType) === DayType.PTM && ['online', 'hybrid'].includes(ptmMode),
        then: (schema) =>
          schema.url('Enter a valid meeting link').required('Meeting link is required'),
        otherwise: (schema) => schema.strip(),
      }),
      standardIds: Yup.array()
        .of(Yup.string())
        .when('appliesToAll', {
          is: false,
          then: (schema) => schema.min(1, 'Select at least one class when not applying to all'),
          otherwise: (schema) => schema,
        }),
      changeReason: isPublished
        ? Yup.string().required('Change reason is required for published calendar')
        : Yup.string(),
    })
    .test('time-ranges', function (values) {
      const dayType = Number(values?.dayType);
      const compare = (
        start?: string,
        end?: string,
        message = 'End time must be later than start time.'
      ) => {
        if (start && end && start >= end) {
          return this.createError({ path: 'endTime', message });
        }
        return true;
      };

      if (dayType === DayType.Event || dayType === DayType.HalfDay || dayType === DayType.PTM) {
        const result = compare(values?.startTime, values?.endTime);
        if (result !== true) return result;
      }

      if (dayType === DayType.Exam && values?.linkedExamId) {
        const result = compare(
          values?.examStartTime,
          values?.examEndTime,
          'Exam end time must be later than exam start time.'
        );
        if (result !== true)
          return this.createError({ path: 'examEndTime', message: result.message });
      }

      return true;
    });
