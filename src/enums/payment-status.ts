export enum PaymentStatusType {
  'Failed' = 'Failed',

  'Success' = 'Success',
}

export const PaymentStatusOptions = [
  {
    label: 'Failed',
    value: PaymentStatusType.Failed,
  },

  {
    label: 'Success',
    value: PaymentStatusType.Success,
  },
];

export const PaymentStatusTypeColors = {
  [PaymentStatusType.Failed]: 'error',

  [PaymentStatusType.Success]: 'success',
};
