import type { Dayjs } from 'dayjs';

export interface IAddProcurementRequestDialogProps {
  data: any;
  isEdit: boolean;
  fromTeacher?: boolean;
}

export interface IProcurementAndVendorFromValues {
  resourceCategory: string;
  resourceName: string;
  purpose: string;
  quantity: number;
  expectedDeliveryDate: Dayjs | null;
  status?: string;
  requestedBy?: string;
}

export interface IAssignedToPurchase {
  assignedTo: string;
  priority: string;
  description: string;
}
