import type { IResourceConditionStatusFormValues } from './resource-condition-interface';

export function getResourceConditionStatusInitialValues(
  data: Partial<IResourceConditionStatusFormValues> | null = null
): IResourceConditionStatusFormValues {
  return {
    resourceConditionStatusName: data?.resourceConditionStatusName || '',
    resourceConditionStatusDescription: data?.resourceConditionStatusDescription || '',
  };
}
