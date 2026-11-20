import type { FeeReceiptDetail } from 'src/redux/invoiceAndReceipt/feeReceiptApi';

import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

export const receiptSnapshotAmount = (amount: number, currency?: string | null) =>
  formatNumber(String(amount), currency || undefined, { fractionDigits: 2 });

export function ReceiptSettlementSection({ receipt }: { receipt: FeeReceiptDetail }) {
  const snapshot = receipt.settlementSnapshot;
  if (!snapshot) return null;
  return (
    <DetailSection
      title="Saved financial position"
      icon="mdi:cash-check"
      helpText="Amounts saved for this document at collection or verification. The original provisional document retains its original position."
    >
      <DetailGrid>
        <DetailField
          label="Original amount"
          value={receiptSnapshotAmount(snapshot.originalAmount, receipt.currency)}
        />
        <DetailField
          label="Settled amount"
          value={receiptSnapshotAmount(snapshot.settledAmount, receipt.currency)}
        />
        <DetailField
          label="Pending verification"
          value={receiptSnapshotAmount(snapshot.pendingVerificationAmount, receipt.currency)}
        />
        <DetailField
          label="Financial outstanding"
          value={receiptSnapshotAmount(snapshot.financialOutstandingAmount, receipt.currency)}
        />
        <DetailField
          label="Collectible amount"
          value={receiptSnapshotAmount(snapshot.collectibleAmount, receipt.currency)}
        />
        <DetailField
          label="Net waived amount"
          value={receiptSnapshotAmount(snapshot.netWaivedAmount, receipt.currency)}
        />
      </DetailGrid>
    </DetailSection>
  );
}
