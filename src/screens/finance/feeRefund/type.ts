import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IStudentFeeData {
  id: number;
  name: string;
  avatarUrl?: string;
  board: string;
  medium: string;
  class: string;
  division: string;
  grNo: string;
  rollNo: string;
  totalPaidFees: number;
  totalPendingFees: number;
  refundAmount?: number;
  requestDate?: string;
  reasonOfRefund?: string;
  parentName?: string;
  status?: number;
  paidTerms?: string[]; // Changed to array for multiple terms
  applicableFeeHeads?: {
    feeHead: string;
    amount: string;
  }[]; // Array of fee heads and their amounts
  refundMethod?: string; // 👈 restrict to defined methods
  reason?: string;
  remarks?: string;
  paymentDetails?: Record<string, any>; // 👈 dynamic fields from config
}

export interface IStudentFeeTableProps {
  data: IStudentFeeData[];
  onRequestRefund?: (row: IStudentFeeData) => void;
  onView?: (row: IStudentFeeData) => void;
  onProcessRefund?: (row: IStudentFeeData) => void;
  boards: any[];
  mediums: any[];
  selectedBoard: string;
  selectedMedium: string;
  onBoardChange: (value: string) => void;
  onMediumChange: (value: string) => void;
}

export interface IRefundFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  student: IStudentFeeData;
  onApprove: () => void;
  onReject: () => void;
}

export interface IRefundProcessFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  student: IStudentFeeData;
}

export interface IRefundFormValues {
  paidTerms: string[];
  totalPaidFees: string | number;
  refundAmount: number | null;
  refundMethod: string;
  applicableFeeHeads?: {
    feeHead: string;
    amount: string;
  }[];
  reason: string;
  remarks?: string;
  paymentDetails?: Record<string, any>;
}

export interface IRefund {
  board: string;
  medium: string;
  className: string;
  division: string;
  student: string;
  paidTerms: string;
  amountApplicable: number | '';
  refundAmount: number | '';
  refundMethod: string;
  reason: string;
}

export interface IRefundInfoData {
  paidTerms?: string[];
  applicableFeeHeads?: {
    feeHead: string;
    amount: string;
  }[];
}
