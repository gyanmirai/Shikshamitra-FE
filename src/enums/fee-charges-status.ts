export enum ChargesPaymentStatus {
  Pending,
  Approved,
  Rejected,
}

export const ChargesPaymentStatusOptions = [
  {
    label: 'Pending',
    value: ChargesPaymentStatus.Pending,
  },
  {
    label: 'Approved',
    value: ChargesPaymentStatus.Approved,
  },
  {
    label: 'Rejected',
    value: ChargesPaymentStatus.Rejected,
  },
];

export const ChargesPaymentStatusColors = {
  [ChargesPaymentStatus.Pending]: 'warning',
  [ChargesPaymentStatus.Approved]: 'success',
  [ChargesPaymentStatus.Rejected]: 'error',
};
