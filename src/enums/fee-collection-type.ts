import type { LabelColor } from 'src/components/label';

export enum FeeMonth {
  January = 0,
  February = 1,
  March = 2,
  April = 3,
  May = 4,
  June = 5,
  July = 6,
  August = 7,
  September = 8,
  October = 9,
  November = 10,
  December = 11,
}

export const FeeMonthOptions = [
  { label: 'January', value: FeeMonth.January },
  { label: 'February', value: FeeMonth.February },
  { label: 'March', value: FeeMonth.March },
  { label: 'April', value: FeeMonth.April },
  { label: 'May', value: FeeMonth.May },
  { label: 'June', value: FeeMonth.June },
  { label: 'July', value: FeeMonth.July },
  { label: 'August', value: FeeMonth.August },
  { label: 'September', value: FeeMonth.September },
  { label: 'October', value: FeeMonth.October },
  { label: 'November', value: FeeMonth.November },
  { label: 'December', value: FeeMonth.December },
];

export enum FeeCollectionStatusType {
  Pending = 0,
  Paid = 1,
  Overdue = 2,
  Reversed = 3,
  Partial = 4,
  InReconciliation = 5,
  Waived = 6,
}

export const FeeCollectionStatusOptions = [
  {
    label: 'Pending',
    value: FeeCollectionStatusType.Pending,
  },
  {
    label: 'Paid',
    value: FeeCollectionStatusType.Paid,
  },
  {
    label: 'Overdue',
    value: FeeCollectionStatusType.Overdue,
  },
  {
    label: 'Reversed',
    value: FeeCollectionStatusType.Reversed,
  },
  {
    label: 'Partial Pending',
    value: FeeCollectionStatusType.Partial,
  },
  {
    label: 'In Reconciliation',
    value: FeeCollectionStatusType.InReconciliation,
  },
];

export const FeeCollectionStatusTypeColors: Record<FeeCollectionStatusType, LabelColor> = {
  [FeeCollectionStatusType.Paid]: 'success',
  [FeeCollectionStatusType.Pending]: 'warning',
  [FeeCollectionStatusType.Overdue]: 'error',
  [FeeCollectionStatusType.Reversed]: 'default',
  [FeeCollectionStatusType.Partial]: 'info',
  [FeeCollectionStatusType.InReconciliation]: 'primary',
  [FeeCollectionStatusType.Waived]: 'default',
};

export const feeInstallmentStatusLabel = (status: FeeCollectionStatusType): string => {
  if (status === FeeCollectionStatusType.Partial) return 'Partial Pending';
  return FeeCollectionStatusType[status] ?? 'Pending';
};

export const chargeCollectionStatusLabel = (status: FeeCollectionStatusType): string => {
  if (status === FeeCollectionStatusType.Partial) return 'Partial Paid';
  return FeeCollectionStatusType[status] ?? 'Pending';
};
