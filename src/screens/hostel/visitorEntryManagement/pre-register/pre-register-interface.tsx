import type { Dayjs } from 'dayjs';

export interface IPreVisitorLog {
  id?: string; // Optional in form
  visitorName: string;
  idProof?: string;
  proofNumber: string;
  contactNo: string;
  visitStartDateTime: Dayjs | null; // Use null for empty date
  visitEndDateTime: Dayjs | null; // Use null for empty date
  reasonForVisit: string;
  status: string;
  relationship: string;
}

export interface IPreVisitorFormProps {
  isEdit: boolean;
  data: IPreVisitorLog | null;
  onClose: () => void;
}

export interface IPreRegisterTableProps {
  onClick: (data: IPreVisitorLog, eventName: string) => void;
  onMarkOut: (data: IPreVisitorLog) => void;
  onMarkIn: (data: IPreVisitorLog) => void;
}
