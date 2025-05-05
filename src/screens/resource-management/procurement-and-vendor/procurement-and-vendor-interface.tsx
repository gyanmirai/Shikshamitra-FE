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

export interface IProcurementTeacherTableProps {
  onClick: (data: IProcurementAndVendorFromValues, eventName: string) => void;
}

export interface IAddProcurementRequestFormProps {
  isEdit: boolean;
  data: IProcurementAndVendorFromValues | null;
  onClose: () => void;
  fromTeacher?: boolean;
}
