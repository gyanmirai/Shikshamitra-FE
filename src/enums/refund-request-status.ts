export enum RequestStatusType {
  'Approved' = 'Approved',
  'Pending' = 'Pending',
  'Rejected' = 'Rejected',
}

export const RequestStatusTypeOptions = [
  {
    label: 'Approved',
    value: RequestStatusType.Approved,
  },
  {
    label: 'Pending',
    value: RequestStatusType.Pending,
  },
  {
    label: 'Rejected',
    value: RequestStatusType.Rejected,
  },
];

export const RequestStatusTypeColors = {
  [RequestStatusType.Approved]: 'success',
  [RequestStatusType.Rejected]: 'error',
  [RequestStatusType.Pending]: 'warning',
};
