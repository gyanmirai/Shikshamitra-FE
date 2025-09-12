export enum BankStatementsStatusType {
  Cleared,
  Bounced,
}

export const BankStatementsStatusOptions = [
  {
    label: 'Bounced',
    value: BankStatementsStatusType.Bounced,
  },
  {
    label: 'Cleared',
    value: BankStatementsStatusType.Cleared,
  },
];

export const BankStatementsStatusColor = {
  [BankStatementsStatusType.Cleared]: 'success',
  [BankStatementsStatusType.Bounced]: 'warning',
};
