import * as Yup from 'yup';

export const upcomingEventvalidationSchema = Yup.object().shape({
  eventTitle: Yup.string().required('Event title is required'),
  eventVenue: Yup.string().required('Event venue is required'),
  audience: Yup.array()
    .min(1, 'Please select at least one audience')
    .required('Audience is required'),
  organization: Yup.array()
    .min(1, 'Please select at least one organization')
    .required('Organization is required'),
  className: Yup.array()
    .min(1, 'Please select at least one class')
    .required('Class name is required'),

  eventStartDate: Yup.date().nullable().required('Event start date is required'),

  //   eventEndDate: Yup.date()
  //     .nullable()
  //     .required('Event end date is required')
  //     .when('eventStartDate', (eventStartDate, schema) =>
  //       eventStartDate ? schema.min(eventStartDate, 'End date must be after start date') : schema
  //     ),
  eventEndDate: Yup.date()
    .nullable()
    .required('Event date is required')
    .min(Yup.ref('eventStartDate'), 'Event End date must be after start date'),

  eventType: Yup.string().required('Event type is required'),
  description: Yup.string().required('Description is required'),
  eventOrganizer: Yup.string().required('Event organizer is required'),

  eventBudget: Yup.number()
    .typeError('Budget must be a number')
    .positive('Budget must be a positive number')
    .required('Event budget is required'),
});
