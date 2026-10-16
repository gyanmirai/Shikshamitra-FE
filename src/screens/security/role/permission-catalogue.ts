import type { ReactNode } from 'react';

export type GrantProvider = { providerName: string; providerKey: string };
export type CataloguePermission = {
  name: string;
  displayName: string;
  parentName?: string | null;
  isGranted: boolean;
  allowedProviders: string[];
  grantedProviders: GrantProvider[];
};
export type PermissionCatalogue = {
  groups: { name: string; displayName: string; permissions: CataloguePermission[] }[];
  overrides?: Record<string, PermissionOverrideState>;
};
export type PermissionOverrideState = 'inherit' | 'allow' | 'deny';
export type PermissionBranch = (
  | { permission: CataloguePermission; group?: never }
  | { permission?: never; group: { name: string; title: string } }
) & { children: PermissionBranch[] };
export const branchKey = (node: PermissionBranch) =>
  node.permission ? node.permission.name : node.group.name;
export const permissionLabel = (entry: CataloguePermission, context?: string) => {
  if (!entry.displayName.startsWith('Permission:')) return entry.displayName;
  let {name} = entry;
  if (name === context) name = name.split('.').at(-1)!;
  else if (context && name.startsWith(`${context  }.`)) name = name.slice(context.length + 1);
  return name.split('.').map((part) => part.replace(/([a-z])([A-Z])/g, '$1 $2')).join(' / ');
};
export const branchLabel = (node: PermissionBranch) =>
  node.permission ? permissionLabel(node.permission) : node.group.title;
export type PermissionPanel = {
  name: string;
  title: string;
  icon?: ReactNode;
  visibilityName?: string;
  submodule: { name: string; title: string; visibilityName?: string; roots: PermissionBranch[] }[];
};
export type NavigationPermission = {
  title: string;
  icon?: ReactNode;
  permissionName?: string | string[];
  visibilityPermissionName?: string;
  submodule?: NavigationPermission[];
  children?: NavigationPermission[];
  permissionChildren?: NavigationPermission[];
};
export const isVisibilityPermission = (name: string) => name.startsWith('ShikshaMitra.Module.');
export type VisibilityPanel = {
  title: string;
  permissionName: string;
  icon?: ReactNode;
  submodule: { title: string; permissionName: string }[];
};

export const catalogueEntries = (catalogue: PermissionCatalogue) => [
  ...new Map(
    catalogue.groups.flatMap((group) => group.permissions).map((entry) => [entry.name, entry])
  ).values(),
];

const sameProvider = (source: GrantProvider, provider: GrantProvider) =>
  source.providerName === provider.providerName && source.providerKey === provider.providerKey;

export const hasDirectGrant = (entry: CataloguePermission, provider: GrantProvider) =>
  entry.grantedProviders.some((source) => sameProvider(source, provider));

export const inheritedSources = (entry: CataloguePermission, provider: GrantProvider) =>
  entry.grantedProviders.filter((source) => !sameProvider(source, provider));

export const canManageGrant = (entry: CataloguePermission, provider: GrantProvider) =>
  entry.allowedProviders.length === 0 || entry.allowedProviders.includes(provider.providerName);

export const branchPermissions = (roots: PermissionBranch[]): CataloguePermission[] =>
  roots.flatMap((node) => [
    ...(node.permission ? [node.permission] : []),
    ...branchPermissions(node.children),
  ]);

const navigationChildren = (item: NavigationPermission) =>
  item.submodule ?? item.permissionChildren ?? item.children ?? [];

export const visibilityName = (item: NavigationPermission) =>
  item.visibilityPermissionName ??
  (typeof item.permissionName === 'string' ? item.permissionName : undefined);

/** Navigation supplies familiar organization only. It never limits the server catalogue. */
export function buildPermissionPanels(
  catalogue: PermissionCatalogue,
  navigation: NavigationPermission[]
): PermissionPanel[] {
  const entries = catalogueEntries(catalogue);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const children = new Map<string, CataloguePermission[]>();
  entries.forEach((entry) => {
    if (entry.parentName)
      children.set(entry.parentName, [...(children.get(entry.parentName) ?? []), entry]);
  });
  // Known module/submodule visibility is edited in the separate existing dialog.
  const visibility = new Set(
    entries.filter((entry) => isVisibilityPermission(entry.name)).map((entry) => entry.name)
  );
  const assigned = new Set<string>(visibility);
  const build = (
    entry: CataloguePermission,
    ancestors = new Set<string>()
  ): PermissionBranch | undefined => {
    if (assigned.has(entry.name) || ancestors.has(entry.name)) return undefined;
    assigned.add(entry.name);
    const next = new Set(ancestors).add(entry.name);
    return {
      permission: entry,
      children: (children.get(entry.name) ?? [])
        .map((child) => build(child, next))
        .filter((node): node is PermissionBranch => !!node),
    };
  };
  const featureNames = (item: NavigationPermission): string[] => {
    const names = Array.isArray(item.permissionName) ? item.permissionName : [item.permissionName];
    return [
      ...names.flatMap((name) => {
        if (!name || visibility.has(name)) return [];
        const entry = byName.get(name);
        // Some catalogues attach every feature action directly to a module (HR).
        // Use the route's namespace for organization, never its broad module parent.
        // No action suffix list is assumed; server membership still controls all entries.
        const prefix =
          entry && !children.has(name) && name.includes('.')
            ? name.slice(0, name.lastIndexOf('.'))
            : name;
        return entries
          .filter(
            (candidate) => candidate.name === prefix || candidate.name.startsWith(`${prefix}.`)
          )
          .map((candidate) => candidate.name);
      }),
    ];
  };
  const rootsFor = (names: string[]) => {
    const candidates = new Set(names);
    const roots = [...candidates].filter((name) => {
      const visited = new Set<string>([name]);
      let parent = byName.get(name)?.parentName;
      while (parent && !visited.has(parent)) {
        if (candidates.has(parent)) return false;
        visited.add(parent);
        parent = byName.get(parent)?.parentName;
      }
      return true;
    });
    return roots
      .map((name) => byName.get(name))
      .filter((entry): entry is CataloguePermission => !!entry)
      .map((entry) => build(entry))
      .filter((node): node is PermissionBranch => !!node);
  };
  const featuresFor = (item: NavigationPermission, key: string): PermissionBranch[] => {
    const nested = navigationChildren(item);
    if (nested.length)
      return nested.flatMap((child, index) => featuresFor(child, `${key}-${index}`));
    const roots = rootsFor(featureNames(item));
    if (!roots.length) return [];
    if (roots.length === 1) return roots;
    // Presentation-only grouping never invents a permission or changes parentName.
    return [{ group: { name: `ui-feature:${key}`, title: item.title }, children: roots }];
  };
  const panels: PermissionPanel[] = navigation.map((module, index) => ({
    name: `navigation-${index}`,
    title: module.title,
    icon: module.icon,
    visibilityName: visibilityName(module),
    submodule: (module.submodule?.length ? module.submodule : [module]).map(
      (submodule, subIndex) => ({
        name: `navigation-${index}-${subIndex}`,
        title: submodule.title,
        visibilityName: visibilityName(submodule),
        roots: featuresFor(submodule, `${index}-${subIndex}`),
      })
    ),
  }));
  // Unmapped modules, future actions, and disconnected catalogue entries remain reachable.
  catalogue.groups.forEach((group) => {
    const remaining = group.permissions.filter((entry) => !assigned.has(entry.name));
    const roots = rootsFor(remaining.map((entry) => entry.name));
    // Fail safe for malformed cyclic parents: expose each remaining entry once, never hide it.
    remaining
      .filter((entry) => !assigned.has(entry.name))
      .forEach((entry) => {
        const node = build(entry);
        if (node) roots.push(node);
      });
    if (roots.length)
      panels.push({
        name: group.name,
        title: group.displayName && !group.displayName.startsWith('Permission:') ? group.displayName : `${group.name} - other permissions`,
        submodule: [{ name: `${group.name}-catalogue`, title: 'Other permissions', roots }],
      });
  });
  return panels;
}

export function buildVisibilityPanels(
  navigation: NavigationPermission[]
): VisibilityPanel[] {
  const assigned = new Set<string>();
  return navigation.map((module): VisibilityPanel => {
    const root = visibilityName(module) ?? '';
    const permissionName = isVisibilityPermission(root) && !assigned.has(root) ? root : '';
    if (permissionName) assigned.add(permissionName);
    const submodule: VisibilityPanel['submodule'] = [];
    const visit = (item: NavigationPermission, prefix: string) => {
      const title = prefix ? `${prefix} / ${item.title}` : item.title;
      const name = visibilityName(item);
      if (name && isVisibilityPermission(name) && !assigned.has(name)) {
        assigned.add(name);
        submodule.push({ title, permissionName: name });
      }
      navigationChildren(item).forEach((child) => visit(child, title));
    };
    navigationChildren(module).forEach((child) => visit(child, ''));
    return {
      title: module.title,
      permissionName,
      icon: module.icon,
      submodule,
    };
  });
}

export function filterPermissionBranches(
  roots: PermissionBranch[],
  search: string
): PermissionBranch[] {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return roots;
  return roots.flatMap((node) => {
    if (
      `${branchKey(node)} ${branchLabel(node)} ${node.permission?.displayName ?? ''}`
        .toLocaleLowerCase()
        .includes(query)
    )
      return [node];
    const children = filterPermissionBranches(node.children, query);
    return children.length ? [{ ...node, children }] : [];
  });
}
