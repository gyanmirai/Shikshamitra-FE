export enum EmployeeGroupType {
  Teaching,
  'Non Teaching',
}
export const EmployeeGroupTypeArray = Array.from(
  Array(Object.keys(EmployeeGroupType).length / 2).keys()
);

export const EmployeeGroupTypeFilter = [
  {
    label: 'Teaching',
    value: true,
  },
  {
    label: 'Non Teaching',
    value: false,
  },
];
