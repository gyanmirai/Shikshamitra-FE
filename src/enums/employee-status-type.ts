export enum EmployeeStatusType {
  Active,
  Inactive,
  Left,
  Retired,
}

export const EmployeeStatusTypeOptions = [
  {
    label: 'Active',
    value: EmployeeStatusType.Active,
  },
  {
    label: 'Inactive',
    value: EmployeeStatusType.Inactive,
  },
  {
    label: 'Left',
    value: EmployeeStatusType.Left,
  },
  {
    label: 'Retired',
    value: EmployeeStatusType.Retired,
  },
];

export const EmployeeStatusTypeColor = {
  [EmployeeStatusType.Active]: 'success',
  [EmployeeStatusType.Inactive]: 'error',
  [EmployeeStatusType.Left]: 'info',
  [EmployeeStatusType.Retired]: 'default',
};

export const EmployeeStatusTypeArray = Array.from(
  Array(Object.keys(EmployeeStatusType).length / 2).keys()
);

export const EmployeeStatusTypeInformation = {
  [EmployeeStatusType.Active]:
    'The employee is currently working and fully engaged in their assigned duties.',
  [EmployeeStatusType.Inactive]:
    'The employee is temporarily not working due to reasons like suspension or sabbatical, but is still part of the institution.',
  [EmployeeStatusType.Left]:
    'The employee has officially exited the institution and is no longer associated with school operations.',
  [EmployeeStatusType.Retired]:
    'The employee has retired after fulfilling the required service period with the institution',
};
