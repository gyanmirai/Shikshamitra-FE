import * as Yup from 'yup';

export const libraryAddCategoryValidationSchema = Yup.object().shape({
  categoryName: Yup.string().required('categoryName is required'),
  description: Yup.string().required('description is required'),
});
