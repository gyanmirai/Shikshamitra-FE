export enum ReceiptSummaryAdvancedReportTitle {
  ReceiptSummaryPaytypeWiseAllBatch,
  ReceiptSummaryReceiptBookWise,
  ReceiptSummaryUserPayTypeWise,
  ReceiptSummaryUserPayTypeWiseDetails,
  ReceiptSummaryFeeHeadAndReceiptBookWithPaytype,
  FeeReceiptListStudentWise,
  BankDepositReport,
}

export const ReceiptSummaryAdvancedReportTitleOptions = [
  {
    name: ReceiptSummaryAdvancedReportTitle.ReceiptSummaryPaytypeWiseAllBatch,
    label: 'Receipt Summary Paytype wise All Batch',
  },
  {
    name: ReceiptSummaryAdvancedReportTitle.ReceiptSummaryReceiptBookWise,
    label: 'Receipt Summary Receipt Book wise',
  },
  {
    name: ReceiptSummaryAdvancedReportTitle.ReceiptSummaryUserPayTypeWise,
    label: 'Receipt Summary User Pay type wise',
  },
  {
    name: ReceiptSummaryAdvancedReportTitle.ReceiptSummaryUserPayTypeWiseDetails,
    label: 'Receipt Summary User Pay type wise Details',
  },
  {
    name: ReceiptSummaryAdvancedReportTitle.ReceiptSummaryFeeHeadAndReceiptBookWithPaytype,
    label: 'Receipt Summary Fee Head And Receipt Book With Paytype',
  },
  {
    name: ReceiptSummaryAdvancedReportTitle.FeeReceiptListStudentWise,
    label: 'Fee Receipt List Student Wise',
  },
  {
    name: ReceiptSummaryAdvancedReportTitle.BankDepositReport,
    label: 'Bank Deposit Report',
  },
];
