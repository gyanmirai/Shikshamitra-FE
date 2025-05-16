import type { Dayjs } from 'dayjs';

export interface IWalkInVisitorFormValues {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitingTime: Dayjs | null;
  visitingDate: Dayjs | null;
  visitingPurpose: string;
  status?: string;
}

export interface IWalkInVisitorTableProps {
  onClick: (data: IWalkInVisitorFormValues | null, eventName: string) => void;
}

export interface IWalkInVisitorFormProps {
  isEdit: boolean;
  data: IWalkInVisitorFormValues | null;
  onClose: () => void;
}
