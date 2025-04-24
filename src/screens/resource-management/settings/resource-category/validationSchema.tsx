import * as Yup from 'yup';

export const addResourceCategoryValidationSchema = Yup.object({
  categoryName: Yup.string().required('Category name is required'),
});
