// Enum for concession types
export enum ConcessionStatusType {
  Approved,
  Pending,
  UnderReview,
  Rejected,
  DocumentMismatch,
}
// Options for dropdowns / select inputs
export const ConcessionStatusOptions = [
  { label: 'Approved', value: ConcessionStatusType.Approved },
  { label: 'Pending', value: ConcessionStatusType.Pending },
  { label: 'Under Review', value: ConcessionStatusType.UnderReview },
  { label: 'Rejected', value: ConcessionStatusType.Rejected },
  { label: 'Document Mismatch', value: ConcessionStatusType.DocumentMismatch },
];

// Colors (matching your screenshot styling)
export const ConcessionStatusTypeColors = {
  [ConcessionStatusType.Approved]: 'success',
  [ConcessionStatusType.Pending]: 'warning',
  [ConcessionStatusType.UnderReview]: 'info',
  [ConcessionStatusType.Rejected]: 'error',
  [ConcessionStatusType.DocumentMismatch]: 'error',
};
