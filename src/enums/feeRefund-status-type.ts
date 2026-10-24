export enum FeeRefundStatusType {
  Submitted = 0,
  Pending = Submitted,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Draft = 5,
  Processing = 6,
  Processed = 7,
  Failed = 8,
  Reversed = 9,
}

// Options for dropdowns / select inputs
export const FeeRefundStatusOptions = [
  { label: 'Draft', value: FeeRefundStatusType.Draft },
  { label: 'Submitted', value: FeeRefundStatusType.Submitted },
  { label: 'Under review', value: FeeRefundStatusType.UnderReview },
  { label: 'Approved', value: FeeRefundStatusType.Approved },
  { label: 'Processing', value: FeeRefundStatusType.Processing },
  { label: 'Completed', value: FeeRefundStatusType.Processed },
  { label: 'Failed', value: FeeRefundStatusType.Failed },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected },
  { label: 'Cancelled', value: FeeRefundStatusType.Cancelled },
  { label: 'Reversed', value: FeeRefundStatusType.Reversed },
];

// Colors (matching your screenshot styling)
export const FeeRefundStatusTypeColors: Record<FeeRefundStatusType, string> = {
  [FeeRefundStatusType.Submitted]: 'warning',
  [FeeRefundStatusType.Approved]: 'success',
  [FeeRefundStatusType.UnderReview]: 'info',
  [FeeRefundStatusType.Draft]: 'default',
  [FeeRefundStatusType.Processing]: 'info',
  [FeeRefundStatusType.Processed]: 'success',
  [FeeRefundStatusType.Failed]: 'error',
  [FeeRefundStatusType.Rejected]: 'error',
  [FeeRefundStatusType.Cancelled]: 'default',
  [FeeRefundStatusType.Reversed]: 'warning',
};
