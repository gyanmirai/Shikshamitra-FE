export enum ReceiptStatusType {
  Pending = 'Pending',
  Partial = 'Partial',
  Paid = 'Paid',
}

export const ReceiptStatusOptions = [
  {
    label: 'Pending',
    value: ReceiptStatusType.Pending,
  },
  {
    label: 'Partial',
    value: ReceiptStatusType.Partial,
  },
  {
    label: 'Paid',
    value: ReceiptStatusType.Paid,
  },
];

export const ReceiptStatusColors: Record<string, string> = {
  [ReceiptStatusType.Pending]: 'warning',
  [ReceiptStatusType.Partial]: 'info',
  [ReceiptStatusType.Paid]: 'success',
};
