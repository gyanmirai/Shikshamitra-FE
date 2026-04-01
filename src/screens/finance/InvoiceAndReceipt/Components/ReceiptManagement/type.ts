export interface IFeeReceipt {
  student: string;
  rollNo: string | number;
  class: string;
  division: string;
  totalPaidFees: number;
  totalPendingFees: number;
  grNo: number;
  lastPaymentDate: string;
  status: 'Paid' | 'Partial' | 'Pending';
  paymentTerm: string;
}

export interface IReceipt {
  receiptId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  remarks?: string;
}
