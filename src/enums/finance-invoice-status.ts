export enum InvoiceStatusType {
  Sent,
  Paid,
  Overdue,
}

export const InvoiceStatusOptions = [
  {
    label: 'Sent',
    value: InvoiceStatusType.Sent,
  },
  {
    label: 'Paid',
    value: InvoiceStatusType.Paid,
  },
  {
    label: 'Overdue',
    value: InvoiceStatusType.Overdue,
  },
];

export const InvoiceStatusColors = {
  [InvoiceStatusType.Sent]: 'info',
  [InvoiceStatusType.Paid]: 'success',
  [InvoiceStatusType.Overdue]: 'error',
};
