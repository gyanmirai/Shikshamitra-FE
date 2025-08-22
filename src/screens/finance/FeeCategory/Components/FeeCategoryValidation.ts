import * as Yup from 'yup';

export const feeCategoryValidationSchema = Yup.object().shape({
  feeCategoryName: Yup.string()
    .required('Fee Category Name is required')
    .min(2, 'Too short')
    .max(50, 'Too long'),
});
