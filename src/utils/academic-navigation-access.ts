import type { NavSectionProps, NavItemBaseProps } from 'src/components/nav-section/types';

import { academicPath } from 'src/routes/paths';
import academicModule, { academicPaths, academicPermissions } from 'src/constants/academic-menu';

import { hasGrantedPermission } from './permissions';

import type { PermissionName, GrantedPermission } from './permissions';

const toViewPermission = (name: string) => name.endsWith('.View') ? name : `${name}.View`;
const viewPermission = (permission?: PermissionName): PermissionName | undefined => {
  if (Array.isArray(permission)) return permission.map(toViewPermission);
  return permission ? toViewPermission(permission) : undefined;
};

const filterItems = (
  items: NavItemBaseProps[],
  permissions: GrantedPermission[]
): NavItemBaseProps[] =>
  items.flatMap((item): NavItemBaseProps[] => {
    if (
      item.visibilityPermissionName &&
      !hasGrantedPermission(permissions, item.visibilityPermissionName)
    ) return [];

    if (item.children) {
      if (!hasGrantedPermission(permissions, item.permissionName)) return [];
      const children = filterItems(item.children, permissions);
      return children.length ? [{ ...item, children }] : [];
    }

    const permissionName = viewPermission(item.permissionName);
    return hasGrantedPermission(permissions, permissionName) ? [{ ...item, permissionName }] : [];
  });

export const filterAcademicNavigation = (
  items: NavItemBaseProps[],
  permissions: GrantedPermission[]
): NavItemBaseProps[] =>
  hasGrantedPermission(permissions, academicPermissions.root) ? filterItems(items, permissions) : [];

export const getFirstAcademicPath = (items: NavItemBaseProps[]): string | undefined =>
  items.map((item) => item.children ? getFirstAcademicPath(item.children) : item.path)
    .find((path) => Boolean(path));

export const filterAcademicMainNavigation = (
  groups: NavSectionProps['data'],
  permissions: GrantedPermission[]
): NavSectionProps['data'] =>
  groups.map((group) => ({
    ...group,
    items: group.items.flatMap((item) => {
      if (item._action !== 'academic') return [item];
      const submodule = filterAcademicNavigation(item.submodule ?? [], permissions);
      const path = getFirstAcademicPath(submodule);
      return path ? [{ ...item, path, submodule }] : [];
    }),
  }));

const routeAliases: Record<string, string> = {
  '/academic/assignTeacher': academicPaths.classTeacherAssignment,
  '/academic/teacher': academicPaths.classTeacherAssignment,
  '/academic/studentSubmissions': academicPaths.homework.assessment,
};

const hasRoute = (items: NavItemBaseProps[], pathname: string): boolean =>
  items.some((item) =>
    item.children
      ? hasRoute(item.children, pathname)
      : Boolean(item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`)))
  );

export const canAccessAcademicRoute = (
  pathname: string,
  permissions: GrantedPermission[]
): boolean => {
  if (!hasGrantedPermission(permissions, academicPermissions.root)) return false;
  const normalizedPath = pathname.replace(/\/$/, '');
  const path = routeAliases[normalizedPath] ?? normalizedPath;
  const items = academicModule()[academicPath].flatMap((group) => group.items);
  // Unlisted legacy pages retain their own route and screen guards.
  return !hasRoute(items, path) || hasRoute(filterAcademicNavigation(items, permissions), path);
};
