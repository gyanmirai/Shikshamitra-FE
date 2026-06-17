export enum RegistrationStatusType {
  Pending,
  Approved,
  Rejected,
  Active,
  Inactive,
  Left,
}

export const RegistrationStatusTypeColor: Record<RegistrationStatusType, string> = {
  [RegistrationStatusType.Pending]: 'warning',
  [RegistrationStatusType.Approved]: 'info',
  [RegistrationStatusType.Rejected]: 'error',
  [RegistrationStatusType.Active]: 'success',
  [RegistrationStatusType.Inactive]: 'error',
  [RegistrationStatusType.Left]: 'default',
};

export const StudentStatusOptions = [
  { label: 'Active', value: RegistrationStatusType.Active },
  { label: 'Inactive', value: RegistrationStatusType.Inactive },
  { label: 'Left', value: RegistrationStatusType.Left },
];
