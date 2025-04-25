import * as Yup from 'yup';

export const addSubCategoryValidationSchema = Yup.object({
  categoryName: Yup.string().required('Category name is required'),
  subcategoryName: Yup.string().required('Subcategory is required'),
});
