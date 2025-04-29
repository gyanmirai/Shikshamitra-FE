export enum HostelPaymentStatusType {
  Paid,
  UnPaid,
  Overdue,
}

export const HostelPaymentStatusOptions = [
  {
    label: 'Paid',
    value: HostelPaymentStatusType.Paid,
  },
  {
    label: 'UnPaid',
    value: HostelPaymentStatusType.UnPaid,
  },
  {
    label: 'Overdue',
    value: HostelPaymentStatusType.Overdue,
  },
];

export const HostelPaymentStatusTypeColor = {
  [HostelPaymentStatusType.Paid]: 'success',
  [HostelPaymentStatusType.UnPaid]: 'warning',
  [HostelPaymentStatusType.Overdue]: 'error',
};
