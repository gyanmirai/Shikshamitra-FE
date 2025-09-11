import dayjs from 'dayjs';
import * as Yup from 'yup';

export const schoolWiseValidationSchema = (currentYear: any) =>
  Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters long'),

    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters long'),

    status: Yup.string().required('Status is required'),

    audience: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one audience must be selected')
      .required('Audience is required'),

    startDate: Yup.mixed()
      .required('Chapter Start Date is required')
      .test(
        'is-valid-dayjs',
        'Start Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    endDate: Yup.mixed()
      .required('Chapter End Date is required')
      .test(
        'is-valid-dayjs',
        'End Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(startDate));
      })
      .test(
        'min-date',
        (value) =>
          `End Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `End Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    category: Yup.string().required('Category is required'),

    importance_level: Yup.string().required('Importance level is required'),

    link: Yup.string().url('Enter a valid URL').optional(),

    notification_preferences: Yup.array()
      .of(Yup.string())
      .min(1, 'Select at least one notification preference')
      .required('Notification preferences are required'),

    isScheduled: Yup.boolean(),
  });

export const classWiseValidationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  audience: Yup.array().min(1, 'At least one audience is required'),
  className: Yup.array().min(1, 'At least one class must be selected'),
  division: Yup.array().min(1, 'At least one division must be selected'),
  category: Yup.string().required('Category is required'),
  importance_level: Yup.string().required('Importance level is required'),
  link: Yup.string().url('Must be a valid URL').nullable(),
  notification_preferences: Yup.array(),
  isScheduled: Yup.boolean(),

  publishDate: Yup.date()
    .nullable()
    .when('isScheduled', (isScheduled, schema) =>
      isScheduled
        ? schema
            .required('Schedule Date & Time is required')
            .min(new Date(), 'Schedule Date & Time must be in the future')
        : schema.nullable()
    ),

  expiryDate: Yup.date()
    .nullable()
    .min(Yup.ref('publishDate'), 'Expiry Date must be after Schedule Date & Time')
    .required('Expiry Date is required'),

  status: Yup.string().oneOf(['Published', 'Draft'], 'Invalid status'),
});
