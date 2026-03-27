export enum InvoiceStatusType {
  Pending = 'Pending',
  Partial = 'Partial',
  Paid = 'Paid',
}

export const InvoiceStatusOptions = [
  {
    label: 'Pending',
    value: InvoiceStatusType.Pending,
  },
  {
    label: 'Partial',
    value: InvoiceStatusType.Partial,
  },
  {
    label: 'Paid',
    value: InvoiceStatusType.Paid,
  },
];

export const InvoiceStatusColors: Record<string, string> = {
  [InvoiceStatusType.Pending]: 'warning',
  [InvoiceStatusType.Partial]: 'info',
  [InvoiceStatusType.Paid]: 'success',
};
