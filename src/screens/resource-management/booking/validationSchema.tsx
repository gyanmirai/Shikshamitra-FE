import * as Yup from 'yup';

export const bookingValidationSchema = Yup.object().shape({
  resourceName: Yup.string().required('Resource name is required'),

  date: Yup.date().nullable().required('Date is required'),

  time: Yup.date().nullable().required('Time is required'),

  purpose: Yup.string().optional().max(200, 'Purpose must be 200 characters or less'),
});
