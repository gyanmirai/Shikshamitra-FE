import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import { matchesTableRowFilters } from 'src/components/customizabaleTable/hooks/table-row-filter';

type Row = Record<string, any>;
type FieldType = 'string' | 'number' | 'date' | 'enum';
const receiptFields: Record<string, FieldType> = {
  receiptNumber: 'string', studentName: 'string', receiptKind: 'string', paymentMethodLabel: 'string',
  verificationStatus: 'string', rollNo: 'string', totalPaidAmount: 'number', receiptDate: 'date',
};
const reconciliationFields: Record<string, FieldType> = {
  studentName: 'string', board: 'string', standardName: 'string', class: 'string', amount: 'number', status: 'enum', remarks: 'string',
  receiptNumber: 'string', chequeNo: 'string', bankName: 'string', receivedChequeDate: 'date', ddNumber: 'string',
  ddIssueDate: 'date', paymentDate: 'date', transactionId: 'string', transferDate: 'date', accountHolderName: 'string',
  bankLabel: 'string', cardHolderName: 'string', last4Digits: 'string', upiId: 'string', upiTransactionId: 'string', receiptDate: 'date',
};
const combined = (value: string, suffix?: string) => (value || '-') + (suffix ? ` - (${suffix})` : '');
function displayRow(row: Row, receipt: boolean): Row {
  if (receipt) return {
    ...row, studentName: row.grNo ? `${row.studentName} (${row.grNo})` : row.studentName,
    receiptKind: row.receiptKindLabel, paymentMethodLabel: row.paymentMethodLabel || 'Not recorded', rollNo: row.rollNo ?? '—',
    verificationStatus: row.linkedFinalReceiptNumber ? `Receipt: ${row.linkedFinalReceiptNumber}` : ['Not required', 'Pending', 'Verified', 'Rejected'][row.verificationStatus],
  };
  const detail = row.instrumentDetails ?? {};
  const method = row.paymentMethodLabel;
  return { ...row,
    studentName: (row.studentName || '-') + (row.grNumber ? ` (${row.grNumber})` : ''),
    board: combined(row.board, row.medium), standardName: combined(row.class, row.division), class: combined(row.class, row.division),
    chequeNo: detail.chequeNumber, receivedChequeDate: detail.chequeDate,
    ddNumber: detail.ddNumber, ddIssueDate: detail.ddDate,
    bankName: method === 'DemandDraft' ? detail.issuingBankName || detail.branchName : detail.bankName,
    paymentDate: method === 'DemandDraft' ? detail.paymentDate ?? row.paymentDate : detail.transactionDate || row.receiptDate,
    transactionId: method === 'BankTransfer' ? detail.transactionReferenceNumber : detail.transactionId,
    transferDate: detail.transferDate, accountHolderName: detail.accountHolderName, bankLabel: row.bankLabel || '-',
    cardHolderName: detail.cardHolderName, last4Digits: detail.cardLast4 ? `•••• ${detail.cardLast4.slice(-4)}` : null,
    upiId: detail.upiId || '-', upiTransactionId: detail.upiTransactionId || '-',
    remarks: ['Cheque', 'UPI'].includes(method) ? row.remarks || '-' : row.remarks,
  };
}

/** Synthetic browser transport only: evaluate presented values over all rows before paging.
 * Backend HTTP tests independently verify persistence, scope and query semantics. */
export function applyFixtureColumnFilters<T extends Row>(rows: T[], serialized: unknown, receipt: boolean): T[] {
  if (!serialized) return rows;
  const fields = receipt ? receiptFields : reconciliationFields;
  const parsed = JSON.parse(String(serialized)) as IParams['filters'];
  const filters = parsed.map((criterion) => ({ ...criterion, valueType: fields[criterion.column] }));
  const columns: IColumn[] = Object.entries(fields).map(([id, filterType]) => ({ id, label: id, filterType }));
  return rows.filter((row) => matchesTableRowFilters(displayRow(row, receipt), filters, columns));
}
