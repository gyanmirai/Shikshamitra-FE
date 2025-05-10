import type { Dayjs } from 'dayjs';

export interface IResourceRequestOrder {
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
  reasonForNewResource?: string;
  requiredByDate?: Dayjs | null;
  orderStatus?: number;

  // admin review request and fill below filed if they want approved
  approvedQuantity?: number | null;
  reasonByAdmin?: string;
  assignedVendor?: string;
  assignedEngineer?: string;
  costing?: string;
  orderQuantity?: number | null;
  orderBill?: string;
  returnOrderReason?: string;
  cancelOrderReason?: string;
}

export interface IResourceRequestOrderDialogProps {
  data: IResourceRequestOrder | null;
  onClose: () => void;
  isEdit: boolean;
  requestStatusType: string;
  orderStatus: string;
}

// export interface IResourceRequestReviewTableProps {
//   onClick: (data: IResourceRequestReview , eventName: string) => void;
// }
