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
    label: 'Cancelled',
    value: ChargesPaymentStatus.Voided,
  },
];

export const ChargesPaymentStatusColors = {
  [ChargesPaymentStatus.Pending]: 'warning',
  [ChargesPaymentStatus.Approved]: 'success',
  [ChargesPaymentStatus.Rejected]: 'error',
  [ChargesPaymentStatus.Voided]: 'default',
};

// Batch lifecycle returned by the backend; student-line approval uses ChargesPaymentStatus.
export enum ChargeWorkflowStatus {
  Pending = 0,
  InProcess = 1,
  Completed = 2,
  Rejected = 3,
}

export const ChargeWorkflowStatusOptions = [
  { value: ChargeWorkflowStatus.Pending, label: 'Pending', color: 'warning' },
  { value: ChargeWorkflowStatus.InProcess, label: 'In Process', color: 'info' },
  { value: ChargeWorkflowStatus.Completed, label: 'Completed', color: 'success' },
  { value: ChargeWorkflowStatus.Rejected, label: 'Rejected', color: 'error' },
] as const;
