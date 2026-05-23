// Enum for concession types
export enum FeeRefundStatusType {
  Pending,
  Rejected,
  Approved,
}

// Options for dropdowns / select inputs
export const FeeRefundStatusOptions = [
  { label: 'Approved', value: FeeRefundStatusType.Approved },
  { label: 'Pending', value: FeeRefundStatusType.Pending },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected },
];

// Colors (matching your screenshot styling)
export const FeeRefundStatusTypeColors: Record<FeeRefundStatusType, string> = {
  [FeeRefundStatusType.Approved]: 'success',
  [FeeRefundStatusType.Pending]: 'warning',
  [FeeRefundStatusType.Rejected]: 'error',
};
