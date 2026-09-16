import type { LabelColor } from 'src/components/label';

// Enum for concession types
export enum ConcessionStatusType {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
  PartiallyReversed = 4,
  Reversed = 5,
  Draft = 6,
}
// Options for dropdowns / select inputs
export const ConcessionStatusOptions = [
  { label: 'Draft', value: ConcessionStatusType.Draft },
  { label: 'Pending', value: ConcessionStatusType.Pending },
  { label: 'Approved', value: ConcessionStatusType.Approved },
  { label: 'Rejected', value: ConcessionStatusType.Rejected },
  { label: 'Cancelled', value: ConcessionStatusType.Cancelled },
  { label: 'Partially reversed', value: ConcessionStatusType.PartiallyReversed },
  { label: 'Reversed', value: ConcessionStatusType.Reversed },
];

// Colors (matching your screenshot styling)
export const ConcessionStatusTypeColors: Record<ConcessionStatusType, LabelColor> = {
  [ConcessionStatusType.Draft]: 'default',
  [ConcessionStatusType.Pending]: 'warning',
  [ConcessionStatusType.Approved]: 'success',
  [ConcessionStatusType.Rejected]: 'error',
  [ConcessionStatusType.Cancelled]: 'error',
  [ConcessionStatusType.PartiallyReversed]: 'warning',
  [ConcessionStatusType.Reversed]: 'default',
};
