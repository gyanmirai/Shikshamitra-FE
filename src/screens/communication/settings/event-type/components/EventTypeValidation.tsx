import * as Yup from 'yup';

export const eventTypeValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Event Type Name is required'),
  description: Yup.string().nullable(),
  color: Yup.string().required('Color is required'),
});
