import type { IResourceCategoryFormValues } from './resource-category-interface';

export function getInitialResourceCategoryValues(
  data: Partial<IResourceCategoryFormValues> = {}, // Partial values
  isEdit = false
): IResourceCategoryFormValues {
  return {
    categoryName: isEdit ? (data.categoryName ?? '') : '',
  };
}
