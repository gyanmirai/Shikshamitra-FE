import type { IResourceRequestReview } from './resource-review-request-interface';

export const getInitialResourceRequestReviewValues = (
  data: Partial<IResourceRequestReview> | null = {}
): IResourceRequestReview => ({
  id: data?.id ?? Math.floor(Math.random() * 1000000000),
  name: data?.name ?? '',
  category: data?.category ?? '',
  subCategory: data?.subCategory ?? '',
  purchasedVendor: data?.purchasedVendor ?? '',
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
  approvedQuantity: data?.approvedQuantity ?? null,
  reasonByAdmin: data?.reasonByAdmin ?? '',
  //   assignedVendor: '',
  //   assignedEngineer: '',
  //   costing: '',
  //   orderQuantity: null,
});
