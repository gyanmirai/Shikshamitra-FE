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
