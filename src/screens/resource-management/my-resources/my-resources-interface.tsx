import type { Dayjs } from 'dayjs';

export interface IMyResources {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  vendor: string;
  condition: string;
  status: string;
  quantity: number;
  measurementUnit: string;
  description: string;
  image: string;
  assignedDate?: Dayjs | null;
  priority?: string;
  issueDescription?: string;
  issueSupportingDocument?: string;
}

export interface IMyResourcesTableProps {
  onClick: (data: IMyResources | null, eventName: string) => void;
}

export interface IRequestResourceFormValues {
  name: string;
  category: string;
  subCategory: string;

  quantity: number | null;
  measurementUnit: string;
  description: string;
  priority: string;
  requiredByDate: Dayjs | null;
}

export interface IRequestResourceFormProps {
  // isEdit: boolean;
  // data:  null;
  onClose: () => void;
}

export interface IRaiseConcernDialogProps {
  onClose: () => void;
  data: IMyResources;
}
