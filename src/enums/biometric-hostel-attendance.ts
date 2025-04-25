export enum BiometricHostelAttendanceType {
  Missing,
  Present,
  Absent,
}

export const BiometricHostelAttendanceOptions = [
  {
    label: 'Missing',
    value: BiometricHostelAttendanceType.Missing,
  },
  {
    label: 'Present',
    value: BiometricHostelAttendanceType.Present,
  },
  {
    label: 'Absent',
    value: BiometricHostelAttendanceType.Absent,
  },
];

export const BiometricHostelAttendanceColor = {
  [BiometricHostelAttendanceType.Missing]: 'warning',
  [BiometricHostelAttendanceType.Present]: 'success',
  [BiometricHostelAttendanceType.Absent]: 'error',
};
