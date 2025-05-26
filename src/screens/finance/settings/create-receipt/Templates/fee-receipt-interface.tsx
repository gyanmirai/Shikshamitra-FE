import type { Dayjs } from 'dayjs';

export interface IReceiptItem {
  feeHead: string;
  feeHeadMonth: string;
  amount: number;
  received: number;
  paymentMode: string;
  details: string;
}

export interface IPaymentDetails {
  paymentMode: 'Cash' | 'Cheque' | 'Online' | 'UPI';
  transectionId?: string; // Consider renaming to `transactionId`
  chequeNo?: string;
  bank?: string;
  dateOnCheque?: Dayjs | null;
  refundedBy?: string;

  remarks?: string;
}

export interface IReceiptData {
  from: {
    name: string;
    address: string;
    branch: string;
  };
  to: {
    name: string;
    className: string;
    rollNo: string;
  };
  paymentMode: string;
  bank: string;
  ref: string;
  date: string;
  pendingFees: number;
  total: number;
  tableData: IReceiptItem[];
  paymentDetails: IPaymentDetails;
}

export interface ITemplateOneProps {
  selectedTemplate: string;
  onSelectTemplate: (data: any) => void;
  data?: IReceiptData;
}
