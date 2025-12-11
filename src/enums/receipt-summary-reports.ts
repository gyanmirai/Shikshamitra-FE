export enum ReceiptSummaryReportsTitle {
  ReceiptSummaryDateWise,
  ReceiptSummaryDateAndPayTypeWise,
  ReceiptSummaryDateAndReceiptBookWise,
  ReceiptSummaryDateAndReceiptBookWithPayType,
  ReceiptSummaryFeeHeadWise,
  ReceiptSummaryFeeWise,
  ReceiptSummaryOrganizationFeeHeadAndPayTypeWise,
}

export const ReceiptSummaryReportsTitleOptions = [
  { label: 'Receipt Summary Date Wise', name: ReceiptSummaryReportsTitle.ReceiptSummaryDateWise },
  {
    label: 'Receipt Summary Date And Pay Type Wise',
    name: ReceiptSummaryReportsTitle.ReceiptSummaryDateAndPayTypeWise,
  },
  {
    label: 'Receipt Summary Date And Receipt Book Wise',
    name: ReceiptSummaryReportsTitle.ReceiptSummaryDateAndReceiptBookWise,
  },
  {
    label: 'Receipt Summary Date And Receipt Book With Paytype',
    name: ReceiptSummaryReportsTitle.ReceiptSummaryDateAndReceiptBookWithPayType,
  },
  {
    label: 'Receipt Summary FeeHeadwise',
    name: ReceiptSummaryReportsTitle.ReceiptSummaryFeeHeadWise,
  },
  { label: 'Receipt Summary Feewise', name: ReceiptSummaryReportsTitle.ReceiptSummaryFeeWise },
  {
    label: 'Receipt Summary Organization Fee Head And Pay Type Wise',
    name: ReceiptSummaryReportsTitle.ReceiptSummaryOrganizationFeeHeadAndPayTypeWise,
  },
];
