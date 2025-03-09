export enum FinancePendingFeeStatusType {
  'Upcoming' = 'Upcoming',
  'Overdue' = 'Overdue',
}

export const FinancePendingFeeStatusTypeOptions = [
  {
    label: 'Upcoming',
    value: FinancePendingFeeStatusType.Upcoming,
  },
  {
    label: 'Overdue',
    value: FinancePendingFeeStatusType.Overdue,
  },
];

export const FinancePendingFeeStatusTypeColors = {
  [FinancePendingFeeStatusType.Upcoming]: 'success',
  [FinancePendingFeeStatusType.Overdue]: 'error',
};
