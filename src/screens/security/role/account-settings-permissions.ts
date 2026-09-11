import { PERMISSIONS } from './utils';

import type { PermissionType } from './utils';
import type { PermissionGrant } from './permission-grants';

const ACCOUNT_SETTING_ROOT =
  /^Finance\.Accounts\.Settings\.(AccountHead|IncomeCategory|ExpenseCategory|BankAccount)(\.View)?$/;
const FINANCE_CONFIGURATION_ROOT =
  /^Finance\.(Settings\.FeeStructure|Policies\.(ConcessionPolicy|RefundPolicy|CollectionPolicy|ProrationPolicy))(\.View)?$/;
export const isFinanceConfigurationPermission = (name: string = '') =>
  FINANCE_CONFIGURATION_ROOT.test(name);
export const ACCOUNT_SETTING_ACTIONS: PermissionType[] = [
  'View',
  'Add',
  'Edit',
  'ChangeStatus',
  'Delete',
];

export const isAccountSettingPermission = (name: string = '') => ACCOUNT_SETTING_ROOT.test(name);

export const getActionPermissionBase = (name: string = '') =>
  isAccountSettingPermission(name) || isFinanceConfigurationPermission(name)
    ? name.replace(/\.View$/, '')
    : name;

export const getNodePermissionActions = (
  name: string,
  permissions: PermissionGrant[]
): PermissionType[] => {
  if (!isAccountSettingPermission(name) && !isFinanceConfigurationPermission(name))
    return PERMISSIONS;
  const base = getActionPermissionBase(name);
  const actions = isAccountSettingPermission(name) ? ACCOUNT_SETTING_ACTIONS : PERMISSIONS;
  return actions.filter((action) =>
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
