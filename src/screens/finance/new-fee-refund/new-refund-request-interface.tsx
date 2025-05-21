import type { Dayjs } from 'dayjs';

export interface IStudentRefundRequest {
  grNo: number | null;
  studentName: string;
  rollNo: number | null;
  class: string;
  division: string;
  requestedOn: Dayjs | null; // or Date if you're using Date objects
  reason: string;
  askForRefund?: number;
  reasonForReject?: string;
  approvedAmount?: number;
  feeType: string[];
  paidTerms: string[];
  amountApplicableForRefund: number;
  status: 'pending' | 'approved' | 'rejected' | 'in-review'; // can customize based on your logic
}

export interface INewFeeRefundRequestFormProps {
  onClose: () => void;
  isEdit: boolean;
  data: IStudentRefundRequest | null;
}

export interface INewFeeRefundRequestTableProps {
  onClick: (data: IStudentRefundRequest, eventName: string) => void;
}
