export enum examScheduledStatus {
  Pending,
  Published,
  Completed,
}

export const examScheduledStatusColor = {
  [examScheduledStatus.Pending]: 'warning',
  [examScheduledStatus.Published]: 'info',
  [examScheduledStatus.Completed]: 'success',
};

export const examScheduledStatusOptions = [
  { label: 'Pending', value: examScheduledStatus.Pending },
  { label: 'Published', value: examScheduledStatus.Published },
  { label: 'Completed', value: examScheduledStatus.Completed },
];
