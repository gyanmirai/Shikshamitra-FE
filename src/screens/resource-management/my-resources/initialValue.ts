import dayjs from 'dayjs';

import type { IMyResources, IRequestResourceFormValues } from './my-resources-interface';

export const initialRequestResourceValues: IRequestResourceFormValues = {
  name: '',
  category: '',
  subCategory: '',
  quantity: null,
  measurementUnit: '',
  description: '',
  priority: '',
  requiredByDate: null,
};

export function getMyResourceInitialValues(
  data: Partial<IMyResources> | null = null
): IMyResources {
  return {
    id: data?.id || 0,
    name: data?.name || '',
    category: data?.category || '',
    subCategory: data?.subCategory || '',
    vendor: data?.vendor || '',
    condition: data?.condition || '',
    status: data?.status || '',
    quantity: data?.quantity || 0,
    measurementUnit: data?.measurementUnit || '',
    description: data?.description || '',
    image: data?.image || '',
    assignedDate: data?.assignedDate || dayjs(),
    priority: data?.priority || '',
    issueDescription: data?.issueDescription || '',
    issueSupportingDocument: data?.issueSupportingDocument || '',
  };
}
