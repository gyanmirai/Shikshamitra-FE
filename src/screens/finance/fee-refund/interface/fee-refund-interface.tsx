interface IPaymentHistory {
  paymentMode: string;
  amount: string;
  paymentId?: string;
  paymentStatus?: string;
  charges?: number;
}

interface IPaymentDate {
  month: string;
  date: string;
  status: string;
  amount: number;
  paymentHistory: IPaymentHistory[];
}

interface IFee {
  feeHeadId: number;
  feeHead: string;
  totalFees: number;
  amount: number;
  paymentDates: IPaymentDate[];
}

export interface IStudentRefundData {
  studentName: string;
  standard: number;
  class: string;
  refrenceNumber: string;
  requestedOn: string;
  reason: string;
  status: string;
  feestructureId: string;
  paymentTerm: string;
  totalPending: number;
  totalPaid: number;
  discountAmount: number;
  fixedReduction: number;
  overAllDueDate: string;
  totalFees: number;
  totalDueAfterDiscount: number;
  previousCharges: number;
  askForRefund: number;
  reasonForRejection: string;
  approvedAmount: string;
  chargesDetails: string;
  fees: IFee[];
}

export interface IFeeRefundScreenProps {
  fromStudentDetailedView?: boolean;
}

export interface IFinanceFeeCollectionRefundTabProps {
  dialogValue: boolean;
  onClose: () => void;
}

export interface IFinanceFeeRefundAllocationDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}

export interface IFinanceFeeRefundedViewDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}
