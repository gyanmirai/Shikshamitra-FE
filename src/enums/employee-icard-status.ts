import type { LabelColor } from 'src/components/label';

export enum EmployeeICardStatusType {
  Active,
  Inactive,
}

export const EmployeeICardStatusTypeColor: Record<EmployeeICardStatusType, LabelColor> = {
  [EmployeeICardStatusType.Active]: 'success',
  [EmployeeICardStatusType.Inactive]: 'default',
};

export const EmployeeICardStatusTypeLabel: Record<EmployeeICardStatusType, string> = {
  [EmployeeICardStatusType.Active]: 'Active',
  [EmployeeICardStatusType.Inactive]: 'Inactive',
};

export const EmployeeICardStatusTypeOptions = [
  {
    label: 'Active',
    value: EmployeeICardStatusType.Active,
  },
  {
    label: 'Inactive',
    value: EmployeeICardStatusType.Inactive,
  },
];
