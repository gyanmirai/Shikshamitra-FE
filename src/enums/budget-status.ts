export enum BudgetStatusType {
  Active,
  Draft,
}

export const BudgetStatusOptions = [
  {
    label: 'Active',
    value: BudgetStatusType.Active,
  },
  {
    label: 'Draft',
    value: BudgetStatusType.Draft,
  },
];

export const BudgetStatusTypeColors = {
  [BudgetStatusType.Active]: 'success',
  [BudgetStatusType.Draft]: 'warning',
};
