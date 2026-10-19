import { PERMISSIONS, type PermissionType } from './utils';
import { isFinancePermissionGroup, financePermissionActions, financeActionPermissionNames } from './finance-permission-groups';

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
const STATUTORY_SCHEME_EDIT_ACTIONS = [
  'Edit',
  'Activate',
  'ManageEnrollment',
  'ApproveOverride',
  'ConfigureCalculation',
];
export const isStatutorySchemePermission = (name: string = '') =>
  name === STATUTORY_SCHEME_ROOT || name === `${STATUTORY_SCHEME_ROOT}.View`;

type NodePermissionName = string | string[];

const STUDENT_PERMISSION_PREFIXES = ['Students.', 'ShikshaMitra.Module.Students.'];

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
  if (name.startsWith('Students.')) return name.replace(/\.(View|Add|Delete)$/, '');
  return name.replace(/\.View$/, '');
};

const isStudentPermission = (name: NodePermissionName) =>
  getPermissionNames(name).some((permissionName) =>
    STUDENT_PERMISSION_PREFIXES.some((prefix) => permissionName.startsWith(prefix))
  );

export const getPermissionActionLabel = (name: NodePermissionName, action: PermissionType) => {
  if (isStudentPermission(name) && action === 'Add') return 'Add/Update';
  return action === 'ChangeStatus' ? 'Change Status' : action;
};

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

  if (isFinancePermissionGroup(permissionBase)) {
    return financeActionPermissionNames(permissionBase, action, permissions);
  }

  if (permissionBase === 'InstituteSetup.SchoolIdentity') {
    const actions = action === 'View' ? ['View']
      : action === 'Add' ? ['ManageDefaults', 'ManageOverrides', 'AccessSignature'] : [];
    return configuredNames.filter((permissionName) => actions.some((item) => permissionName === `${permissionBase}.${item}`));
  }

  if (isStatutorySchemePermission(permissionBase)) {
    if (!['View', 'Edit', 'Delete'].includes(action)) return [];
    const actions = action === 'Edit' ? STATUTORY_SCHEME_EDIT_ACTIONS : [action];
    return configuredNames.filter((permissionName) =>
      actions.some((item) => permissionName === `${STATUTORY_SCHEME_ROOT}.${item}`)
    );
  }

  if (isStudentPermission(name)) {
    // Student operations share the server's three canonical capabilities. Do not
    // infer grants for retired or newly introduced actions from their suffix.
    if (!PERMISSIONS.includes(action)) return [];
    return configuredNames.filter(
      (permissionName) =>
        permissionName.startsWith('Students.') && getPermissionAction(permissionName) === action
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
  if (isStudentPermission(node.permissionName) && affectedNames.size === 0) return affectedNames;
  const permissionBase = getActionPermissionBase(node.permissionName);
  if (isFinancePermissionGroup(permissionBase)) {
    // Add/Delete need read access, but Delete must never imply approval authority.
    if (isGranted && (action === 'Add' || action === 'Delete')) {
      financeActionPermissionNames(permissionBase, 'View', permissions).forEach((name) => affectedNames.add(name));
    }
    if (!isGranted && action === 'View') {
      ['Add', 'Delete'].forEach((related) => financeActionPermissionNames(permissionBase, related, permissions)
        .forEach((name) => affectedNames.add(name)));
    }
    return affectedNames;
  }
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
  const base = getActionPermissionBase(name);
  if (isFinancePermissionGroup(base)) return financePermissionActions(base, permissions);
  if (getActionPermissionBase(name) === 'InstituteSetup.SchoolIdentity') return PERMISSIONS;
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
    return Array.from(
      new Set<string>(children.flatMap((child: any) => getNodeActionPermissionNames(child, permissions)))
    );
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
  const base = getActionPermissionBase(node.permissionName);
  if (isStatutorySchemePermission(base) || isFinancePermissionGroup(base)) {
    return permissions
      .filter(
        ({ name }) => name === base || name.startsWith(`${base}.`)
      )
      .map(({ name }) => name);
  }
  return getNodeActionPermissionNames(node, permissions);
};
