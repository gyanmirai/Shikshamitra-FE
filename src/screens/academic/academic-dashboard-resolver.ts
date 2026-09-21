import type { AcademicDashboardMode } from 'src/redux/academicAPI/academicDashboardApi';

const ADMIN_ROLES = new Set(['admin', 'administrator', 'super admin']);
const LEADERSHIP_ROLES = new Set([
  'principal',
  'vice principal',
  'hod',
  'head of department',
  'academic coordinator',
]);
const TEACHER_ROLES = new Set(['teacher', 'class teacher']);

export const normalizeAcademicDashboardRole = (role: string) =>
  role
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

export const getAcademicSessionRoles = (session: unknown): string[] => {
  if (!session || typeof session !== 'object') return [];

  const profile = 'profile' in session ? session.profile : undefined;
  if (!profile || typeof profile !== 'object') return [];

  const roleClaim =
    ('role' in profile && profile.role) ||
    ('roles' in profile && profile.roles) ||
    ('roleNames' in profile && profile.roleNames);

  if (Array.isArray(roleClaim)) {
    return roleClaim.filter((role): role is string => typeof role === 'string' && !!role.trim());
  }

  return typeof roleClaim === 'string' && roleClaim.trim() ? [roleClaim] : [];
};

export const resolveAcademicDashboardMode = (roles: string[]): AcademicDashboardMode => {
  const normalizedRoles = roles.map(normalizeAcademicDashboardRole);

  if (normalizedRoles.some((role) => ADMIN_ROLES.has(role))) return 'admin';
  if (normalizedRoles.some((role) => LEADERSHIP_ROLES.has(role))) return 'leadership';
  if (normalizedRoles.some((role) => TEACHER_ROLES.has(role))) return 'teacher';
  return 'common';
};
