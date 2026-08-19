export enum examScheduledStatus {
  Pending,
  Published,
  Completed,
  /** Computed schedule view state; never persisted through the exam status API. */
  Ongoing,
}

export const examScheduledStatusColor = {
  [examScheduledStatus.Pending]: 'warning',
  [examScheduledStatus.Published]: 'info',
  [examScheduledStatus.Completed]: 'success',
  [examScheduledStatus.Ongoing]: 'primary',
};

export const examScheduledStatusOptions = [
  { label: 'Pending', value: examScheduledStatus.Pending },
  { label: 'Published', value: examScheduledStatus.Published },
  { label: 'Completed', value: examScheduledStatus.Completed },
];
