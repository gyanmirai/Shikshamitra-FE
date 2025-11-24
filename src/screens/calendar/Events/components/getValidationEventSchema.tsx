import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const eventAnnouncementValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    id: Yup.string().nullable(), // not required for creation
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    type: Yup.string().required('Event Type is required'),
    organizations: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one organization is required')
      .required('Organizations are required'),
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

    startDate: Yup.mixed()
      .required('Start Date-Time is required')
      .test(
        'is-valid-dayjs',
        'Start Date-Time must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date-Time must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date-Time must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    endDate: Yup.mixed()
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
    // .test(
    //   'min-date',
    //   (value) =>
    //     `End Date-Time must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
    //   (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
    // )
    // .test(
    //   'max-date',
    //   (value) =>
    //     `End Date-Time must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
    //   (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
    // ),

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

    day: Yup.string().when('type', {
      is: 'meeting',
      then: (schema) => schema.required('Day is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    meetingDate: Yup.mixed().when('type', {
      is: 'meeting',
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
        const { endTime, type } = this.parent;
        if (type === 'meeting' && !value) {
          return this.createError({ message: 'Start Time is required' });
        }
        if (!value || !endTime) return true;

        return (value as Dayjs).isBefore(endTime);
      }),
    endTime: Yup.mixed()
      .nullable()

      // eslint-disable-next-line func-names
      .test('end-after-start', 'End Time must be after Start Time', function (value) {
        const { startTime, type } = this.parent;
        if (type === 'meeting' && !value) {
          return this.createError({ message: 'End Time is required' });
        }
        if (!value || !startTime) return true;
        // Compare times as HH:mm
        return (value as Dayjs).isAfter(startTime);
      }),
    isRecurring: Yup.boolean().when('type', {
      is: 'meeting',
      then: (schema) => schema,
      otherwise: (schema) => schema.nullable(),
    }),

    repeatFrequency: Yup.string().when(['type', 'isRecurring'], {
      is: (type: string, isRecurring: boolean) => type === 'meeting' && isRecurring === true,
      then: (schema) => schema.required('Repeat frequency is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    repeatUntil: Yup.mixed().when(['type', 'isRecurring'], {
      is: (type: string, isRecurring: boolean) => type === 'meeting' && isRecurring === true,
      then: (schema) => schema.required('Repeat until date is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    // 🔁 Custom recurrence validation
    customInterval: Yup.string().when(['type', 'isRecurring', 'repeatFrequency'], {
      is: (type: string, isRecurring: boolean, repeatFrequency: string) =>
        type === 'meeting' && isRecurring && repeatFrequency === 'Custom',
      then: (schema) =>
        schema
          .oneOf(['days', 'weeks', 'months'], 'Invalid interval type')
          .required('Repeat Every is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    customIntervalCount: Yup.number().when(['type', 'isRecurring', 'repeatFrequency'], {
      is: (type: string, isRecurring: boolean, repeatFrequency: string) =>
        type === 'meeting' && isRecurring && repeatFrequency === 'Custom',
      then: (schema) =>
        schema.required('Interval count is required').min(1, 'Interval must be at least 1'),
      otherwise: (schema) => schema.nullable(),
    }),

    customDays: Yup.array().when(['type', 'isRecurring', 'repeatFrequency', 'customInterval'], {
      is: (type: string, isRecurring: boolean, repeatFrequency: string, customInterval: string) =>
        type === 'meeting' &&
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
