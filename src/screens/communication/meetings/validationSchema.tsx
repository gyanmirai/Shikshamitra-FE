import dayjs from 'dayjs';
import * as Yup from 'yup';

export const meetingValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    title: Yup.string().required('Title is required'),
    type: Yup.string().required('Meeting type is required'),
    description: Yup.string().required('Description is required'),
    importance_level: Yup.string().required('Importance level is required'),

    organizations: Yup.array().min(1, 'At least one organization is required'),
    audience: Yup.array().min(1, 'At least one audience is required'),
    classes: Yup.array().min(1, 'At least one class must be selected'),
    divisions: Yup.array().min(1, 'At least one division must be selected'),
    students: Yup.array(),

    startDate: Yup.mixed()
      .required('Start Date is required')
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
      .required('End Date is required')
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

    meetingDate: Yup.mixed()
      .required('Meeting date is required')
      .test(
        'is-valid-dayjs',
        'Meeting date must be valid',
        (value) => value && dayjs(value as any).isValid()
      ),

    meetingTime: Yup.mixed().required('Meeting time is required'),

    meetingAgenda: Yup.string().required('Meeting agenda is required'),

    link: Yup.string().url('Must be a valid URL').nullable(),

    meetingType: Yup.string().required('Meeting type is required'),
    classRoom: Yup.string().required('Classroom is required'),

    isRecurring: Yup.boolean(),

    repeatFrequency: Yup.string().when('isRecurring', {
      is: true,
      then: (schema) => schema.required('Repeat frequency is required'),
    }),
    repeatUntil: Yup.mixed().when('isRecurring', {
      is: true,
      then: (schema) => schema.required('Repeat until date is required'),
    }),
  });
