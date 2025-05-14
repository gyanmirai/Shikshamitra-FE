import type { Dayjs } from 'dayjs';

export interface IVisitorPreApprovalFormValues {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitingTime: Dayjs | null;
  visitingDate: Dayjs | null;
  visitingPurpose: string;
  status: string;
}

export interface IVisitorPreApprovalTableTableProps {
  onClick: (data: IVisitorPreApprovalFormValues | null, eventName: string) => void;
}

export interface IVisitorPreApprovedFormProps {
  isEdit: boolean;
  data: IVisitorPreApprovalFormValues | null;
  onClose: () => void;
}
