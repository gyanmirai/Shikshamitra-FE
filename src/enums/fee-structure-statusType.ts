import type { ButtonProps } from '@mui/material';

export enum FeeStructureClassStatusType {
  Current,
  Completed,
  Remaining,
}

export const FeeStructureClassStatusOptions = [
  {
    label: 'Current',
    value: FeeStructureClassStatusType.Current,
  },
  {
    label: 'Completed',
    value: FeeStructureClassStatusType.Completed,
  },
  {
    label: 'Remaining',
    value: FeeStructureClassStatusType.Remaining,
  },
];

export const FeeStructureClassStatusTypeColors: Record<
  FeeStructureClassStatusType,
  ButtonProps['color']
> = {
  [FeeStructureClassStatusType.Current]: 'success',
  [FeeStructureClassStatusType.Completed]: 'success',
  [FeeStructureClassStatusType.Remaining]: 'inherit',
};
