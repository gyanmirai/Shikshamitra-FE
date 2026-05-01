import type { LabelColor } from 'src/components/label';

export enum FeeMonth {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
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
  Pending,
  Partial,
  Paid,
  Overdue,
}

export const FeeCollectionStatusOptions = [
  {
    label: 'Paid',
    value: FeeCollectionStatusType.Paid,
  },
  {
    label: 'Partial',
    value: FeeCollectionStatusType.Partial,
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

export const FeeCollectionStatusTypeColors: Record<FeeCollectionStatusType, LabelColor> = {
  [FeeCollectionStatusType.Paid]: 'success',
  [FeeCollectionStatusType.Partial]: 'warning',
  [FeeCollectionStatusType.Pending]: 'warning',
  [FeeCollectionStatusType.Overdue]: 'error',
};
