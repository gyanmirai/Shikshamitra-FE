import type { IResourceSubCategoryFormValues } from './resource-subcategory-interface';

export function getInitialSubCategoryValues(
  data: Partial<IResourceSubCategoryFormValues> | null = null
): IResourceSubCategoryFormValues {
  return {
    categoryName: data?.categoryName ?? '',
    subcategoryName: Array.isArray(data?.subcategoryName) ? data.subcategoryName : [''],
  };
}
