import type { GrantedPermission } from 'src/utils/permissions';
import type {
  StudentDashboardMode,
  StudentDashboardSectionKey,
  StudentModuleDashboardLink,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { hasGrantedPermission } from 'src/utils/permissions';

export function dashboardIdentityKey(profile: unknown, permissions: GrantedPermission[]) {
  const user = profile && typeof profile === 'object' ? (profile as Record<string, unknown>) : {};
  const id = typeof user.sub === 'string' ? user.sub : '';
  const tenant =
    typeof user.tenantid === 'string'
      ? user.tenantid
      : typeof user.tenantId === 'string'
        ? user.tenantId
        : '';
  const grants = permissions
    .filter((permission) => permission.isGranted)
    .map((permission) => permission.name)
    .toSorted()
    .join('|');
  return id ? `${id}:${tenant}:${grants}` : '';
}
export const permittedDashboardLinks = (
  links: StudentModuleDashboardLink[],
  permissions: GrantedPermission[]
) =>
  links.filter(
    (link) =>
      hasGrantedPermission(permissions, link.permission) &&
      hasGrantedPermission(permissions, link.visibilityPermission)
  );
export const dashboardSectionOrder = (mode: StudentDashboardMode): StudentDashboardSectionKey[] =>
  mode === 'teacher'
    ? ['attendance', 'records', 'admissions']
    : mode === 'common'
      ? ['admissions', 'attendance', 'records']
      : ['records', 'admissions', 'attendance'];
export const sectionTitles: Record<StudentDashboardSectionKey, string> = {
  records: 'Student records',
  admissions: 'Admissions & student setup',
  attendance: 'Attendance & leave',
};
export const modeLabels: Record<StudentDashboardMode, string> = {
  admin: 'School operations',
  leadership: 'Student overview',
  teacher: 'My academic scope',
  common: 'My student workspace',
};
