export enum EmployeeStatusType {
  Active,
  Inactive,
  Left,
  Retired,
}

export const EmployeeStatusTypeArray = Array.from(
  Array(Object.keys(EmployeeStatusType).length / 2).keys()
);
