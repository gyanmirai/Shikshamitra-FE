export enum AttendanceRowStatus {
  Present,
  Absent,
  HalfDay,
}

export const AttendanceRowStatusOptions = [
  {
    label: 'Present',
    value: AttendanceRowStatus.Present,
  },
  {
    label: 'Absent',
    value: AttendanceRowStatus.Absent,
  },
  {
    label: 'Half Day',
    value: AttendanceRowStatus.HalfDay,
  },
];

export const AttendanceRowStatusColors: Record<AttendanceRowStatus, string> = {
  [AttendanceRowStatus.Present]: 'success',
  [AttendanceRowStatus.Absent]: 'error',
  [AttendanceRowStatus.HalfDay]: 'warning',
};
