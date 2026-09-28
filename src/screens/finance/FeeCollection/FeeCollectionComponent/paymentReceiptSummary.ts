import type { FinanceAuditSummary } from 'src/redux/feeCollection/feeCollection';

const currency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function paymentReceiptSummary(
  summary: FinanceAuditSummary,
  amount: number,
  includeFeeBalance: boolean
) {
  const parts = [`Paid: ${currency(amount)}`];
  const status = summary.changedFields?.find((field) => field.field === 'status')?.newValue;
  if (status) {
    parts.push(`Status: ${status === 'InReconciliation' ? 'Pending verification' : status}`);
  }
  if (includeFeeBalance && summary.allocationLines?.length) {
    const pending = summary.allocationLines.reduce((total, line) => total + line.pendingAfter, 0);
    parts.push(`Pending: ${currency(pending)}`);
  }
  return parts.join(' | ');
}
