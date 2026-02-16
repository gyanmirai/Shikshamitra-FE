import * as Yup from 'yup';

export const expenseCategoryValidationSchema = Yup.object().shape({
  name: Yup.string().required('Expense Category Name is required'),
  tags: Yup.array()
    .of(Yup.string().required('Each tag must be a non-empty string'))
    .min(1, 'At least one tag is required')
    .required('Tags are required'),
});
