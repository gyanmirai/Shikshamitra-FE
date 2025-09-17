export enum PaymentMethodsStatusType {
  Pending,
  Approved,
  Rejected,
}

export const PaymentMethodsStatusOptions = [
  {
    label: 'Pending',
    value: PaymentMethodsStatusType.Pending,
  },
  {
    label: 'CleaApproveded',
    value: PaymentMethodsStatusType.Approved,
  },
  {
    label: 'Rejected',
    value: PaymentMethodsStatusType.Rejected,
  },
];

export const PamentMethodsStatusColor = {
  [PaymentMethodsStatusType.Pending]: 'warning',
  [PaymentMethodsStatusType.Approved]: 'success',
  [PaymentMethodsStatusType.Rejected]: 'error',
};
