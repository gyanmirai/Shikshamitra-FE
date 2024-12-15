export enum EmployeeStatusType {
  Active,
  Inactive,
  Left,
  Retired,
}

export enum EmployeeStatusTypeColor {
  Active = 'success',
  Inactive = 'error',
  Left = 'info',
  Retired = 'default',
}

export const EmployeeStatusTypeArray = Array.from(
  Array(Object.keys(EmployeeStatusType).length / 2).keys()
);
