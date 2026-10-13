import type { StructureInstallment } from 'src/redux/finance/feeStructureWorkspace';

import { roundUpAmount } from 'src/utils/whole-rupee-amount';

/** Display preview of PaymentTermScheduleResolver; saved amounts remain server-owned. */
export function structureScheduleAmounts(amount: number | null, rows: StructureInstallment[]) {
  if (
    amount === null ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    rows.some((row) => {
      const percentage = row.allocationPercentage;
      return (
        percentage === null || !Number.isFinite(percentage) || percentage <= 0 || percentage > 100
      );
    }) ||
    Math.abs(rows.reduce((sum, row) => sum + (row.allocationPercentage ?? 0), 0) - 100) > 0.000001
  ) {
    return rows.map(() => null);
  }

  const total = roundUpAmount(amount);
  let allocated = 0;
  return rows.map((row, index) => {
    if (index === rows.length - 1) return total - allocated;
    const share = (total * row.allocationPercentage!) / 100;
    // Ignore floating-point noise at an exact whole-rupee boundary before flooring.
    const nearest = Math.round(share);
    const tolerance = Math.max(1, Math.abs(share)) * Number.EPSILON * 8;
    const installment = Math.floor(Math.abs(share - nearest) <= tolerance ? nearest : share);
    allocated += installment;
    return installment;
  });
}
