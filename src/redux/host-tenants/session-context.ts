import type { HostSessionContext } from './types';

export function isHostSessionContext(value: unknown): value is HostSessionContext {
  if (!value || typeof value !== 'object') return false;
  const context = value as Record<string, unknown>;
  return (
    (context.accountMode === 'host' || typeof context.setupCompleted === 'boolean') &&
    (context.canManageSetup === undefined || typeof context.canManageSetup === 'boolean') &&
    ((context.accountMode === 'host' && context.tenantId === null) ||
      (context.accountMode === 'tenant' && typeof context.tenantId === 'string')) &&
    ['canViewTenants', 'canCreateTenants', 'canUpdateTenants', 'canManageTenantStatus'].every(
      (key) => typeof context[key] === 'boolean'
    )
  );
}
