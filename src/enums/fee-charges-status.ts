export enum ChargesPaymentStatus {
  Pending,
  Approved,
  Rejected,
  Voided,
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
  {
    label: 'Voided',
    value: ChargesPaymentStatus.Voided,
  },
];

export const ChargesPaymentStatusColors = {
  [ChargesPaymentStatus.Pending]: 'warning',
  [ChargesPaymentStatus.Approved]: 'success',
  [ChargesPaymentStatus.Rejected]: 'error',
  [ChargesPaymentStatus.Voided]: 'default',
};
