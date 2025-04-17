export enum EmployeeLeaveStatusType {
  Pending,
  Approved,
  Rejected,
  Reviewed,
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
    label: 'Reviewed',
    value: EmployeeLeaveStatusType.Reviewed,
  },
];

export const EmployeeLeaveStatusTypeColor = {
  [EmployeeLeaveStatusType.Pending]: 'warning',
  [EmployeeLeaveStatusType.Approved]: 'success',
  [EmployeeLeaveStatusType.Rejected]: 'error',
  [EmployeeLeaveStatusType.Reviewed]: 'info',
};
