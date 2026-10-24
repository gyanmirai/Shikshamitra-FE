import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

export function registerStatusOptions(income: boolean) {
  return (income ? ['Received', 'Reversed'] : ['Paid', 'Returned']).map((value) => ({
    value,
    label: value,
  }));
}

export function toRegisterTableRow(row: AccountsActivityRow) {
  const manual = row.source === 'Income' || row.source === 'Expense';
  return {
    ...row,
    studentIdentity: row.studentId
      ? `${row.studentName || '—'}${row.grNumber ? ` (${row.grNumber})` : ''}`
      : '',
    classDivision: row.studentId ? row.classDivision || '' : '',
    counterparty: manual ? (row.counterparty ?? (row.studentId ? '' : row.studentName)) : '',
  };
}
