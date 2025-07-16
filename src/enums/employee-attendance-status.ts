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

export const EmployeeAttendanceStatusColor = {
  [EmployeeAttendanceStatus.Present]: 'success',
  [EmployeeAttendanceStatus.HalfDayLeave]: 'warning',
  [EmployeeAttendanceStatus.FullDayLeave]: 'error',
  [EmployeeAttendanceStatus.All]: 'default', // Add fallback values
  [EmployeeAttendanceStatus.Late]: 'info',
  [EmployeeAttendanceStatus.RejectedLeave]: 'error',
};
