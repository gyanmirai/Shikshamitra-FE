import type { IdentityRoleOption } from 'src/redux/role/roleApi';

import * as Yup from 'yup';

import { getEmployeeOnboardingAssignable } from './employee-onboarding-role';

export type EmployeeGroupAudience = 'Teaching' | 'NonTeaching' | 'Both';
export type RoleRecord = IdentityRoleOption & {
  color?: string;
  RoleAudience?: string | null;
  EmployeeGroupAudience?: EmployeeGroupAudience | null;
};
export type RoleDialogState = {
  type: 'form' | 'delete' | 'permissions' | 'visibility';
  role: RoleRecord | null;
};
export type RoleFormValues = {
  role: string;
  color: string;
  employeeGroupAudience: EmployeeGroupAudience;
  employeeOnboardingAssignable: boolean;
};

export const employeeGroupOptions = [
  { label: 'Teaching only', value: 'Teaching' },
  { label: 'Non Teaching only', value: 'NonTeaching' },
  { label: 'Both groups', value: 'Both' },
];

export const getRoleAudience = (role: RoleRecord | null): string =>
  role?.roleAudience ??
  role?.RoleAudience ??
  String(role?.extraProperties?.roleAudience ?? role?.extraProperties?.RoleAudience ?? 'Employee');

export const getRoleColor = (role: RoleRecord): string =>
  String(role.extraProperties?.color || role.extraProperties?.Color || role.color || '');

export const getRoleInitialValues = (role: RoleRecord | null): RoleFormValues => ({
  role: role?.name ?? '',
  color: role ? getRoleColor(role) : '',
  employeeGroupAudience: (role?.employeeGroupAudience ??
    role?.EmployeeGroupAudience ??
    role?.extraProperties?.employeeGroupAudience ??
    role?.extraProperties?.EmployeeGroupAudience ??
    'Both') as EmployeeGroupAudience,
  employeeOnboardingAssignable: getEmployeeOnboardingAssignable(role),
});

export const roleFormSchema = Yup.object({
  role: Yup.string().required('Role is required'),
  color: Yup.string().required('Color is required'),
  employeeGroupAudience: Yup.string()
    .oneOf(['Teaching', 'NonTeaching', 'Both'])
    .required('Employee group availability is required'),
});
