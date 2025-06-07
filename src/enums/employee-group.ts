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
    value: EmployeeGroupType.Teaching,
  },
  {
    label: 'Non Teaching',
    value: EmployeeGroupType['Non Teaching'],
  },
];
