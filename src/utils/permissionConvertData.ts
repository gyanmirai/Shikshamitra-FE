// @ts-nocheck
export function organizePermissions(data) {
  // Create a map to store permissions by their name for quick access
  const permissionsMap = new Map();

  // Initialize the organized structure with top-level sections
  const organizedData = data.map((section) => ({
    ...section,
    permissions: [],
  }));

  // First pass: add permissions to the map
  data.forEach((section) => {
    section.permissions.forEach((permission) => {
      permissionsMap.set(permission.name, {
        ...permission,
        children: [],
      });
    });
  });

  // Second pass: establish parent-child relationships
  data.forEach((section) => {
    section.permissions.forEach((permission) => {
      if (permission.parentName) {
        const parent = permissionsMap.get(permission.parentName);
        if (parent) {
          parent.children.push(permissionsMap.get(permission.name));
        }
      } else {
        // Add top-level permissions to their respective sections
        const sectionItem = organizedData.find((sec) => sec.name === section.name);
        if (sectionItem) {
          sectionItem.permissions.push(permissionsMap.get(permission.name));
        }
      }
    });
  });

  // Remove permissions from map to clean up any orphaned entries
  permissionsMap.forEach((perm, key) => {
    if (perm.parentName) {
      permissionsMap.delete(key);
    }
  });

  // Remove any permissions that do not have a parent (they should be already included)
  organizedData.forEach((section) => {
    section.permissions = section.permissions.filter(
      (p) => !p.parentName || permissionsMap.has(p.name)
    );
  });

  return organizedData.map((section) => ({ ...section, children: section.permissions }));
}
