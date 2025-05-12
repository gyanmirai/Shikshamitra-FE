import type { IMyRequestResource } from './my-resource-request-interface';

export const getInitialRequestResourceValues = (
  data: Partial<IMyRequestResource> | null = {}
): IMyRequestResource => ({
  id: data?.id ?? Math.floor(Math.random() * 1000000000),
  name: data?.name ?? '',
  category: data?.category ?? '',
  subCategory: data?.subCategory ?? '',
  vendor: data?.vendor ?? '',
  condition: data?.condition ?? '',
  status: data?.status ?? '',
  quantity: data?.quantity ?? 1,
  measurementUnit: data?.measurementUnit ?? '',
  description: data?.description ?? '',
  image: data?.image ?? '',
  assignedDate: data?.assignedDate ?? null,
  priority: data?.priority ?? '',
  issueDescription: data?.issueDescription ?? '',
  issueSupportingDocument: data?.issueSupportingDocument ?? '',
  requestStatusType: data?.requestStatusType ?? '',
  reasonForNewResource: data?.reasonForNewResource ?? '',
  requiredByDate: data?.requiredByDate ?? null,
});
