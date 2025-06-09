export enum EmployeeLeaveStatusType {
  Pending,
  Approved,
  Rejected,
  Viewed,
}

export const EmployeeLeaveStatusOptions = [
  {
    label: 'Pending',
    value: EmployeeLeaveStatusType.Pending,
  },
  {
    label: 'Approved',
    value: EmployeeLeaveStatusType.Approved,
  },
  {
    label: 'Rejected',
    value: EmployeeLeaveStatusType.Rejected,
  },
  {
    label: 'Viewed',
    value: EmployeeLeaveStatusType.Viewed,
  },
];

export const EmployeeLeaveStatusTypeColor = {
  [EmployeeLeaveStatusType.Pending]: 'warning',
  [EmployeeLeaveStatusType.Approved]: 'success',
  [EmployeeLeaveStatusType.Rejected]: 'error',
  [EmployeeLeaveStatusType.Viewed]: 'info',
};
