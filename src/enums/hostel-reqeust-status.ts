export enum HostelRequestStatusType {
  Pending,
  Approved,
  Rejected,
}

export const HostelRequestStatusOptions = [
  {
    label: 'Pending',
    value: HostelRequestStatusType.Pending,
  },
  {
    label: 'Approved',
    value: HostelRequestStatusType.Approved,
  },
  {
    label: 'Rejected',
    value: HostelRequestStatusType.Rejected,
  },
];

export const HostelRequestStatusColors = {
  [HostelRequestStatusType.Pending]: 'warning',
  [HostelRequestStatusType.Approved]: 'success',
  [HostelRequestStatusType.Rejected]: 'error',
};
