import type { Dayjs } from 'dayjs';

export interface IAddResourceDialogProps {
  open: boolean;
  handleClose: () => void;
  data: IAddResourceFormValues;
  isEdit?: boolean;
}

export interface IAddResourceFormValues {
  category: string;
  subCategory: string;
  itemName: string;
  resourceConditionStatus: string;
  resourceMeasurementUnit: string;

  quantity: string | number;
  campusName: string;
  buildingName: string;
  roomNumber: string;
  floorNumber: string;
  termAndCondition: string;
  warrantyExpiryDate: Dayjs | null;
  resourceImage: string;
  purchasedVendorName: string;
  resourceBill: string;
  resourcePurchaseDate: Dayjs | null;
  assignedTo?: string;
  serialNumber?: string;

  id: number;
}

export interface IIssueResourceFormValues {
  selectItem: string;
  issuedTo: string;
  quantity: string | number;
  purpose: string;
  date: Dayjs;
}

export interface IProcurementFormValues {
  selectItem: string;
  category: string;
  quantity: string | number;
  requestedBy: string;
  justification: string;
  prefrerredVendor: string;
  priority: string;
  estimatedCost: string;
}

export interface IIssueResourceDialogProps {
  open: boolean;
  handleClose: () => void;
  data: IIssueResourceFormValues;
  isEdit?: boolean;
}

export interface IProcurementResourceDialogProps {
  open: boolean;
  handleClose: () => void;
  data: IProcurementFormValues;
  isEdit?: boolean;
}

export interface IInventoryItem {
  itemCode: string;
  itemName: string;
  category: string;
  subCategory: string;
  resourceConditionStatus: string;
  resourceMeasurementUnit: string;
  quantity: number;
  available: number;
  campusName: string;
  buildingName: string;
  roomNumber: string;
  floorNumber: string;
  location: string;
  termAndCondition: string;
  warrantyExpiryDate: Dayjs | null;
  resourceImage: string;
  resourceBill: string;
  purchasedVendorName: string;
  resourcePurchaseDate: Dayjs | null;
  lastUpdatedDate: Dayjs;
  status: number;
}
export interface IInventoryManagementDetailsViewpProps {
  data: IInventoryItem;
}
