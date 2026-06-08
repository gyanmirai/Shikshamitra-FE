import { AdjustmentType, AdjustmentTabEnum, AdjustmentStatusEnum } from '../enums/adjustment.enum';

export const ADJUSTMENT_TYPE_OPTIONS = [
  { label: 'Fee Correction', value: AdjustmentType.FeeCorrection },
  { label: 'Overpayment Adjustment', value: AdjustmentType.OverpaymentAdjustment },
  { label: 'Discount Adjustment', value: AdjustmentType.DiscountAdjustment },
  { label: 'Refund Adjustment', value: AdjustmentType.RefundAdjustment },
  { label: 'Manual Adjustment', value: AdjustmentType.ManualAdjustment },
  { label: 'Scholarship Adjustment', value: AdjustmentType.ScholarshipAdjustment },
];

export const ADJUSTMENT_STATUS_COLORS: Record<
  AdjustmentStatusEnum,
  'warning' | 'success' | 'error' | 'info' | 'default'
> = {
  [AdjustmentStatusEnum.Pending]: 'warning',
  [AdjustmentStatusEnum.Rejected]: 'error',
  [AdjustmentStatusEnum.PartiallyApplied]: 'info',
  [AdjustmentStatusEnum.Applied]: 'success',
  [AdjustmentStatusEnum.Cancelled]: 'default',
};

export const ADJUSTMENT_TABS = [
  { label: 'Pending', value: AdjustmentTabEnum.Pending, color: 'warning' as const },
  { label: 'Approved', value: AdjustmentTabEnum.Approved, color: 'success' as const },
  { label: 'Rejected', value: AdjustmentTabEnum.Rejected, color: 'error' as const },
];

export const formatAdjustmentStatusLabel = (status: AdjustmentStatusEnum): string => {
  switch (status) {
    case AdjustmentStatusEnum.Pending:
      return 'Pending';
    case AdjustmentStatusEnum.Rejected:
      return 'Rejected';
    case AdjustmentStatusEnum.PartiallyApplied:
      return 'Partially Applied';
    case AdjustmentStatusEnum.Applied:
      return 'Applied';
    case AdjustmentStatusEnum.Cancelled:
      return 'Cancelled';
    default:
      return String(status);
  }
};
