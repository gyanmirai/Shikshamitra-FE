export enum AttendanceStatusType {
  'Present' = 'Present',
  'Absent' = 'Absent',
}

export const AttendanceStatusOptions = [
  {
    label: 'Present',
    value: AttendanceStatusType.Present,
  },
  {
    label: 'Absent',
    value: AttendanceStatusType.Absent,
  },
];

export const AttendanceStatusTypeColors = {
  [AttendanceStatusType.Present]: 'success.main',
  [AttendanceStatusType.Absent]: 'error.main',
};
