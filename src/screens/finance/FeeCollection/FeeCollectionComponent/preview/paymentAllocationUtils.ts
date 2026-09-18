import dayjs from 'dayjs';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import type { IFeeCharge, SelectedItem } from '../../Components/type';

// ─── Allocated Row Types ───────────────────────────────────────────────────────

export interface AllocatedFeeRow {
  type: 'fee';
  key: string;
  dueFeeId?: string;
  feeHeadId: string;
  feeHeadName: string;
  period: string; // formatted e.g. "Apr 2026"
  installmentLabel?: string;
  originalAmount: number;
  paidAmount: number;
  principalPaidAmount: number;
  lateFeePaidAmount: number;
  remainingAmount: number;
  status: FeeCollectionStatusType;
}

export interface AllocatedChargeRow {
  type: 'charge';
  key: string;
  chargeName: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeCollectionStatusType;
}

export type AllocatedRow = AllocatedFeeRow | AllocatedChargeRow;

// ─── Internal Wallet State ─────────────────────────────────────────────────────

interface AllocationWallet {
  remaining: number;
  rows: AllocatedRow[];
}

// ─── Status Resolver ───────────────────────────────────────────────────────────

/**
 * Derives the FeeCollectionStatusType for an allocated entry.
 * - paidAmount === 0          → Pending  (should never appear in preview, filtered out)
 * - 0 < paidAmount < original → Partial
 * - paidAmount >= original    → Paid
 */
const resolveAllocationStatus = (
  paidAmount: number,
  originalAmount: number
): FeeCollectionStatusType => {
  if (paidAmount <= 0) return FeeCollectionStatusType.Pending;
  if (paidAmount < originalAmount) return FeeCollectionStatusType.Partial;
  return FeeCollectionStatusType.Paid;
};

// ─── Allocation Reducer Helpers ────────────────────────────────────────────────

/**
 * Attempts to allocate from the wallet toward a single fee item.
 * Returns the updated wallet. All items are included (even with ₹0 allocation).
 */
const allocateFeeItem = (
  wallet: AllocationWallet,
  item: SelectedItem,
  feeHeadMap: Record<string, string>
): AllocationWallet => {
  const lateFeeAmount = item.lateFeeAmount ?? 0;
  const originalAmount = item.dueAmount + lateFeeAmount;
  const paidAmount = wallet.remaining > 0 ? Math.min(wallet.remaining, originalAmount) : 0;
  const principalPaidAmount = Math.min(paidAmount, item.dueAmount);
  const lateFeePaidAmount = Math.max(0, paidAmount - principalPaidAmount);

  return {
    remaining: wallet.remaining - paidAmount,
    rows: [
      ...wallet.rows,
      {
        type: 'fee',
        key: item.dueFeeId ?? `${item.feeHeadId}-${item.period}`,
        dueFeeId: item.dueFeeId,
        feeHeadId: item.feeHeadId,
        feeHeadName: feeHeadMap[item.feeHeadId] ?? item.feeHeadId,
        period: dayjs(`${item.period}-01`).format('MMM YYYY'),
        installmentLabel: item.installmentLabel,
        originalAmount,
        paidAmount,
        principalPaidAmount,
        lateFeePaidAmount,
        remainingAmount: originalAmount - paidAmount,
        status: resolveAllocationStatus(paidAmount, originalAmount),
      } satisfies AllocatedFeeRow,
    ],
  };
};

/**
 * Attempts to allocate from the wallet toward a single charge.
 * Returns the updated wallet. All charges are included (even with ₹0 allocation).
 */
const allocateCharge = (wallet: AllocationWallet, charge: IFeeCharge): AllocationWallet => {
  const paidAmount = wallet.remaining > 0 ? Math.min(wallet.remaining, charge.amount) : 0;

  return {
    remaining: wallet.remaining - paidAmount,
    rows: [
      ...wallet.rows,
      {
        type: 'charge',
        key: charge.chargeId,
        chargeName: charge.chargeName,
        originalAmount: charge.amount,
        paidAmount,
        remainingAmount: charge.amount - paidAmount,
        status: resolveAllocationStatus(paidAmount, charge.amount),
      } satisfies AllocatedChargeRow,
    ],
  };
};

// ─── Public API ────────────────────────────────────────────────────────────────

export interface PaymentAllocationResult {
  /** All selected rows with their allocation amounts (items that receive ₹0 are shown as Pending). */
  allocatedRows: AllocatedRow[];
  /** Total amount distributed across all rows. */
  allocatedAmount: number;
  /** Amount entered but not consumed by any item or charge. */
  unallocatedAmount: number;
}

/**
 * Allocates `paymentAmount` sequentially:
 *   1. Fee items — in order received.
 *   2. Charges   — in order received.
 *
 * Supports partial payment on the first item/charge that exhausts the wallet.
 * All selected items/charges are included — those that receive ₹0 are marked as Pending.
 */
export const allocatePayment = (
  selectedItems: SelectedItem[],
  selectedCharges: IFeeCharge[],
  feeHeadMap: Record<string, string>,
  paymentAmount: number
): PaymentAllocationResult => {
  const initialWallet: AllocationWallet = { remaining: paymentAmount, rows: [] };

  // Phase 1: distribute across fee items
  const afterItems = selectedItems.reduce(
    (wallet, item) => allocateFeeItem(wallet, item, feeHeadMap),
    initialWallet
  );

  // Phase 2: distribute remaining across charges
  const afterCharges = selectedCharges.reduce(
    (wallet, charge) => allocateCharge(wallet, charge),
    afterItems
  );

  const allocatedAmount = afterCharges.rows.reduce((sum, r) => sum + r.paidAmount, 0);

  return {
    allocatedRows: afterCharges.rows,
    allocatedAmount,
    unallocatedAmount: Math.max(0, paymentAmount - allocatedAmount),
  };
};

// ─── Convenience Selectors ─────────────────────────────────────────────────────

export const selectFeeRows = (rows: AllocatedRow[]): AllocatedFeeRow[] =>
  rows.filter((r): r is AllocatedFeeRow => r.type === 'fee');

export const selectChargeRows = (rows: AllocatedRow[]): AllocatedChargeRow[] =>
  rows.filter((r): r is AllocatedChargeRow => r.type === 'charge');

// ─── Grouped Month View Types & Helpers ────────────────────────────────────────

export interface MonthAllocationGroup {
  /** Formatted period label, e.g. "Apr 2026" */
  period: string;
  rows: AllocatedFeeRow[];
  totalOriginal: number;
  totalPaid: number;
  totalRemaining: number;
  status: FeeCollectionStatusType;
}

/**
 * Groups `AllocatedFeeRow[]` by their `period` string, preserving insertion order.
 * Produces one `MonthAllocationGroup` per unique period — purely functional,
 * no mutations or loops.
 */
export const groupFeeRowsByMonth = (feeRows: AllocatedFeeRow[]): MonthAllocationGroup[] => {
  const groupMap = feeRows.reduce<Map<string, AllocatedFeeRow[]>>((acc, row) => {
    const existing = acc.get(row.period) ?? [];
    return acc.set(row.period, [...existing, row]);
  }, new Map());

  return Array.from(groupMap.entries()).map(([period, rows]) => ({
    period,
    rows,
    totalOriginal: rows.reduce((s, r) => s + r.originalAmount, 0),
    totalPaid: rows.reduce((s, r) => s + r.paidAmount, 0),
    totalRemaining: rows.reduce((s, r) => s + r.remainingAmount, 0),
    status: resolveAllocationStatus(rows[0].paidAmount, rows[0].originalAmount),
  }));
};
