import { AdjustmentType, AdjustmentStatusEnum } from '../enums/adjustment.enum';

export const ADJUSTMENT_TYPE_OPTIONS = Object.values(AdjustmentType).map((v) => ({
  label: v,
  value: v,
}));

export const ADJUSTMENT_STATUS_OPTIONS = Object.values(AdjustmentStatusEnum).map((v) => ({
  label: v,
  value: v,
}));

export const ADJUSTMENT_STATUS_COLORS: Record<
  AdjustmentStatusEnum,
  'warning' | 'success' | 'error'
> = {
  [AdjustmentStatusEnum.Pending]: 'warning',
  [AdjustmentStatusEnum.Approved]: 'success',
  [AdjustmentStatusEnum.Rejected]: 'error',
};

export const ADJUSTMENT_TABS = [
  { label: 'Pending', value: AdjustmentStatusEnum.Pending, color: 'warning' },
  { label: 'Approved', value: AdjustmentStatusEnum.Approved, color: 'success' },
  { label: 'Rejected', value: AdjustmentStatusEnum.Rejected, color: 'error' },
] as const;
