export enum AttendanceImportBatchStatus {
  Preview = 1,
  Confirmed = 2,
  BatchLocked = 3,
  PayrollLocked = 4,
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
  {
    label: 'Batch Locked',
    value: AttendanceImportBatchStatus.BatchLocked,
  },
];

export const AttendanceImportBatchStatusColors: Record<string, string> = {
  [AttendanceImportBatchStatus.Preview]: 'warning',
  [AttendanceImportBatchStatus.Confirmed]: 'success',
  [AttendanceImportBatchStatus.BatchLocked]: 'info',
  [AttendanceImportBatchStatus.PayrollLocked]: 'error',
};
