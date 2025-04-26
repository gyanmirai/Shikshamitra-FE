import type { Dayjs } from 'dayjs';

export interface IResourceAllocateFormValues {
  resourceName: string;

  quantity?: number;

  allocationDate: Dayjs | null;
  expectedReturnDate: Dayjs | null;
  purposeOfAllocation: string;

  currentLocation: string;

  allocationTarget: string;
  assignedTo: string;
  transferDate: Dayjs | null;

  reasonOfTransfer: string;
}

export interface IResourceAllocateDialogProps {
  data: IResourceAllocateFormValues;
  isEdit: boolean;
}

export interface IResourceTransferDialogProps {
  data: IResourceAllocateFormValues;
  isEdit: boolean;
}

export interface IResourceViewDialogTeacherProps {
  data: IResourceAllocateFormValues;
}
