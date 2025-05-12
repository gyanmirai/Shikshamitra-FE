import type { IResourceStatusFormValues } from './resource-status-interface';

export function getResourceStatusInitialValues(
  data: Partial<IResourceStatusFormValues> | null = null
): IResourceStatusFormValues {
  return {
    resourceStatusName: data?.resourceStatusName || '',
    resourceStatusDescription: data?.resourceStatusDescription || '',
  };
}
