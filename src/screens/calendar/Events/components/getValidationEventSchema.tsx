import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { isMeetingEventTypeName } from './buildEventPayload';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const formatDate = (value: dayjs.Dayjs | null) =>
  value && value.isValid() ? value.format('DD/MM/YYYY') : '-';

export const eventAnnouncementValidationSchema = (currentYear: any) => {
  const academicStart = currentYear?.startDate ? dayjs(currentYear.startDate) : null;
  const academicEnd = currentYear?.endDate ? dayjs(currentYear.endDate) : null;

  return Yup.object().shape({
    id: Yup.string().nullable(), // not required for creation
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    type: Yup.string().required('Event Type is required'),
    audience: Yup.array()
      .of(
        Yup.string()
          .trim()
          .min(1, 'Audience cannot be empty')
          .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Audience contains invalid characters')
      )
      .min(1, 'At least one audience is required')
      .required('Audience is required'),
    // classes: Yup.array()
    //   .of(Yup.string())
    //   .min(1, 'At least one class must be selected')
    //   .required('Classes are required'),
    // divisions: Yup.array()
    //   .of(Yup.string())
    //   .min(1, 'At least one division must be selected')
    //   .required('Divisions are required'),

    startDate: Yup.mixed().when('typeName', {
      is: (typeName: string) => !isMeetingEventTypeName(typeName),
      then: (schema) =>
        schema
          .required('Start Date-Time is required')
          .test(
            'is-valid-dayjs',
            'Start Date-Time must be a valid date',
            (value) => value && dayjs(value as Dayjs).isValid()
          )
          .test(
            'min-date',
            () => `Start Date-Time must be on or after ${formatDate(academicStart)}`,
            (value) =>
              !academicStart ||
              !academicStart.isValid() ||
              (value && dayjs(value as Dayjs).isSameOrAfter(academicStart, 'day'))
          )
          .test(
            'max-date',
            () => `Start Date-Time must be on or before ${formatDate(academicEnd)}`,
            (value) =>
              !academicEnd ||
              !academicEnd.isValid() ||
              (value && dayjs(value as Dayjs).isSameOrBefore(academicEnd, 'day'))
          ),
      otherwise: (schema) => schema.nullable(),
    }),

    endDate: Yup.mixed().when('typeName', {
      is: (typeName: string) => !isMeetingEventTypeName(typeName),
      then: (schema) =>
        schema
          .required('End Date-Time is required')
          .test(
            'is-valid-dayjs',
            'End Date-Time must be a valid date',
            (value) => value && dayjs(value as Dayjs).isValid()
          )
          .test(
            'is-after-start-date',
            'End Date-Time cannot be before Start Date-Time',
            // eslint-disable-next-line func-names
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return dayjs(value as Dayjs).isSameOrAfter(dayjs(startDate), 'day');
            }
          ),
      otherwise: (schema) => schema.nullable(),
    }),

    link: Yup.string().url('Must be a valid URL').nullable(),

    attachment: Yup.mixed<File>()
      .nullable()
      .test('fileSize', 'File size is too large (max 10MB)', (file) => {
        if (!file) return true;
        return file.size <= 10 * 1024 * 1024;
      }),

    eventMode: Yup.string()
      .oneOf(['offline', 'online'], 'Invalid event mode')
      .required('Event mode is required'),

    onlineLink: Yup.string().when('eventMode', {
      is: 'online',
      then: (schema) =>
        schema.required('Online link is required for online events').url('Must be a valid URL'),
      otherwise: (schema) => schema.nullable(),
    }),

    venue: Yup.string().when('eventMode', {
      is: 'offline',
      then: (schema) => schema.required('Venue is required for offline events'),
      otherwise: (schema) => schema.nullable(),
    }),

    active: Yup.number().nullable(),
    createdBy: Yup.string().nullable(),
    createdOn: Yup.mixed().nullable(),
    status: Yup.number().required('Status is required'),

    day: Yup.string().when('typeName', {
      is: (typeName: string) => isMeetingEventTypeName(typeName),
      then: (schema) => schema.required('Day is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    meetingDate: Yup.mixed().when('typeName', {
      is: (typeName: string) => isMeetingEventTypeName(typeName),
      then: (schema) =>
        schema
          .required('Meeting date is required')
          .test(
            'is-valid-dayjs',
            'Meeting date must be valid',
            (value) => value && dayjs(value as any).isValid()
          ),
      otherwise: (schema) => schema.nullable(),
    }),
    // meetingTime: Yup.mixed().when('type', {
    //   is: 'meeting',
    //   then: (schema) => schema.required('Meeting time is required'),
    //   otherwise: (schema) => schema.nullable(),
    // }),
    startTime: Yup.mixed()
      .nullable()

      // eslint-disable-next-line func-names
      .test('start-before-end', 'Start Time must be before End Time', function (value) {
        const { endTime, typeName } = this.parent;
        if (isMeetingEventTypeName(typeName) && !value) {
          return this.createError({ message: 'Start Time is required' });
        }
        if (!value || !endTime) return true;

        return (value as Dayjs).isBefore(endTime);
      }),
    endTime: Yup.mixed()
      .nullable()

      // eslint-disable-next-line func-names
      .test('end-after-start', 'End Time must be after Start Time', function (value) {
        const { startTime, typeName } = this.parent;
        if (isMeetingEventTypeName(typeName) && !value) {
          return this.createError({ message: 'End Time is required' });
        }
        if (!value || !startTime) return true;
        // Compare times as HH:mm
        return (value as Dayjs).isAfter(startTime);
      }),
    isRecurring: Yup.boolean().when('typeName', {
      is: (typeName: string) => isMeetingEventTypeName(typeName),
      then: (schema) => schema,
      otherwise: (schema) => schema.nullable(),
    }),

    repeatFrequency: Yup.string().when(['typeName', 'isRecurring'], {
      is: (typeName: string, isRecurring: boolean) =>
        isMeetingEventTypeName(typeName) && isRecurring === true,
      then: (schema) => schema.required('Repeat frequency is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    repeatUntil: Yup.mixed().when(['typeName', 'isRecurring'], {
      is: (typeName: string, isRecurring: boolean) =>
        isMeetingEventTypeName(typeName) && isRecurring === true,
      then: (schema) => schema.required('Repeat until date is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    // Custom recurrence validation
    customInterval: Yup.string().when(['typeName', 'isRecurring', 'repeatFrequency'], {
      is: (typeName: string, isRecurring: boolean, repeatFrequency: string) =>
        isMeetingEventTypeName(typeName) && isRecurring && repeatFrequency === 'Custom',
      then: (schema) =>
        schema
          .oneOf(['days', 'weeks', 'months'], 'Invalid interval type')
          .required('Repeat Every is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    customIntervalCount: Yup.number().when(['typeName', 'isRecurring', 'repeatFrequency'], {
      is: (typeName: string, isRecurring: boolean, repeatFrequency: string) =>
        isMeetingEventTypeName(typeName) && isRecurring && repeatFrequency === 'Custom',
      then: (schema) =>
        schema.required('Interval count is required').min(1, 'Interval must be at least 1'),
      otherwise: (schema) => schema.nullable(),
    }),

    customDays: Yup.array().when(['typeName', 'isRecurring', 'repeatFrequency', 'customInterval'], {
      is: (
        typeName: string,
        isRecurring: boolean,
        repeatFrequency: string,
        customInterval: string
      ) =>
        isMeetingEventTypeName(typeName) &&
        isRecurring &&
        repeatFrequency === 'Custom' &&
        customInterval === 'weeks',
      then: (schema) =>
        schema
          .of(
            Yup.string().oneOf([
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ])
          )
          .min(1, 'At least one day must be selected'),
      otherwise: (schema) => schema.nullable(),
    }),
  });
};
