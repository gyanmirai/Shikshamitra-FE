export type PermissionGrant = { name: string; isGranted: boolean };

export type PermissionType = string;

export const PERMISSIONS: PermissionType[] = ['View', 'Add', 'Delete'];

const PERMISSION_ACTION_ORDER = [
  'View',
  'Add',
  'Edit',
  'Publish',
  'SetDefault',
  'Archive',
  'Delete',
];

const permissionActionOrder = (action: string) => {
  const index = PERMISSION_ACTION_ORDER.indexOf(action);
  return index === -1 ? PERMISSION_ACTION_ORDER.length : index;
};

export const sortPermissionActions = (actions: PermissionType[]) =>
  [...actions].sort(
    (left, right) =>
      permissionActionOrder(left) - permissionActionOrder(right) || left.localeCompare(right)
  );

export const getPermissionActions = (
  permissions: PermissionGrant[],
  permissionName: string
): PermissionType[] => {
  const prefix = `${permissionName}.`;
  const actions = permissions
    .map((permission) => permission.name)
    .filter((name) => name.startsWith(prefix))
    .map((name) => name.slice(prefix.length))
    .filter((action) => action.length > 0 && !action.includes('.'))
    .filter((action, index, permissionActions) => permissionActions.indexOf(action) === index);

  return sortPermissionActions(actions);
};

export const formatPermissionAction = (action: PermissionType) =>
  action.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

export const setPermissionAction = (
  permissions: PermissionGrant[],
  permissionName: string,
  action: PermissionType,
  isGranted: boolean
): PermissionGrant[] => {
  const actionName = `${permissionName}.${action}`;
  const availableActions = getPermissionActions(permissions, permissionName);

  return permissions.map((permission) => {
    if (permission.name === actionName) {
      return { ...permission, isGranted };
    }

    if (isGranted && action !== 'View' && permission.name === `${permissionName}.View`) {
      return { ...permission, isGranted: true };
    }

    if (
      isGranted &&
      action === 'Delete' &&
      availableActions.includes('Add') &&
      permission.name === `${permissionName}.Add`
    ) {
      return { ...permission, isGranted: true };
    }

    if (
      !isGranted &&
      action === 'View' &&
      availableActions.some(
        (availableAction) => permission.name === `${permissionName}.${availableAction}`
      )
    ) {
      return { ...permission, isGranted: false };
    }

    return permission;
  });
};

export const setAllPermissionActions = (
  permissions: PermissionGrant[],
  permissionNames: string[],
  isGranted: boolean
): PermissionGrant[] => {
  const actionNames = new Set(
    permissionNames.flatMap((permissionName) =>
      getPermissionActions(permissions, permissionName).map(
        (action) => `${permissionName}.${action}`
      )
    )
  );

  return permissions.map((permission) =>
    actionNames.has(permission.name) ? { ...permission, isGranted } : permission
  );
};

export interface PermissionState {
  [permission: string]: boolean;
  View: boolean;
  Add: boolean;
  Delete: boolean;
}

export type PermissionsMap = Record<string, PermissionState>;

// Helper to get a unique key for a node
export const getNodeKey = (moduleTitle: string, submoduleTitle: string, nodeTitle: string) =>
  `${moduleTitle}_${submoduleTitle}_${nodeTitle}`;

// Recursively get all descendant keys
export const getAllDescendantKeys = (
  node: any,
  moduleTitle: string,
  submoduleTitle: string
): string[] => {
  let keys: string[] = [];
  const currentKey = getNodeKey(moduleTitle, submoduleTitle, node.title);
  keys.push(currentKey);

  if (node.children) {
    node.children.forEach((child: any) => {
      keys = [...keys, ...getAllDescendantKeys(child, moduleTitle, submoduleTitle)];
    });
  }
  return keys;
};

// Update permissions for a node and all its children
export const updateNodeAndChildren = (
  permissions: PermissionsMap,
  node: any,
  moduleTitle: string,
  submoduleTitle: string,
  type: PermissionType | 'All',
  value: boolean
): PermissionsMap => {
  const newPermissions = { ...permissions };
  const keysToUpdate = getAllDescendantKeys(node, moduleTitle, submoduleTitle);

  keysToUpdate.forEach((key) => {
    const currentPerms = newPermissions[key] || { View: false, 'Add/Edit': false, Delete: false };

    if (type === 'All') {
      newPermissions[key] = { View: value, Add: value, Delete: value };
    } else {
      newPermissions[key] = { ...currentPerms, [type]: value };
      // Auto-enable View if Add/Edit is enabled
      if (type === 'Add' && value) {
        newPermissions[key].View = true;
      }
    }
  });

  return newPermissions;
};

// Calculate security score
export const calculateSecurityScore = (permissions: PermissionsMap) => {
  const totalKeys = Object.keys(permissions).length;
  if (totalKeys === 0) return 0;

  const totalPossiblePerms = totalKeys * 3; // 3 permissions per node
  const activePerms = Object.values(permissions).reduce(
    (acc, curr) => acc + (curr.View ? 1 : 0) + (curr.Add ? 1 : 0) + (curr.Delete ? 1 : 0),
    0
  );

  return Math.round((activePerms / totalPossiblePerms) * 100);
};

export const getAllChildrenData = (node: any, list: any = []) => {
  node?.children?.forEach((child: any) => {
    if (child?.children?.length > 0) {
      list = [...list];
    } else {
      list.push(child);
    }
    getAllChildrenData(child, list);
  });
  return list;
};
