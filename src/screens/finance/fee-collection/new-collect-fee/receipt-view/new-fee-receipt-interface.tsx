export interface IFeeRow {
  feeHead: string;
  month: string;
  dueAmount: number;
  receivedAmount: number;
  paymentMode: 'Cash' | 'Cheque' | 'UPI' | 'Online';
  chequeNo?: string;
  bank?: string;
  transectionId?: string;
}

export interface IFeeReceiptPDFProps {
  from: any;
  to: any;
  selectedFees: IFeeRow[];
}
