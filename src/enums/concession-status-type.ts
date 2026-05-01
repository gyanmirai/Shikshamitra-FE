import type { LabelColor } from 'src/components/label';

// Enum for concession types
export enum ConcessionStatusType {
  Pending,
  Approved,
  Rejected,
  Cancelled,
}
// Options for dropdowns / select inputs
export const ConcessionStatusOptions = [
  { label: 'Pending', value: ConcessionStatusType.Pending },
  { label: 'Approved', value: ConcessionStatusType.Approved },
  { label: 'Rejected', value: ConcessionStatusType.Rejected },
  { label: 'Cancelled', value: ConcessionStatusType.Cancelled },
];

// Colors (matching your screenshot styling)
export const ConcessionStatusTypeColors: Record<ConcessionStatusType, LabelColor> = {
  [ConcessionStatusType.Pending]: 'warning',
  [ConcessionStatusType.Approved]: 'success',
  [ConcessionStatusType.Rejected]: 'error',
  [ConcessionStatusType.Cancelled]: 'error',
};
