export enum EmployeeLeaveStatusType {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Reviewed = 3,
  Cancelled = 4,
  Viewed = Reviewed,
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
  {
    label: 'Cancelled',
    value: EmployeeLeaveStatusType.Cancelled,
  },
];

export const EmployeeLeaveStatusTypeColor = {
  [EmployeeLeaveStatusType.Pending]: 'warning',
  [EmployeeLeaveStatusType.Approved]: 'success',
  [EmployeeLeaveStatusType.Rejected]: 'error',
  [EmployeeLeaveStatusType.Reviewed]: 'info',
  [EmployeeLeaveStatusType.Cancelled]: 'default',
};
