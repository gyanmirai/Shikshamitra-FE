import { it, expect, describe } from 'vitest';

import { isHostSessionContext } from './session-context';
import { workspaceLanding, isWrongWorkspace } from './workspace-landing';

const tenant = {
  accountMode: 'tenant' as const,
  tenantId: 'school',
  canViewTenants: false,
  canCreateTenants: false,
  canUpdateTenants: false,
  canManageTenantStatus: false,
};
describe('verified initial setup routing', () => {
  it('requires verified school completion and never bypasses setup for missing status', () => {
    expect(isHostSessionContext(tenant)).toBe(false);
    expect(workspaceLanding(tenant)).toBe('/initial-setup');
    expect(isWrongWorkspace(tenant, '/dashboard')).toBe(true);
    expect(isHostSessionContext({ ...tenant, setupCompleted: false })).toBe(true);
  });
  it('sends completed schools to the dashboard and preserves other school routes', () => {
    const complete = { ...tenant, setupCompleted: true };
    expect(workspaceLanding(complete)).toBe('/dashboard');
    expect(isWrongWorkspace(complete, '/initial-setup/')).toBe(true);
    expect(isWrongWorkspace(complete, '/student/dashboard')).toBe(false);
  });
  it('keeps unfinished schools on setup across login and direct links', () => {
    const incomplete = { ...tenant, setupCompleted: false };
    expect(workspaceLanding(incomplete)).toBe('/initial-setup');
    expect(isWrongWorkspace(incomplete, '/dashboard')).toBe(true);
    expect(isWrongWorkspace(incomplete, '/initial-setup/')).toBe(false);
  });
  it('keeps the host outside the school setup route', () => {
    const host = { ...tenant, tenantId: null, accountMode: 'host' as const, setupCompleted: false };
    expect(workspaceLanding(host)).toBe('/host/tenants');
    expect(isWrongWorkspace(host, '/initial-setup')).toBe(true);
  });
});
