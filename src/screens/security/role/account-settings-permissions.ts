import { PERMISSIONS, type PermissionType } from './utils';

import type { PermissionGrant } from './permission-grants';

const ACCOUNT_SETTING_ROOT =
  /^Finance\.Accounts\.Settings\.(AccountHead|IncomeCategory|ExpenseCategory|BankAccount|PostingSetup)(\.View)?$/;
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

const STATUTORY_SCHEME_ROOT = 'HR.PayrollManagement.Settings.StatutorySchemes';
const STATUTORY_SCHEME_EDIT_ACTIONS = ['Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride'];
export const isStatutorySchemePermission = (name: string = '') =>
  name === STATUTORY_SCHEME_ROOT || name === `${STATUTORY_SCHEME_ROOT}.View`;

type NodePermissionName = string | string[];

const STUDENT_PERMISSION_PREFIXES = ['Students.', 'ShikshaMitra.Module.Students.'];
const STUDENT_VIEW_ACTIONS = new Set(['View', 'ViewUsage', 'Download']);
const STUDENT_DELETE_ACTIONS = new Set([
  'Delete',
  'Archive',
  'Cancel',
  'Close',
  'Deactivate',
  'Release',
  'Reverse',
  'Withdraw',
]);

const getPermissionNames = (name: NodePermissionName = '') =>
  (Array.isArray(name) ? name : [name]).filter(Boolean);

const getParentPermissionName = (name: string) => name.slice(0, name.lastIndexOf('.'));

const getCommonPermissionBase = (names: string[]) => {
  if (names.length === 0) return '';

  const segments = names.map((name) => getParentPermissionName(name).split('.'));
  return segments[0]
    .filter((segment, index) => segments.every((parts) => parts[index] === segment))
    .join('.');
};

export const getActionPermissionBase = (name: NodePermissionName = '') => {
  if (Array.isArray(name)) return getCommonPermissionBase(getPermissionNames(name));
  return name.replace(/\.View$/, '');
};

const isStudentPermission = (name: NodePermissionName) =>
  getPermissionNames(name).some((permissionName) =>
    STUDENT_PERMISSION_PREFIXES.some((prefix) => permissionName.startsWith(prefix))
  );

const getConfiguredPermissionNames = (name: NodePermissionName, permissions: PermissionGrant[]) => {
  const names = getPermissionNames(name);
  if (Array.isArray(name)) {
    return names.filter((permissionName) =>
      permissions.some((permission) => permission.name === permissionName)
    );
  }

  const base = getActionPermissionBase(name);
  const prefix = `${base}.`;
  const childPermissions = permissions
    .map((permission) => permission.name)
    .filter(
      (permissionName) =>
        permissionName.startsWith(prefix) && !permissionName.slice(prefix.length).includes('.')
    );

  if (childPermissions.length > 0) return childPermissions;
  return permissions.some((permission) => permission.name === name) ? [name] : [];
};

const getPermissionAction = (permissionName: string) =>
  permissionName.slice(permissionName.lastIndexOf('.') + 1);

export const getNodeActionPermissionNamesForAction = (
  name: NodePermissionName,
  action: PermissionType,
  permissions: PermissionGrant[]
): string[] => {
  const configuredNames = getConfiguredPermissionNames(name, permissions);
  const permissionBase = getActionPermissionBase(name);

  if (isStatutorySchemePermission(permissionBase)) {
    if (!['View', 'Edit', 'Delete'].includes(action)) return [];
    const actions = action === 'Edit' ? STATUTORY_SCHEME_EDIT_ACTIONS : [action];
    return configuredNames.filter((permissionName) =>
      actions.some((item) => permissionName === `${STATUTORY_SCHEME_ROOT}.${item}`)
    );
  }

  if (isStudentPermission(name)) {
    return configuredNames.filter((permissionName) => {
      if (permissionName.startsWith('ShikshaMitra.Module.Students.')) return action === 'View';

      const configuredAction = getPermissionAction(permissionName);
      if (action === 'View') return STUDENT_VIEW_ACTIONS.has(configuredAction);
      if (action === 'Delete') return STUDENT_DELETE_ACTIONS.has(configuredAction);
      return (
        !STUDENT_VIEW_ACTIONS.has(configuredAction) && !STUDENT_DELETE_ACTIONS.has(configuredAction)
      );
    });
  }

  if (permissionBase === 'Finance.Fees.StructureAssign' && action === 'Add') {
    return configuredNames.filter((permissionName) =>
      ['Add', 'OverridePolicies'].some((suffix) => permissionName === `${permissionBase}.${suffix}`)
    );
  }

  const permissionName = `${permissionBase}.${action}`;
  return configuredNames.includes(permissionName) ? [permissionName] : [];
};

export const getAffectedNodePermissionNames = (
  node: any,
  action: PermissionType,
  isGranted: boolean,
  permissions: PermissionGrant[]
) => {
  const affectedNames = new Set(
    getNodeActionPermissionNamesForAction(node.permissionName, action, permissions)
  );
  const permissionBase = getActionPermissionBase(node.permissionName);
  if (isAccountSettingPermission(permissionBase) || isStatutorySchemePermission(permissionBase))
    return affectedNames;

  if (isGranted && (action === 'Add' || action === 'Delete')) {
    getNodeActionPermissionNamesForAction(node.permissionName, 'View', permissions).forEach(
      (name) => affectedNames.add(name)
    );
  }
  if (isGranted && action === 'Delete' && !isFinanceConfigurationPermission(permissionBase)) {
    getNodeActionPermissionNamesForAction(node.permissionName, 'Add', permissions).forEach((name) =>
      affectedNames.add(name)
    );
  }
  if (!isGranted && action === 'View') {
    getNodeActionPermissionNamesForAction(node.permissionName, 'Add', permissions).forEach((name) =>
      affectedNames.add(name)
    );
    getNodeActionPermissionNamesForAction(node.permissionName, 'Delete', permissions).forEach(
      (name) => affectedNames.add(name)
    );
  }
  return affectedNames;
};

export const getNodePermissionActions = (
  name: NodePermissionName,
  permissions: PermissionGrant[]
): PermissionType[] => {
  if (isStatutorySchemePermission(getActionPermissionBase(name))) return ['View', 'Edit', 'Delete'];
  if (isStudentPermission(name)) return PERMISSIONS;

  const actions = isAccountSettingPermission(getActionPermissionBase(name))
    ? ACCOUNT_SETTING_ACTIONS
    : Array.from(
        new Set(
          getConfiguredPermissionNames(name, permissions).map((permissionName) =>
            getPermissionAction(permissionName)
          )
        )
      );
  return actions.filter(
    (action) => getNodeActionPermissionNamesForAction(name, action, permissions).length > 0
  );
};

export const getNodeActionPermissionNames = (
  node: any,
  permissions: PermissionGrant[]
): string[] => {
  const children = node?.permissionChildren ?? node?.children ?? [];
  if (children.length) {
    return children.flatMap((child: any) => getNodeActionPermissionNames(child, permissions));
  }
  return Array.from(
    new Set(
      getNodePermissionActions(node.permissionName, permissions).flatMap((action) =>
        getNodeActionPermissionNamesForAction(node.permissionName, action, permissions)
      )
    )
  );
};

// Revocation covers the complete feature, including actions absent from the grouped controls.
// Granting still uses only the explicitly mapped actions above.
export const getNodeRevocationPermissionNames = (
  node: any,
  permissions: PermissionGrant[]
): string[] => {
  const children = node?.permissionChildren ?? node?.children ?? [];
  if (children.length) {
    return Array.from(
      new Set(
        children.flatMap((child: any) => getNodeRevocationPermissionNames(child, permissions))
      )
    );
  }
  if (isStatutorySchemePermission(getActionPermissionBase(node.permissionName))) {
    return permissions
      .filter(
        ({ name }) => name === STATUTORY_SCHEME_ROOT || name.startsWith(`${STATUTORY_SCHEME_ROOT}.`)
      )
      .map(({ name }) => name);
  }
  return getNodeActionPermissionNames(node, permissions);
};
