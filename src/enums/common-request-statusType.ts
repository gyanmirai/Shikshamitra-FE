export enum CommonRequestStatusType {
  Approved,
  Rejected,
  Pending,
}

export const CommonRequestStatusTypeOptions = [
  {
    label: 'Approved',
    value: CommonRequestStatusType.Approved,
  },
  {
    label: 'Rejected',
    value: CommonRequestStatusType.Rejected,
  },
  {
    label: 'Pending',
    value: CommonRequestStatusType.Pending,
  },
];

export const CommonRequestStatusTypeColor = {
  [CommonRequestStatusType.Approved]: 'success',
  [CommonRequestStatusType.Rejected]: 'error',
  [CommonRequestStatusType.Pending]: 'warning',
};
