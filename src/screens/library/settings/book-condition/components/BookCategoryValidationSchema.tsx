import * as Yup from 'yup';

export const bookConditionValidationSchema = Yup.object().shape({
  conditionType: Yup.string().required('Category Name is required'),
  description: Yup.string().nullable(),
});
