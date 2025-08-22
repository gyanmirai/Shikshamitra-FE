export enum ChargesPaymentStatus {
  Approved,
  Pending,
  Rejected,
}

export const ChargesPaymentStatusOptions = [
  {
    label: 'Approved',
    value: ChargesPaymentStatus.Approved,
  },
  {
    label: 'Pending',
    value: ChargesPaymentStatus.Pending,
  },
  {
    label: 'Rejected',
    value: ChargesPaymentStatus.Rejected,
  },
];

export const ChargesPaymentStatusColors = {
  [ChargesPaymentStatus.Approved]: 'success',
  [ChargesPaymentStatus.Pending]: 'warning',
  [ChargesPaymentStatus.Rejected]: 'error',
};
