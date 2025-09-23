export enum BudgetStatusType {
  Pending,
  Active,
  Inactive,
  Archive,
}

export const BudgetStatusOptions = [
  {
    label: 'Pending',
    value: BudgetStatusType.Pending,
  },
  {
    label: 'Active',
    value: BudgetStatusType.Active,
  },
  {
    label: 'Inactive',
    value: BudgetStatusType.Inactive,
  },
  {
    label: 'Archive',
    value: BudgetStatusType.Archive,
  },
];

export const BudgetStatusTypeColors = {
  [BudgetStatusType.Pending]: 'warning',
  [BudgetStatusType.Active]: 'success',
  [BudgetStatusType.Inactive]: 'error',
  [BudgetStatusType.Archive]: 'default',
};
