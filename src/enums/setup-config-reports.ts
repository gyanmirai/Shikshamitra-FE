export enum SetupConfigReportTitle {
  ClasswiseFeeSetup,
  FeeSetupStudentWise,
  ClassSetupFeeRules,
  FeeCollectionBatchAndMonthwise,
  FeeCollectionBatchwiseBoardwise,
  FeeCollectionMonthAndFeeHeadwise,
  FeeHeadDefaultSetup,
  FeeCollectionBatchwiseSetup,
}

export const SetupConfigReportTitleOptions = [
  {
    name: SetupConfigReportTitle.ClasswiseFeeSetup,
    label: 'Classwise Fee Setup',
  },
  {
    name: SetupConfigReportTitle.FeeSetupStudentWise,
    label: 'Fee Setup Student Wise',
  },
  {
    name: SetupConfigReportTitle.ClassSetupFeeRules,
    label: 'Class Setup / Fee Rules',
  },
  {
    name: SetupConfigReportTitle.FeeCollectionBatchAndMonthwise,
    label: 'Fee Collection Year And Monthwise',
  },
  {
    name: SetupConfigReportTitle.FeeCollectionBatchwiseBoardwise,
    label: 'Fee Collection Yearwise',
  },
  {
    name: SetupConfigReportTitle.FeeCollectionMonthAndFeeHeadwise,
    label: 'Fee Collection Month And FeeHeadwise',
  },
  {
    name: SetupConfigReportTitle.FeeHeadDefaultSetup,
    label: 'Fee Head Default Setup',
  },
  {
    name: SetupConfigReportTitle.FeeCollectionBatchwiseSetup,
    label: 'Fee Collection Yearwise Setup',
  },
];
