export enum ChargeStatusType {
  Paid,
  Pending,
}

export const ChargeStatusOptions = [
  {
    label: 'Pending',
    value: ChargeStatusType.Pending,
  },
  {
    label: 'Paid',
    value: ChargeStatusType.Paid,
  },
];

export const ChargeStatusTypeColors = {
  [ChargeStatusType.Pending]: 'warning',
  [ChargeStatusType.Paid]: 'success',
};
