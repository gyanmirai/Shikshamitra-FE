import type { Dayjs } from 'dayjs';

export interface IChargesRow {
  feeHead: string;
  dueDate: Dayjs;
  chargePerDay: number;
  dayOverDue: number;
  totalCharges: number;

  receivedAmount: number;
  dateOnCheque: Dayjs;
  ReceivedChequeDate: Dayjs;
  chequeAmount: number;
  bankName: string;
  type: string;
}

export interface IpaymentDetails {
  paymentMode: 'Cash' | 'Cheque' | 'UPI' | 'Online';
  chequeNo?: string;
  bank?: string;
  dateOnCheque?: Dayjs;
  transectionId?: string;
}

export interface IChargesReceiptPDFProps {
  from: any;
  to: any;
  selectedCharges: IChargesRow[];

  paymentDetails: IpaymentDetails;
}
