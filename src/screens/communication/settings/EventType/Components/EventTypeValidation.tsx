import * as Yup from 'yup';

export const eventTypeValidationSchema = Yup.object().shape({
  eventType: Yup.string().trim().required('Event Type Name is required'),
  description: Yup.string().nullable(),
});
