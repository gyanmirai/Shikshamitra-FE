export enum FeeStatusReportTitle {
  FeeStatusCollectionGroupWiseDetail,
  FeeStatusCollectionGroupWise,
  FeeStatusStudentwiseWithPaidDate,
  FeeStatusDetailDivisionWise,
  FeeStatusHeadWise,
  FeeStatusHeadWiseDetail,
  FeeStatusStudentWiseDetails,
  FeeStatusStudentWiseWithDiscount,
}
export const FeeStatusReportTitleOptions = [
  {
    name: FeeStatusReportTitle.FeeStatusCollectionGroupWiseDetail,
    label: 'Fee Status – Collection Group Wise With Detail',
  },
  {
    name: FeeStatusReportTitle.FeeStatusCollectionGroupWise,
    label: 'Fee Status – Collection Group Wise',
  },
  {
    name: FeeStatusReportTitle.FeeStatusStudentwiseWithPaidDate,
    label: 'Fee Status – Studentwise With Paid Date',
  },
  {
    name: FeeStatusReportTitle.FeeStatusDetailDivisionWise,
    label: 'Fee Status – Detail Division Wise',
  },
  {
    name: FeeStatusReportTitle.FeeStatusHeadWise,
    label: 'Fee Status – Head Wise',
  },
  {
    name: FeeStatusReportTitle.FeeStatusHeadWiseDetail,
    label: 'Fee Status – Head Wise Detail',
  },
  {
    name: FeeStatusReportTitle.FeeStatusStudentWiseDetails,
    label: 'Fee Status – Student Wise Details',
  },
  {
    name: FeeStatusReportTitle.FeeStatusStudentWiseWithDiscount,
    label: 'Fee Status – Student Wise With Discount',
  },
];
