// ---------------- Payroll Status Enum ----------------
export enum PayrollStatus {
  Pending = 'pending',
  Locked = 'locked',
}

// ---------------- Payroll Status Colors ----------------
export const PayrollStatusColor: Record<PayrollStatus, string> = {
  [PayrollStatus.Pending]: 'warning',
  [PayrollStatus.Locked]: 'success',
};

// ---------------- Payroll Status Options ----------------
export const PayrollStatusOptions = [
  { label: 'Pending', value: PayrollStatus.Pending },
  { label: 'Locked', value: PayrollStatus.Locked },
];
