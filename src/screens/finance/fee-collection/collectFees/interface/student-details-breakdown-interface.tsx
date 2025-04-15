interface IPaymentHistoryItem {
  paymentMode: string;
  amount: string;
  paymentId: string;
  paymentStatus: string;
  isRefunded: boolean;
  refundAmount: string;
  refundDate: string;
  refundReason: string;
  feeHead: string;
}

export interface IPaymentData {
  paymentId: string;
  date: string;
  dueDate: string;
  amountPaid: number;
  amountPending: number;
  status: string;
  paymentHistory: IPaymentHistoryItem[];
}

export interface IPendingFeeItem {
  id: number;
  feeName: string;
  amountDue: string;
  dueDate: string;
  action: string;
  status: 'Overdue' | 'Upcoming';
}

export interface IChargeDetail {
  dueDate?: string;
  chargesPerDay?: string;
  totalCharges?: string;
  noOfDay?: number;
  status: 'Paid' | 'Pending';

  // For check bounce
  feeHead?: string;
  checkDate?: string;
  receivedCheckDate?: string;
  chequeAmount?: number;
  charges?: string;
  bankName?: string;
}

export interface IChargeItem {
  srNo: number;
  chargeHead: string;
  chargeId: string;
  chargeType: string;
  appliedDate: string;
  overdueDate: string;
  amount: string;
  status: 'Pending' | 'Paid';
  description: string;
  details: IChargeDetail[];
}
