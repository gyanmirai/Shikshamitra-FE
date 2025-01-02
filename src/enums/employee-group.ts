export enum EmployeeGroupType {
  Teaching,
  NonTeaching,
}
export const EmployeeGroupTypeArray = Array.from(
  Array(Object.keys(EmployeeGroupType).length / 2).keys()
);
