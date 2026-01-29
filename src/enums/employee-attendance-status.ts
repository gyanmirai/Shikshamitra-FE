export enum EmployeeAttendanceStatus {
  Pending,
  Present,
  HalfDayLeave,
  FullDayLeave,
  Late,
  RejectedLeave,
}

export const EmployeeAttendanceStatusOptions = [
  {
    label: 'Pending',
    value: EmployeeAttendanceStatus.Pending,
  },
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
  [EmployeeAttendanceStatus.Late]: 'info',
  [EmployeeAttendanceStatus.RejectedLeave]: 'error',
};
