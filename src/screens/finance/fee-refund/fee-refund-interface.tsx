export interface IFeeRefundPaymentDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
  total: any;
  tuitionFeeAmount: any;
  libraryFeeFeeAmount: any;
  totalFeeAmount: any;
}

export interface IFormikValues {
  selectStudent: string;
  feeType: number[];
  amount: number;
  paymentMode: string;
  transactionId: string;
  transactionIdOnline: string;
  note: string;
  selectedTerms: string[];
  receiptNumber: string;
  chequeDate: any;
  bankName: string;
  receivedPayment: 0;
  chequeNumber: string;
  chequeAmount: number;
  cardAmount: number;
  onlineAmount: number;
  cashAmount: number;
  charges: number;
  chargesDetails: string;
  totalAmount: number;
  transectionIdOrCheque: string;
  remarks: string;
  id: number;
  accountNumber: number;
  bankNameForAccount: string;
  accountAmount: number;
  ifscNumber: string;
  upiId: string;
}
