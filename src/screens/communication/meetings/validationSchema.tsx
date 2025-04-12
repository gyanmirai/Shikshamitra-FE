import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  status: Yup.string().required('Status is required'),

  audience: Yup.array()
    .min(1, 'Please select at least one audience')
    .required('Audience is required'),

  organization: Yup.array()
    .min(1, 'Please select at least one organization')
    .required('Organization is required'),

  className: Yup.array().min(1, 'Please select at least one class').required('Class is required'),

  division: Yup.array()
    .min(1, 'Please select at least one division')
    .required('Division is required'),

  students: Yup.array(),

  meetingDate: Yup.date()
    .nullable()
    .required('Meeting date is required')
    .typeError('Meeting date must be a valid date'),

  meetingTime: Yup.date()
    .nullable()
    .required('Meeting time is required')
    .typeError('Meeting time must be a valid time'),

  meetingAgenda: Yup.string().required('Meeting agenda is required'),

  link: Yup.string().url('Must be a valid URL').nullable(),

  meetingType: Yup.string().required('Meeting type is required'),

  classRoom: Yup.string().required('Classroom is required'),

  isRecurring: Yup.boolean(),

  day: Yup.string().when('isRecurring', (isRecurring, schema) =>
    isRecurring ? schema.required('Day is required for recurring meetings') : schema
  ),

  repeatFrequency: Yup.string().when('isRecurring', (isRecurring, schema) =>
    isRecurring ? schema.required('Repeat frequency is required') : schema
  ),

  repeatUntil: Yup.date()
    .nullable()
    .when('isRecurring', (isRecurring, schema) =>
      isRecurring
        ? schema
            .required('Repeat until date is required for recurring meetings')
            .min(Yup.ref('meetingDate'), 'Repeat until must be after the meeting date')
        : schema
    ),
});
