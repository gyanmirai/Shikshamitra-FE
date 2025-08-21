import type { ButtonProps } from '@mui/material';

export enum FeeStructureLockStatusType {
  Locked,
  Unlocked,
}

export const FeeStructureLockStatusOptions = [
  {
    label: 'Locked',
    value: FeeStructureLockStatusType.Locked,
  },
  {
    label: 'Unlocked',
    value: FeeStructureLockStatusType.Unlocked,
  },
];

export const FeeStructureLockStatusTypeColors: Record<
  FeeStructureLockStatusType,
  ButtonProps['color']
> = {
  [FeeStructureLockStatusType.Locked]: 'error',
  [FeeStructureLockStatusType.Unlocked]: 'success',
};
