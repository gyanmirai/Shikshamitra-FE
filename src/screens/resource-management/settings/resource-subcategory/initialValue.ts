import type { IResourceSubCategoryFormValues } from './resource-subcategory-interface';

export function getInitialSubCategoryValues(
  data: Partial<IResourceSubCategoryFormValues> = {},
  isEdit = false
): IResourceSubCategoryFormValues {
  return {
    categoryName: isEdit ? (data.categoryName ?? '') : '',
    subcategoryName: isEdit ? (data.subcategoryName ?? '') : '',
  };
}
