import { PERMISSIONS } from './utils';

import type { PermissionType } from './utils';
import type { PermissionGrant } from './permission-grants';

const ACCOUNT_SETTING_ROOT =
  /^Finance\.Accounts\.Settings\.(AccountHead|IncomeCategory|ExpenseCategory|BankAccount)(\.View)?$/;
export const ACCOUNT_SETTING_ACTIONS: PermissionType[] = [
  'View',
  'Add',
  'Edit',
  'ChangeStatus',
  'Delete',
];

export const isAccountSettingPermission = (name: string = '') => ACCOUNT_SETTING_ROOT.test(name);

export const getActionPermissionBase = (name: string = '') =>
  isAccountSettingPermission(name) ? name.replace(/\.View$/, '') : name;

export const getNodePermissionActions = (
  name: string,
  permissions: PermissionGrant[]
): PermissionType[] => {
  if (!isAccountSettingPermission(name)) return PERMISSIONS;
  const base = getActionPermissionBase(name);
  return ACCOUNT_SETTING_ACTIONS.filter((action) =>
    permissions.some((permission) => permission.name === `${base}.${action}`)
  );
};

export const getNodeActionPermissionNames = (
  node: any,
  permissions: PermissionGrant[]
): string[] => {
  if (node?.children?.length) {
    return node.children.flatMap((child: any) => getNodeActionPermissionNames(child, permissions));
  }
  const base = getActionPermissionBase(node.permissionName);
  return getNodePermissionActions(node.permissionName, permissions).map(
    (action) => `${base}.${action}`
  );
};
