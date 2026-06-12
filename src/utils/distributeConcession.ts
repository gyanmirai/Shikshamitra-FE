/**
 * Represents a single due fee allocation with its concession amount
 */
export interface IDueFeeAllocation {
  dueFeeId: string;
  concessionAmount: number;
}

/**
 * Distributes an approved concession amount across multiple due fees using integer division.
 *
 * The algorithm ensures:
 * - The sum of all allocations equals exactly the approvedConcessionAmount
 * - All concession amounts are whole numbers (integers)
 * - Distribution is as even as possible
 * - Remaining amount is distributed to the first N due fees
 *
 * Algorithm:
 * 1. Calculate base amount using integer division: base = amount / count
 * 2. Calculate remainder: remainder = amount % count
 * 3. First 'remainder' items get (base + 1), remaining items get base
 *
 * @param dueFeeIds - Array of due fee IDs to distribute across
 * @param approvedConcessionAmount - Total concession amount to distribute
 * @returns Array of due fee allocations with calculated concession amounts
 *
 * @example
 * // Distribute 20000 across 6 due fees
 * const allocations = distributeConcessionAcrossDueFees(
 *   ['fee1', 'fee2', 'fee3', 'fee4', 'fee5', 'fee6'],
 *   20000
 * );
 * // Result: [3334, 3334, 3333, 3333, 3333, 3333]
 * // Total: 20000
 */
export const distributeConcessionAcrossDueFees = (
  dueFeeIds: string[],
  approvedConcessionAmount: number
): IDueFeeAllocation[] => {
  // ─── Handle Edge Cases ──────────────────────────────────────────────────────

  // Case 1: No due fees to allocate to
  if (!dueFeeIds || dueFeeIds.length === 0) {
    return [];
  }

  // Case 2: Zero or negative concession amount
  if (approvedConcessionAmount <= 0) {
    return dueFeeIds.map((dueFeeId) => ({
      dueFeeId,
      concessionAmount: 0,
    }));
  }

  // ─── Calculate Base Amount and Remainder ────────────────────────────────────

  const dueFeeCount = dueFeeIds.length;

  // Base amount each due fee gets (using integer division)
  const baseAmount = Math.floor(approvedConcessionAmount / dueFeeCount);

  // Remainder to be distributed (add 1 to the first 'remainder' items)
  const remainder = approvedConcessionAmount % dueFeeCount;

  // ─── Build Allocations ──────────────────────────────────────────────────────

  const allocations: IDueFeeAllocation[] = dueFeeIds.map((dueFeeId, index) => {
    // First 'remainder' items get an extra 1
    const concessionAmount = index < remainder ? baseAmount + 1 : baseAmount;

    return {
      dueFeeId,
      concessionAmount,
    };
  });

  // ─── Validation (Optional: For Development/Debug) ──────────────────────────

  if (process.env.NODE_ENV === 'development') {
    const totalDistributed = allocations.reduce((sum, alloc) => sum + alloc.concessionAmount, 0);
    if (totalDistributed !== approvedConcessionAmount) {
      console.warn(
        `[distributeConcessionAcrossDueFees] Allocation sum (${totalDistributed}) ` +
          `does not match requested amount (${approvedConcessionAmount})`
      );
    }
  }

  return allocations;
};

/**
 * Calculates the per-month/per-line concession amount for selection display.
 *
 * This is used for UI display purposes to show what each selected month/line will receive.
 * Uses integer division to ensure whole number display.
 *
 * @param totalConcession - Total concession amount for a fee head
 * @param selectedCount - Number of selected months/lines
 * @returns Per-month concession amount (0 when no months are selected)
 *
 * @example
 * // Display concession per selected month
 * const perMonth = calculatePerLineConcession(10000, 4);
 * // Result: 2500
 */
export const calculatePerLineConcession = (
  totalConcession: number,
  selectedCount: number
): number => {
  if (selectedCount === 0) return 0;
  return Math.floor(totalConcession / selectedCount);
};
