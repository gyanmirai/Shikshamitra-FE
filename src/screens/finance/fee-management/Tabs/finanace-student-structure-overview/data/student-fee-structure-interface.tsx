interface PaymentDate {
  month: string;
  date: string;
  status: string;
  paidAmount: string;
  pendingAmount: string;
}

interface FeeDetails {
  feeHeadId: number;
  feeHead: string;
  totalFees: number;
  finalFees: number;
  grossAmount: number;
  payableAmount: number;
  totalPaidAmount: number;
  discount: number;
  totalDiscount: number;
  paymentDates: PaymentDate[];
}

export interface StudentForFeeStructure {
  grNo: number;
  rollNo: number;
  studentId: number;
  name: string;
  grade: number;
  paymentTerm: string;
  paymentTermNumber: number;
  totalPending: number;
  totalPaid: number;
  totalGeneralDiscount: number;
  totalAdditionalDiscount: number;
  discountAmount: number;
  fixedReduction: number;
  overAllDueDate: string;
  totalFees: number;
  finalFees: number;
  totalDueAfterDiscount: number;
  fees: FeeDetails[];
}
