import type { Dayjs } from 'dayjs';

export interface IAddResourceDialogProps {
  open: boolean;
  handleClose: () => void;
  data: IAddResourceFormValues;
  isEdit?: boolean;
}

export interface IAddResourceFormValues {
  itemName: string;
  categoryName: string;
  quantity: string | number;
  storageLocation: string;
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
