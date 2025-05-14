export enum HostelRequestStatusType {
  Pending,
  Approved,
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
];

export const HostelRequestStatusColors = {
  [HostelRequestStatusType.Pending]: 'warning',
  [HostelRequestStatusType.Approved]: 'success',
};
