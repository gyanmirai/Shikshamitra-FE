export type PayrollAdjustmentLike = {
  isSystemGenerated?: boolean | null;
  sourceType?: string | null;
};

export function isSystemGeneratedPayrollAdjustment(
  adjustment: PayrollAdjustmentLike | null | undefined
) {
  return Boolean(adjustment?.isSystemGenerated);
}

export function getPayrollAdjustmentSourceLabel(
  adjustment: PayrollAdjustmentLike | null | undefined
) {
  if (adjustment?.sourceType === 'leave_year_end_encashment') {
    return 'Leave encashment';
  }

  return 'System';
}
