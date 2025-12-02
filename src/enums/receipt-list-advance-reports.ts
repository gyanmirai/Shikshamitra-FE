export enum ReceiptListAdvanceReportsTitle {
  RECEIPT_BOOK_WISE_DAILY_COLLECTION = 'ReceiptBookWiseDailyCollection',
  RECEIPT_BOOK_WISE_COLLECTION = 'ReceiptBookWiseCollection',
  RECEIPT_BOOK_WISE_HEAD_WISE_COLLECTION = 'ReceiptBookWiseHeadWiseCollection',
  RECEIPT_BOOK_WISE_FEE_TYPE_COLLECTION = 'ReceiptBookWiseFeeTypeCollection',
  USER_WISE_COLLECTION = 'UserWiseCollection',
  CANCEL_RECEIPT_REPORT = 'CancelReceiptReport',
  BANK_DEPOSIT_REPORT = 'BankDepositReport',
}

export const ReceiptListAdvanceReportsTitleOptions = [
  {
    label: 'Receipt Book Wise Daily Collection',
    name: ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_DAILY_COLLECTION,
  },
  {
    label: 'Receipt Book Wise Collection',
    name: ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_COLLECTION,
  },
  {
    label: 'Receipt Book Wise Head Wise Collection',
    name: ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_HEAD_WISE_COLLECTION,
  },
  {
    label: 'Receipt Book Wise Fee Type Collection',
    name: ReceiptListAdvanceReportsTitle.RECEIPT_BOOK_WISE_FEE_TYPE_COLLECTION,
  },
  {
    label: 'User Wise Collection',
    name: ReceiptListAdvanceReportsTitle.USER_WISE_COLLECTION,
  },
  {
    label: 'Cancel Receipt Report',
    name: ReceiptListAdvanceReportsTitle.CANCEL_RECEIPT_REPORT,
  },
  {
    label: 'Bank Deposit Report',
    name: ReceiptListAdvanceReportsTitle.BANK_DEPOSIT_REPORT,
  },
];
