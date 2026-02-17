import * as Yup from 'yup';

export const feeHeadValidationSchema = Yup.object().shape({
  feeCategoryId: Yup.string().required('Fee Category is required'),
  name: Yup.string().required('Fee Head Name is required'),
});
