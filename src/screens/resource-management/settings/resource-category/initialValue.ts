import type { IResourceCategoryFormValues } from './resource-category-interface';

export function getInitialResourceCategoryValues(
  data: Partial<IResourceCategoryFormValues> | null
): IResourceCategoryFormValues {
  return {
    categoryName: data?.categoryName ?? '',
  };
}
