import { getActionPermissionBase } from './account-settings-permissions';
import { canManageGrant, catalogueEntries, inheritedSources } from './permission-catalogue';

import type { PermissionStates } from './permission-draft-state';
import type {
  GrantProvider,
  PermissionCatalogue,
  NavigationPermission,
} from './permission-catalogue';

export type VisibilityPrerequisites = Record<string, string[][]>;
export const visibilityPrerequisiteWarning =
  "Enable Visibility access for this feature in 'Set Visibility' before allowing module permissions.";

export function buildVisibilityPrerequisites(
  navigation: NavigationPermission[]
): VisibilityPrerequisites {
  const index: VisibilityPrerequisites = {};
  const visit = (node: NavigationPermission, ancestors: string[]) => {
    const name =
      node.visibilityPermissionName ??
      (typeof node.permissionName === 'string' ? node.permissionName : undefined);
    const flag =
      name && name.startsWith('ShikshaMitra.Module.') && !name.endsWith('.View') ? name : undefined;
    const path = [...new Set([...ancestors, ...(flag ? [flag] : [])])];
    const children = node.submodule ?? node.permissionChildren ?? node.children ?? [];
    if (children.length) children.forEach((child) => visit(child, path));
    else {
      const configured = Array.isArray(node.permissionName)
        ? node.permissionName
        : [node.permissionName];
      configured
        .filter((value): value is string => !!value)
        .forEach((value) => {
          const prefix = Array.isArray(node.permissionName)
            ? value.slice(0, value.lastIndexOf('.'))
            : getActionPermissionBase(value);
          if (!prefix || !path.length) return;
          const paths = index[prefix] ?? [];
          if (!paths.some((existing) => JSON.stringify(existing) === JSON.stringify(path)))
            paths.push(path);
          index[prefix] = paths;
        });
    }
  };
  navigation.forEach((node) => visit(node, []));
  return index;
}

export function missingVisibility(
  names: string[],
  index: VisibilityPrerequisites,
  catalogue: PermissionCatalogue,
  provider: GrantProvider,
  states: PermissionStates
): string[] {
  const entries = new Map(catalogueEntries(catalogue).map((entry) => [entry.name, entry]));
  const visible = (name: string) =>
    !!entries.get(name) &&
    (states[name] === 'allow' ||
      (states[name] !== 'deny' && inheritedSources(entries.get(name)!, provider).length > 0));
  const unavailable = (flags: string[]) =>
    flags.some((name) => !entries.get(name) || !canManageGrant(entries.get(name)!, provider));
  return [
    ...new Set(
      names.flatMap((name) => {
        const prefix = Object.keys(index)
          .filter((key) => name === key || name.startsWith(`${key}.`))
          .sort((left, right) => right.length - left.length)[0];
        if (!prefix) return [];
        return (
          index[prefix]
            .map((path) => path.filter((flag) => !visible(flag)))
            .sort(
              (left, right) =>
                Number(unavailable(left)) - Number(unavailable(right)) || left.length - right.length
            )[0] ?? []
        );
      })
    ),
  ];
}
