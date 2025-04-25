export enum BiometricHostelAttendance {
  Missing,
  Present,
  Absent,
}

export const BiometricHostelAttendanceOptions = [
  {
    label: 'Missing',
    value: BiometricHostelAttendance.Missing,
  },
  {
    label: 'Present',
    value: BiometricHostelAttendance.Present,
  },
  {
    label: 'Absent',
    value: BiometricHostelAttendance.Absent,
  },
];

export const BiometricHostelAttendanceColor = {
  [BiometricHostelAttendance.Missing]: 'warning',
  [BiometricHostelAttendance.Present]: 'success',
  [BiometricHostelAttendance.Absent]: 'error',
};
