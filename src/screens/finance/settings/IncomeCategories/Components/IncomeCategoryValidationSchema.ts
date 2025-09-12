import * as Yup from 'yup';

export const incomeCategoryValidationSchema = Yup.object().shape({
  incomeCategoryName: Yup.string().required('Income Category Name is required'),
});
