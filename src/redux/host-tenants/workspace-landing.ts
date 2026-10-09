import { hostTenantPath } from 'src/constants/host-tenant-menu';

import type { HostSessionContext } from './types';

export const initialSetupPath = '/initial-setup';
export function workspaceLanding(context: HostSessionContext) {
  if (context.accountMode === 'host') return hostTenantPath;
  return context.setupCompleted === true ? '/dashboard' : initialSetupPath;
}
export function isWrongWorkspace(context: HostSessionContext, pathname: string) {
  const path = pathname.replace(/\/+$/, '');
  if (context.accountMode === 'host') return path !== hostTenantPath;
  if (context.setupCompleted !== true) return path !== initialSetupPath;
  return path.startsWith('/host/') || path === initialSetupPath;
}
