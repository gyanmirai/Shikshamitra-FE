import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IStudentFeeData {
  id: number;
  name: string;
  avatarUrl?: string;
  board: string;
  medium: string;
  class: string;
  division: string;
  classDivision?: string;
  standardName?: string; // for UI display only
  divisionName?: string; // for UI display only
  educationMediumName?: string; // for UI display only
  boardName?: string; // for UI display only
  grNo: string;
  rollNo: string;
  contactNo?: string;
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
  _refundRequestId?: string;
  _studentId?: string;
  _availableActions?: string[];
  _approvedAmount?: number;
  _settlementId?: string;
  _refundMethod?: string;
  _allowedPayoutMethods?: string[];
  _expenseCategoryId?: string;
  _payingBankAccountId?: string;
  _defaultExpenseCategoryId?: string;
  _defaultPayingBankAccountId?: string;
  _voucherNumber?: string;
  _receiptNumber?: string;
  _payoutPending?: boolean;
  _payoutReference?: string;
  _paymentDate?: string;
  _workflowVersion?: number;
}

export interface IStudentFeeTableProps {
  onRequestRefund?: (row: IStudentFeeData) => void;
  onView?: (row: IStudentFeeData) => void;
  onEdit?: (row: IStudentFeeData) => void;
  onApprove?: (row: IStudentFeeData) => void;
  onReject?: (row: IStudentFeeData) => void;
  onDelete?: (row: IStudentFeeData) => void;
  onSubmit?: (row: IStudentFeeData) => void;
  onCancel?: (row: IStudentFeeData) => void;
  onStartReview?: (row: IStudentFeeData) => void;
  onProcess?: (row: IStudentFeeData) => void;
  onReverse?: (row: IStudentFeeData) => void;
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
