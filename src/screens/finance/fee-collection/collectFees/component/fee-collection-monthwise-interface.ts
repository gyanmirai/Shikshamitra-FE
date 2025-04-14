interface IPaymentHistory {
  paymentMode: string;
  amount: string;
  paymentId?: string;
  paymentStatus: string;
}

interface IPaymentDueDate {
  month: string;
  date: string;
  status: string;
  amount: number;
  paymentHistory: IPaymentHistory[];
}

interface IFee {
  feeHeadId: string;
  feeHead: string;
  grossFees: number;
  payableFee: number;
  generalDiscount: number;
  acceptedpaymentMethod: string[];
  lateFeeChargesType: string;
  lateFeeChargesAmount: string;
  isActive: boolean;
  status: string;
  paymentDueDate: string;
  paymentDueDateList: IPaymentDueDate[];
}

interface IStudent {
  studentId: number;
  name: string;
  grade: number;
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
  chargesDetails: string;
  fees: IFee[];
}

export interface IFeeCollectionMonthWiseProps {
  students: IStudent;
  dialogValue: boolean;
  onClose: () => void;
}
