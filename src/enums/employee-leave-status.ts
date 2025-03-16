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

export enum EmployeeLeaveStatusTypeColor {
  Pending = 'warning',
  Approved = 'success',
  Rejected = 'error',
  Reviewed = 'info',
}
