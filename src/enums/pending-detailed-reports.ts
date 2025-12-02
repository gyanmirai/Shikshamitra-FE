// ============================================================
// PENDING DETAILED REPORTS (NEW ENUM)
// ============================================================
export enum PendingDetailedReportsTitle {
  PendingFeeCastCategorywise,
  PendingFeeCollectionGroupWiseWithDetail,
  PendingFeeCollectionGroupWise,
  PendingFeeDepartmentwise,
  PendingFeeMonthwise,
  PendingFeeReceiptBookwise,
  PendingFeeWithFeeName,
}

// ============================================================
//  OPTIONS (Use in Autocomplete)
// ============================================================
export const PendingDetailedReportsTitleOptions = [
  {
    name: PendingDetailedReportsTitle.PendingFeeCastCategorywise,
    label: 'Pending Fee Cast Categorywise',
  },
  {
    name: PendingDetailedReportsTitle.PendingFeeCollectionGroupWiseWithDetail,
    label: 'Pending Fee Collection Group Wise With Detail',
  },
  {
    name: PendingDetailedReportsTitle.PendingFeeCollectionGroupWise,
    label: 'Pending Fee Collection Group Wise',
  },
  {
    name: PendingDetailedReportsTitle.PendingFeeDepartmentwise,
    label: 'Pending Fee Departmentwise',
  },
  {
    name: PendingDetailedReportsTitle.PendingFeeMonthwise,
    label: 'Pending Fee Monthwise',
  },
  {
    name: PendingDetailedReportsTitle.PendingFeeReceiptBookwise,
    label: 'Pending Fee Receipt Bookwise',
  },
  {
    name: PendingDetailedReportsTitle.PendingFeeWithFeeName,
    label: 'Pending Fee With Fee Name',
  },
];
