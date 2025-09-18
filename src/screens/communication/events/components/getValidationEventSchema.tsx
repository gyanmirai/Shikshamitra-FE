import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const eventAnnouncementValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    id: Yup.string().nullable(), // not required for creation
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    type: Yup.string().required('Event Type is required'),
    organizations: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one organization is required')
      .required('Organizations are required'),
    audience: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one audience is required')
      .required('Audience is required'),
    classes: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one class must be selected')
      .required('Classes are required'),
    divisions: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one division must be selected')
      .required('Divisions are required'),

    startDate: Yup.mixed()
      .required('Start Date is required')
      .test(
        'is-valid-dayjs',
        'Start Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    endDate: Yup.mixed()
      .required('End Date is required')
      .test(
        'is-valid-dayjs',
        'End Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(startDate), 'day');
      })
      .test(
        'min-date',
        (value) =>
          `End Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `End Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

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
  });
