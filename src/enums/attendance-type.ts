export enum AttendanceStatusType {
  'Present' = 'Present',
  'Absent' = 'Absent',
}

export const AttendanceStatusOptions = [
  {
    label: 'Pending',
    value: AttendanceStatusType.Present,
  },
  {
    label: 'Absent',
    value: AttendanceStatusType.Absent,
  },
];

export const AttendanceStatusTypeColors = {
  [AttendanceStatusType.Present]: 'success',
  [AttendanceStatusType.Absent]: 'error',
};
