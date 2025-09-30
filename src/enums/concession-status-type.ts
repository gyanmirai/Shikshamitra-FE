import type { LabelColor } from 'src/components/label';

// Enum for concession types
export enum ConcessionStatusType {
  Approved,
  Pending,
  UnderReview,
  Rejected,
}
// Options for dropdowns / select inputs
export const ConcessionStatusOptions = [
  { label: 'Approved', value: ConcessionStatusType.Approved },
  { label: 'Pending', value: ConcessionStatusType.Pending },
  { label: 'Under Review', value: ConcessionStatusType.UnderReview },
  { label: 'Rejected', value: ConcessionStatusType.Rejected },
];

// Colors (matching your screenshot styling)
export const ConcessionStatusTypeColors: Record<ConcessionStatusType, LabelColor> = {
  [ConcessionStatusType.Approved]: 'success',
  [ConcessionStatusType.Pending]: 'warning',
  [ConcessionStatusType.UnderReview]: 'info',
  [ConcessionStatusType.Rejected]: 'error',
};
