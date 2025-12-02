export enum ExemptionNAReportsTitle {
  ExemptionSummaryFeeHeadwiseReport = 1,
  FeeExemptedReport = 2,
  FeeExemptionTypewiseWithNAAmountReport = 3,
  FeeExemptionTypewiseReport = 4,
  FeeNotApplicableList = 5,
  PendingFeeWithFeeName = 6,
}

export const ExemptionNAReportsTitleOptions = [
  {
    name: ExemptionNAReportsTitle.ExemptionSummaryFeeHeadwiseReport,
    label: 'Exemption Summary FeeHeadwise Report',
  },
  {
    name: ExemptionNAReportsTitle.FeeExemptedReport,
    label: 'Fee Exempted Report (Concession Report)',
  },
  {
    name: ExemptionNAReportsTitle.FeeExemptionTypewiseWithNAAmountReport,
    label: 'Fee Exemption Typewise With NA Amount Report',
  },
  {
    name: ExemptionNAReportsTitle.FeeExemptionTypewiseReport,
    label: 'Fee Exemption Typewise Report',
  },
  {
    name: ExemptionNAReportsTitle.FeeNotApplicableList,
    label: 'Fee Not Applicable List',
  },
  {
    name: ExemptionNAReportsTitle.PendingFeeWithFeeName,
    label: 'Pending Fee With Fee Name',
  },
];
