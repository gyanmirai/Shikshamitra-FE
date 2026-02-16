import * as Yup from 'yup';

export const incomeCategoryValidationSchema = Yup.object().shape({
  name: Yup.string().required('Income Category Name is required'),
  tags: Yup.array()
    .of(Yup.string().required('Each tag must be a non-empty string'))
    .min(1, 'At least one tag is required')
    .required('Tags are required'),
});
