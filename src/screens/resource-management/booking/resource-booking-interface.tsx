import type { Dayjs } from 'dayjs';

export interface IResourceBookingFormValues {
  resourceName: string;
  date: Dayjs | null;
  time: Dayjs | null;
  status: string;
  purpose?: string;
  requestedBy?: string;
  resourceCategory: string;
}

export interface IResourceBookingDialogProps {
  isEdit: boolean;
  data: IResourceBookingFormValues;
}
