import type { Dayjs } from 'dayjs';

import type { IMyResources } from '../my-resources/my-resources-interface';

export interface IMyRequestResourceTableProps {
  onClick: (data: IMyResources | null, eventName: string) => void;
}

export interface IMyRequestResource {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  vendor?: string;
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
}

export interface IResourceRequestDetailedViewProps {
  data: IMyRequestResource | null;
  onClose: () => void;
  isEdit: boolean;
  requestStatusType: string;
}
