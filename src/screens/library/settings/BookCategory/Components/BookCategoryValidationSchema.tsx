import * as Yup from 'yup';

export const bookCategoryValidationSchema = Yup.object().shape({
  categoryName: Yup.string().required('Category Name is required'),
  description: Yup.string().nullable(),
});
