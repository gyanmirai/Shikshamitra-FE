import type { CollectFeeOutput } from 'src/redux/feeCollection/feeCollection';

export function collectionReceiptAmounts(collection: CollectFeeOutput) {
  const principal = collection.paidFeeHeads.reduce((sum, head) => sum + head.amountPaid, 0);
  const lateFees = (collection.paidLateFees ?? []).reduce((sum, line) => sum + line.amountPaid, 0);
  const charges = (collection.paidCharges ?? []).reduce(
    (sum, charge) => sum + charge.amountPaid,
    0
  );
  const combined = collection.receiptGrouping === 'Combined' && charges + lateFees > 0;
  // Older servers put late fees on the fee receipt even when an ordinary charge
  // receipt also exists. Canonical document totals disambiguate new and replayed receipts.
  const lateFeesOnFeeReceipt =
    !!collection.feeReceiptId &&
    (collection.feeReceiptAmount == null || collection.feeReceiptAmount > principal);
  return {
    feeTotal: collection.feeReceiptId
      ? (collection.feeReceiptAmount ??
        (combined ? collection.receivedAmount : principal + lateFees))
      : 0,
    feeLateFee: lateFeesOnFeeReceipt ? lateFees : 0,
    chargeTotal: collection.chargeReceiptId
      ? (collection.chargeReceiptAmount ?? charges + (collection.feeReceiptId ? 0 : lateFees))
      : 0,
    combined,
  };
}
