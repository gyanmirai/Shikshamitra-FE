export enum AttendanceImportBatchStatus {
  Preview,
  Confirmed,
  PayrollLocked,
}

export const AttendanceImportBatchStatusOptions = [
  {
    label: 'Preview',
    value: AttendanceImportBatchStatus.Preview,
  },
  {
    label: 'Confirmed',
    value: AttendanceImportBatchStatus.Confirmed,
  },
  {
    label: 'Payroll Locked',
    value: AttendanceImportBatchStatus.PayrollLocked,
  },
];

export const AttendanceImportBatchStatusColors: Record<string, string> = {
  [AttendanceImportBatchStatus.Preview]: 'warning',
  [AttendanceImportBatchStatus.Confirmed]: 'success',
  [AttendanceImportBatchStatus.PayrollLocked]: 'error',
};
