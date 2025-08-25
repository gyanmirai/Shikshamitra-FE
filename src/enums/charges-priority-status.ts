export enum ChargesPriorityStatus {
  Low,
  Medium,
  High,
}

export const ChargesPriorityStatusOptions = [
  { label: 'Low Priority', value: ChargesPriorityStatus.Low },
  { label: 'Medium Priority', value: ChargesPriorityStatus.Medium },
  { label: 'High Priority', value: ChargesPriorityStatus.High },
];

export const ChargesPriorityStatusColors = {
  [ChargesPriorityStatus.Low]: 'info',
  [ChargesPriorityStatus.Medium]: 'warning',
  [ChargesPriorityStatus.High]: 'error',
};
