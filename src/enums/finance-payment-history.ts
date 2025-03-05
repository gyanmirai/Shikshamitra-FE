export enum FinancePaymentHistoryStatusType {
  'Paid' = 'Paid',
  'Failed' = 'Failed',
  'Pending' = 'Pending',
}

export const FinancePaymentHistoryStatusOptions = [
  {
    label: 'Paid',
    value: FinancePaymentHistoryStatusType.Paid,
  },
  {
    label: 'Failed',
    value: FinancePaymentHistoryStatusType.Failed,
  },
  {
    label: 'Pending',
    value: FinancePaymentHistoryStatusType.Pending,
  },
];

export const FinancePaymentHistoryStatusTypeColors = {
  [FinancePaymentHistoryStatusType.Paid]: 'success',
  [FinancePaymentHistoryStatusType.Failed]: 'error',
  [FinancePaymentHistoryStatusType.Pending]: 'warning',
};
