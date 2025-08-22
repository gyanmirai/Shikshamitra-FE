export enum BankStatementsStatusType {
  Processed,
  Processing,
}

export const BankStatementsStatusOptions = [
  {
    label: 'processed',
    value: BankStatementsStatusType.Processed,
  },
  {
    label: 'processing',
    value: BankStatementsStatusType.Processing,
  },
];

export const BankStatementsStatusColor = {
  [BankStatementsStatusType.Processed]: 'success',
  [BankStatementsStatusType.Processing]: 'info',
};
