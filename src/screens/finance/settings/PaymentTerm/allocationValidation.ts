export const ALLOCATION_TOTAL_ERROR = 'Percentage allocations must total 100%';

export function getAllocationSummary(
  installments: { allocationPercentage?: number | string | null }[]
) {
  const total = installments.reduce(
    (sum, installment) => sum + Math.round((Number(installment.allocationPercentage) || 0) * 100),
    0
  );
  const delta = 10000 - total;
  return {
    valid: total === 10000,
    message:
      delta === 0
        ? ''
        : `Allocation total is ${(total / 100).toFixed(2)}%. ${
            delta < 0 ? 'Reduce' : 'Increase'
          } the allocation by ${(Math.abs(delta) / 100).toFixed(2)}% so the total equals 100%.`,
  };
}
