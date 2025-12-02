// ============================================================
// PENDING CORE REPORTS (NEW ENUM)
// ============================================================
export enum PendingCoreReportsTitle {
  PendingFee100Percent,
  PendingFeeAllBatch,
  PendingFeeAsOnDate,
  PendingFeeDivisionwiseAsOnDate,
  PendingFee,
  PendingFeeSlip,
  PendingFeeSlipWithDetails,
}

// ============================================================
//  OPTIONS (Use in Autocomplete)
// ============================================================
export const PendingCoreReportsTitleOptions = [
  {
    name: PendingCoreReportsTitle.PendingFee100Percent,
    label: 'Pending Fee 100 Percent',
  },
  {
    name: PendingCoreReportsTitle.PendingFeeAllBatch,
    label: 'Pending Fee All Batch',
  },
  {
    name: PendingCoreReportsTitle.PendingFeeAsOnDate,
    label: 'Pending Fee As On Date',
  },
  {
    name: PendingCoreReportsTitle.PendingFeeDivisionwiseAsOnDate,
    label: 'Pending Fee Divisionwise As On Date',
  },
  {
    name: PendingCoreReportsTitle.PendingFee,
    label: 'Pending Fee',
  },
  {
    name: PendingCoreReportsTitle.PendingFeeSlip,
    label: 'Pending Fee Slip',
  },
  {
    name: PendingCoreReportsTitle.PendingFeeSlipWithDetails,
    label: 'Pending Fee Slip With Details',
  },
];
