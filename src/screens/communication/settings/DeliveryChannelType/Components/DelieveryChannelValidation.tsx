import * as Yup from 'yup';

// Validation Schema
export const deliveryChannelValidationSchema = Yup.object().shape({
  deliveryChannel: Yup.string().required('Delivery Channel Name is required'),
  description: Yup.string().nullable(),
  color: Yup.string().required('Color is required'),
});
