import { buildVisibilityPanels } from './permission-catalogue';
import {
  getNodeActionPermissionNames,
  getNodeRevocationPermissionNames,
} from './account-settings-permissions';

import type { PermissionGrant } from './permission-grants';
import type { NavigationPermission } from './permission-catalogue';

export function visibilityBulkNames(
  nodes: NavigationPermission[],
  grants: Pick<PermissionGrant, 'name'>[],
  manageable: Set<string>
) {
  const available = new Set(grants.map(({ name }) => name));
  return buildVisibilityPanels(nodes).flatMap((panel) =>
    [panel.permissionName, ...panel.submodule.map((item) => item.permissionName)].filter(
      (name) => available.has(name) && manageable.has(name)
    )
  );
}

export function permissionBulkNames(
  nodes: NavigationPermission[],
  grants: PermissionGrant[],
  manageable: Set<string>
) {
  const collect = (node: NavigationPermission, revoke: boolean): string[] => {
    const children = node.submodule ?? node.permissionChildren ?? node.children ?? [];
    if (children.length) return children.flatMap((child) => collect(child, revoke));
    return revoke
      ? getNodeRevocationPermissionNames(node, grants)
      : getNodeActionPermissionNames(node, grants);
  };
  const names = (revoke: boolean) =>
    [...new Set(nodes.flatMap((node) => collect(node, revoke)))].filter((name) =>
      manageable.has(name)
    );
  return { grant: names(false), revoke: names(true) };
}
