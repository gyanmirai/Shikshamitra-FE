import {
  getSessionRoles,
  normalizeDashboardRole,
} from 'src/screens/mainDashboard/dashboard-template-resolver';

export function resolveFinanceDashboardView(session: unknown) {
  const roles = getSessionRoles(session).map(normalizeDashboardRole);

  // Roles select the presentation. The route and API authorize the user's grants and scope.
  if (roles.some((role) => ['admin', 'it administrator'].includes(role))) return 'admin';
  if (roles.some((role) => ['principal', 'vice principal', 'director'].includes(role)))
    return 'principal';
  if (
    roles.some((role) =>
      ['finance officer', 'clerk', 'administrative manager', 'office assistant'].includes(role)
    )
  ) {
    return 'accountant';
  }

  return null;
}
