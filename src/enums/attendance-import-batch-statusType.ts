export enum AttendanceImportBatchStatus {
  Preview = 1,
  Confirmed = 2,
  'Batch Locked' = 3,
  'Payroll Locked' = 4,
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
    value: AttendanceImportBatchStatus['Payroll Locked'],
  },
  {
    label: 'Batch Locked',
    value: AttendanceImportBatchStatus['Batch Locked'],
  },
];

export const AttendanceImportBatchStatusColors: Record<string, string> = {
  [AttendanceImportBatchStatus.Preview]: 'warning',
  [AttendanceImportBatchStatus.Confirmed]: 'success',
  [AttendanceImportBatchStatus['Batch Locked']]: 'info',
  [AttendanceImportBatchStatus['Payroll Locked']]: 'error',
};
