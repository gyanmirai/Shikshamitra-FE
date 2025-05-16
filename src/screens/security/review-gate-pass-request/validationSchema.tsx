import * as Yup from 'yup';

export const reviewEarlyPassRequestValidationSchema = Yup.object().shape({
  description: Yup.string().required('Description is required'),
});
