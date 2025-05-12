import type { Dayjs } from 'dayjs';

export interface IResourceRequestMaintenance {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  purchasedVendor?: string;
  condition?: string;
  status: string;
  quantity: number;
  measurementUnit: string;
  description: string;
  image?: string;
  assignedDate?: Dayjs | null;
  priority?: string;
  issueDescription?: string;
  issueSupportingDocument?: string;
  requestStatusType: string;

  requiredByDate?: Dayjs | null;
  maintenanceStatus?: number | null;

  reasonByAdmin?: string;

  assignedEngineer?: string;
  costing?: string;

  repairBill?: string;
  notRepairbleReason?: string;
}

export interface IResourceRequestMaintenanceDialogProps {
  data: IResourceRequestMaintenance | null;
  onClose: () => void;
  isEdit: boolean;

  maintenanceStatus: string;
}

// export interface IResourceRequestReviewTableProps {
//   onClick: (data: IResourceRequestReview , eventName: string) => void;
// }
