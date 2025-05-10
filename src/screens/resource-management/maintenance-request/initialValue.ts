import type { IResourceRequestMaintenance } from './resource-maintenance-request-interface';

export const getInitialResourceRequestMaintenanceValues = (
  data: Partial<IResourceRequestMaintenance> | null = {}
): IResourceRequestMaintenance => ({
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

  requiredByDate: data?.requiredByDate ?? null,

  reasonByAdmin: data?.reasonByAdmin ?? '',

  assignedEngineer: data?.assignedEngineer ?? '',
  costing: data?.costing ?? '',
  maintenanceStatus: data?.maintenanceStatus ?? null,
  repairBill: data?.repairBill ?? '',
  notRepairbleReason: data?.notRepairbleReason ?? '',
});
