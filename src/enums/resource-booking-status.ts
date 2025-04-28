export enum ResourceBookingStatusType {
  Pending,
  Approved,
  Rejected,
}

export const ResourceBookingStatusTypeOptions = [
  {
    label: 'Pending',
    value: ResourceBookingStatusType.Pending,
  },
  {
    label: 'Approved',
    value: ResourceBookingStatusType.Approved,
  },
  {
    label: 'Rejected',
    value: ResourceBookingStatusType.Rejected,
  },
];

export const ResourceBookingStatusTypeColor = {
  [ResourceBookingStatusType.Pending]: 'warning',
  [ResourceBookingStatusType.Approved]: 'success',
  [ResourceBookingStatusType.Rejected]: 'error',
};
