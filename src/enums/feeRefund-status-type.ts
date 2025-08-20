// Enum for concession types
export enum FeeRefundStatusType {
  Approved,
  Pending,
  UnderReview,
  Rejected,
  DocumentMismatch,
  ImageUploaded, // ✅ new status
}

// Options for dropdowns / select inputs
export const FeeRefundStatusOptions = [
  { label: 'Approved', value: FeeRefundStatusType.Approved },
  { label: 'Pending', value: FeeRefundStatusType.Pending },
  { label: 'Under Review', value: FeeRefundStatusType.UnderReview },
  { label: 'Rejected', value: FeeRefundStatusType.Rejected },
  { label: 'Document Mismatch', value: FeeRefundStatusType.DocumentMismatch },
  { label: 'Image Uploaded', value: FeeRefundStatusType.ImageUploaded }, // ✅
];

// Colors (matching your screenshot styling)
export const FeeRefundStatusTypeColors = {
  [FeeRefundStatusType.Approved]: 'success',
  [FeeRefundStatusType.Pending]: 'warning',
  [FeeRefundStatusType.UnderReview]: 'info',
  [FeeRefundStatusType.Rejected]: 'error',
  [FeeRefundStatusType.DocumentMismatch]: 'error',
  [FeeRefundStatusType.ImageUploaded]: 'secondary', // ✅ choose your theme color
};
