export enum FeeCollectionReportsTitle {
  FeeCollectionBatchAndMonthwise = 'FeeCollectionBatchAndMonthwise',
  FeeCollectionBatchwise = 'FeeCollectionBatchwise',
  FeeCollectionMonthAndFeeHeadwise = 'FeeCollectionMonthAndFeeHeadwise',
  FeeCollectionStudentWithFeewise = 'FeeCollectionStudentWithFeewise',
  FeeMonthlyRegister = 'FeeMonthlyRegister',
  MonthlyFeeCollectionSummary = 'MonthlyFeeCollectionSummary',
  FeeListChequeClearDateWise = 'FeeListChequeClearDateWise',
}

export const FeeCollectionReportsTitleOptions = [
  {
    label: 'Fee Collection Batch And Monthwise',
    name: FeeCollectionReportsTitle.FeeCollectionBatchAndMonthwise,
  },
  { label: 'Fee Collection Batchwise', name: FeeCollectionReportsTitle.FeeCollectionBatchwise },
  {
    label: 'Fee Collection Month And FeeHeadwise',
    name: FeeCollectionReportsTitle.FeeCollectionMonthAndFeeHeadwise,
  },
  {
    label: 'Fee Collection Student With Feewise',
    name: FeeCollectionReportsTitle.FeeCollectionStudentWithFeewise,
  },
  { label: 'Fee Monthly Register', name: FeeCollectionReportsTitle.FeeMonthlyRegister },
  {
    label: 'Monthly Fee Collection Summary',
    name: FeeCollectionReportsTitle.MonthlyFeeCollectionSummary,
  },
  {
    label: 'Fee List Cheque Clear Date Wise',
    name: FeeCollectionReportsTitle.FeeListChequeClearDateWise,
  },
];
