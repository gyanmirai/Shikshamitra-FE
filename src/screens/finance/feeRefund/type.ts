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
  reasonOfRefund?: string;
  status?: number;
  paidTerm?: string;
  applicableAmount?: string;
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
}

export interface IRefundFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  student: IStudentFeeData;
}

export interface IRefundFormValues {
  paidTerm: string;
  applicableAmount: string;
  refundAmount: number | null;
  refundMethod: string;
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
