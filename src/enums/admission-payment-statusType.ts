export enum AdmissionPaymentStatusType {
  'Pending' = 'Pending',
  'Complete' = 'Complete',
}

export const AdmissionPaymentStatusOptions = [
  {
    label: 'Pending',
    value: AdmissionPaymentStatusType.Pending,
  },
  {
    label: 'Complete',
    value: AdmissionPaymentStatusType.Complete,
  },
];

export const AdmissionPaymentStatusTypeColors = {
  [AdmissionPaymentStatusType.Pending]: 'warning',
  [AdmissionPaymentStatusType.Complete]: 'success',
};
