export interface PaymentDate {
  month: string;
  date: string;
  status: 'Paid' | 'Unpaid';
  paidAmount: string;
  pendingAmount: string;
}

export interface FeeHead {
  feeHeadId: number;
  feeHead: string;
  totalFees: number;
  finalFees: number;
  grossAmount: number;
  payableAmount?: number;
  paybleAmount?: number;
  totalPaidAmount: number;
  discount: number;
  totalDiscount: number;
  paymentDates: PaymentDate[];
}

export interface Student {
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
  fees: FeeHead[];
}

export const students: Student[] = [];
