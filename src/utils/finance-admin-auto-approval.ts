export function isFinanceAdministratorSession(session: unknown): boolean {
  const roleClaim = (session as { profile?: { role?: string | string[] } } | null)?.profile?.role;
  const roles = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
  return roles.some((role) => {
    const normalized = role.trim().toLowerCase();
    return normalized === 'admin' || normalized === 'super-admin';
  });
}
