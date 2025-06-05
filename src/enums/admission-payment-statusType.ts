export enum AdmissionPaymentStatusType {
  Paid,
  Unpaid,
  Partial,
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
