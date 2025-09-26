import dayjs from 'dayjs';
import * as Yup from 'yup';

export const schoolWiseValidationSchema = (currentYear: any) =>
  Yup.object({
    title: Yup.string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters long'),
    type: Yup.string().required('Announcement Type is required'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters long'),

    status: Yup.string().required('Status is required'),

    audience: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(),
          color: Yup.string().required(),
        })
      )
      .min(1, 'At least one audience is required'),

    startDate: Yup.mixed()
      .required('Start Date-Time is required')
      .test(
        'is-valid-dayjs',
        'Start Date-Time must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'not-past-date',
        'Start Date-Time cannot be in the past',
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(), 'minute')
      )
      .test(
        'min-date',
        (value) =>
          `Start Date-Time must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date-Time must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    endDate: Yup.mixed()
      .required('End Date-Time is required')
      .test(
        'is-valid-dayjs',
        'End Date-Time must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test('is-after-start-date', 'End Date-Time cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(startDate));
      })
      .test(
        'min-date',
        (value) =>
          `End Date-Time must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `End Date-Time must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    category: Yup.string().required('Category is required'),

    link: Yup.string().url('Enter a valid URL').optional(),

    notification_preferences: Yup.array()
      .of(Yup.string())
      .min(1, 'Select at least one notification preference')
      .required('Notification preferences are required'),

    isScheduled: Yup.boolean(),
  });

export const classWiseValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    title: Yup.string().required('Title is required'),
    type: Yup.string().required('Announcement Type is required'),
    description: Yup.string().required('Description is required'),
    organizations: Yup.array().min(1, 'At least one organization is required'),
    audience: Yup.array().min(1, 'At least one audience is required'),
    classes: Yup.array().min(1, 'At least one class must be selected'),
    divisions: Yup.array().min(1, 'At least one division must be selected'),
    startDate: Yup.mixed()
      .required('Start Date-Time is required')
      .test(
        'is-valid-dayjs',
        'Start Date-Time must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'not-past-date',
        'Start Date-Time cannot be in the past',
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(), 'minute')
      )
      .test(
        'min-date',
        (value) =>
          `Start Date-Time must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date-Time must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    endDate: Yup.mixed()
      .required('End Date-Time is required')
      .test(
        'is-valid-dayjs',
        'End Date-Time must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test('is-after-start-date', 'End Date-Time cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(startDate));
      })
      .test(
        'min-date',
        (value) =>
          `End Date-Time must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `End Date-Time must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    importance_level: Yup.string().required('Importance level is required'),
    link: Yup.string().url('Must be a valid URL').nullable(),
    notification_preferences: Yup.array()
      .of(Yup.string())
      .min(1, 'Select at least one notification preference')
      .required('Notification preferences are required'),
  });
