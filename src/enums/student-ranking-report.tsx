export enum StudentRankingReportsTitle {
  FeeCollectionBatchAndMonthwise,
  FeeCollectionBatchwise,
  FeeCollectionMonthAndFeeHeadwise,
  FeeCollectionStudentWithFeewise,
  FeeMonthlyRegister,
  MonthlyFeeCollectionSummary,
  FeeListChequeClearDateWise,
}
export const StudentRankingReportsTitleOptions = [
  {
    label: 'Fee Collection Batch And Monthwise',
    name: StudentRankingReportsTitle.FeeCollectionBatchAndMonthwise,
  },
  { label: 'Fee Collection Batchwise', name: StudentRankingReportsTitle.FeeCollectionBatchwise },
  {
    label: 'Fee Collection Month And FeeHeadwise',
    name: StudentRankingReportsTitle.FeeCollectionMonthAndFeeHeadwise,
  },
  {
    label: 'Fee Collection Student With Feewise',
    name: StudentRankingReportsTitle.FeeCollectionStudentWithFeewise,
  },
  { label: 'Fee Monthly Register', name: StudentRankingReportsTitle.FeeMonthlyRegister },
  {
    label: 'Monthly Fee Collection Summary',
    name: StudentRankingReportsTitle.MonthlyFeeCollectionSummary,
  },
  {
    label: 'Fee List Cheque Clear Date Wise',
    name: StudentRankingReportsTitle.FeeListChequeClearDateWise,
  },
];
