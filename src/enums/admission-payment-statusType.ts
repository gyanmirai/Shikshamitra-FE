export enum AdmissionPaymentStatusType {
  Paid = 1,
  Unpaid = 2,
  Partial = 3,
}

export const AdmissionPaymentStatusOptions = [
  {
    label: 'Paid',
    value: AdmissionPaymentStatusType.Paid,
  },
  {
    label: 'Pending',
    value: AdmissionPaymentStatusType.Unpaid,
  },
];

export const AdmissionPaymentStatusTypeColors = {
  [AdmissionPaymentStatusType.Unpaid]: 'warning',
  [AdmissionPaymentStatusType.Paid]: 'success',
  [AdmissionPaymentStatusType.Partial]: 'error',
};
