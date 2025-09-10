import type { LabelColor } from 'src/components/label';

export enum LibraryChargeStatusType {
  Pending,
  Paid,
  Overdue,
}

export const LibraryChargeStatusOptions = [
  {
    label: 'Pending',
    value: LibraryChargeStatusType.Pending,
  },
  {
    label: 'Paid',
    value: LibraryChargeStatusType.Paid,
  },
  {
    label: 'Overdue',
    value: LibraryChargeStatusType.Overdue,
  },
];

export const LibraryChargeStatusTypeColors: Record<LibraryChargeStatusType, LabelColor> = {
  [LibraryChargeStatusType.Pending]: 'warning',
  [LibraryChargeStatusType.Paid]: 'success',
  [LibraryChargeStatusType.Overdue]: 'error',
};
