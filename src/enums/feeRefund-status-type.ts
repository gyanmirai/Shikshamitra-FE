// Enum for concession types
export enum FeeRefundStatusType {
  Pending,
  Approved,
  Rejected,
  Cancelled,
  UnderReview,
  DocumentMismatch,
  ImageUploaded,
}

// Options for dropdowns / select inputs
export const FeeRefundStatusOptions = [
  { label: 'Approved', value: FeeRefundStatusType.Approved },
  { label: 'Pending', value: FeeRefundStatusType.Pending },
  { label: 'Under Review', value: FeeRefundStatusType.UnderReview },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected },
  { label: 'Cancelled', value: FeeRefundStatusType.Cancelled },
];

// Colors (matching your screenshot styling)
export const FeeRefundStatusTypeColors: Record<FeeRefundStatusType, string> = {
  [FeeRefundStatusType.Approved]: 'success',
  [FeeRefundStatusType.Pending]: 'warning',
  [FeeRefundStatusType.UnderReview]: 'info',
  [FeeRefundStatusType.Rejected]: 'error',
  [FeeRefundStatusType.Cancelled]: 'default',
  [FeeRefundStatusType.DocumentMismatch]: 'error',
  [FeeRefundStatusType.ImageUploaded]: 'secondary',
};
