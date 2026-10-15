import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

export function registerSourceOptions(income: boolean) {
  return income
    ? [
        { value: 'Collection', label: 'Student Payment' },
        { value: 'Income', label: 'Other Income' },
      ]
    : [
        { value: 'Expense', label: 'School Expense' },
        { value: 'Refund', label: 'Student Refund' },
      ];
}

export function registerStatusOptions(income: boolean) {
  return (income ? ['Received', 'Reversed'] : ['Awaiting payout', 'Paid', 'Returned']).map(
    (value) => ({ value, label: value })
  );
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
