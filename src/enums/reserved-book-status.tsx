export enum ReservedBookStatus {
  Notified,
  Waiting,
}

export const ReservedBookStatusOptions = [
  {
    label: 'Notified',
    value: ReservedBookStatus.Notified,
  },
  {
    label: 'Waiting',
    value: ReservedBookStatus.Waiting,
  },
];

export const ReservedBookStatusColors = {
  [ReservedBookStatus.Notified]: 'info',
  [ReservedBookStatus.Waiting]: 'warning',
};
