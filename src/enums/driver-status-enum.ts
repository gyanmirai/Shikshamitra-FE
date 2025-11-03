export enum DriverStatusType {
  Active,
  Inactive,
}

export const DriverStatusTypeColor: Record<DriverStatusType, string> = {
  [DriverStatusType.Active]: 'success',
  [DriverStatusType.Inactive]: 'error',
};

export const DriverStatusTypeOptions = [
  { label: 'Active', value: DriverStatusType.Active },
  { label: 'Inactive', value: DriverStatusType.Inactive },
];
