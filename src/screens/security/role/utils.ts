export type PermissionType = 'View' | 'Add/Edit' | 'Delete';

export const PERMISSIONS: PermissionType[] = ['View', 'Add/Edit', 'Delete'];

export interface PermissionState {
  View: boolean;
  'Add/Edit': boolean;
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
      newPermissions[key] = { View: value, 'Add/Edit': value, Delete: value };
    } else {
      newPermissions[key] = { ...currentPerms, [type]: value };
      // Auto-enable View if Add/Edit is enabled
      if (type === 'Add/Edit' && value) {
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
    (acc, curr) => acc + (curr.View ? 1 : 0) + (curr['Add/Edit'] ? 1 : 0) + (curr.Delete ? 1 : 0),
    0
  );

  return Math.round((activePerms / totalPossiblePerms) * 100);
};
