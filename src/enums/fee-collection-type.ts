export enum FeeCollectionStatusType {
  Paid,
  Pending,
  Overdue,
}

export const FeeCollectionStatusOptions = [
  {
    label: 'Paid',
    value: FeeCollectionStatusType.Paid,
  },
  {
    label: 'Pending',
    value: FeeCollectionStatusType.Pending,
  },
  {
    label: 'Overdue',
    value: FeeCollectionStatusType.Overdue,
  },
];

export const FeeCollectionStatusTypeColors = {
  [FeeCollectionStatusType.Paid]: 'success',
  [FeeCollectionStatusType.Pending]: 'warning',
  [FeeCollectionStatusType.Overdue]: 'error',
};
