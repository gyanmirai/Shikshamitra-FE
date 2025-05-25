import type { Dayjs } from 'dayjs';

export interface IFeeRefundRow {
  feeHead: string;
  refundedAmount: number;
}

export interface IpaymentDetails {
  paymentMode: 'Cash' | 'Cheque' | 'UPI' | 'Online';
  chequeNo?: string;
  bank?: string;
  dateOnCheque?: Dayjs;
  transectionId?: string;
}

export interface IFeeRefundReceiptPDFProps {
  from: any;
  to: any;
  selectedCharges: IFeeRefundRow[];

  paymentDetails: IpaymentDetails;
}
