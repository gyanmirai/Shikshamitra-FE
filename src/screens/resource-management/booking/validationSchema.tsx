import * as Yup from 'yup';

export const bookingValidationSchema = Yup.object().shape({
  resourceName: Yup.string().required('Resource name is required'),
  resourceCategory: Yup.string().required('Resource Category is required'),

  date: Yup.date().nullable().required('Date is required'),

  time: Yup.date().nullable().required('Time is required'),

  purpose: Yup.string().required('Purpose is required'),
});
