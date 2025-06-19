export enum EmployeeAttendanceStatus {
  Present,
  HalfDayLeave,
  FullDayLeave,
  All,
  Late,
  RejectedLeave,
}

export const EmployeeAttendanceStatusOptions = [
  {
    label: 'Present',
    value: EmployeeAttendanceStatus.Present,
  },
  {
    label: 'HalfDayLeave',
    value: EmployeeAttendanceStatus.HalfDayLeave,
  },
  {
    label: 'FullDayLeave',
    value: EmployeeAttendanceStatus.FullDayLeave,
  },
  {
    label: 'All',
    value: EmployeeAttendanceStatus.All,
  },
  {
    label: 'Late',
    value: EmployeeAttendanceStatus.Late,
  },
  {
    label: 'RejectedLeave',
    value: EmployeeAttendanceStatus.RejectedLeave,
  },
];

export enum EmployeeAttendanceStatusColor {
  Present = 'success',
  HalfDayLeave = 'warning',
  FullDayLeave = 'error',
}
