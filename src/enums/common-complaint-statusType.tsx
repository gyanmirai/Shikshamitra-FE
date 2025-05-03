export enum CommonComplaintStatusType {
  Resolved,
  InProgress,
  Pending,
}

export const CommonComplaintStatusTypeOptions = [
  {
    label: 'Pending',
    value: CommonComplaintStatusType.Pending,
  },
  {
    label: 'InProgress',
    value: CommonComplaintStatusType.InProgress,
  },
  {
    label: 'Resolved',
    value: CommonComplaintStatusType.Resolved,
  },
];

export const CommonComplaintStatusTypeColor = {
  [CommonComplaintStatusType.Pending]: 'warning',
  [CommonComplaintStatusType.InProgress]: 'info',
  [CommonComplaintStatusType.Resolved]: 'success',
};
