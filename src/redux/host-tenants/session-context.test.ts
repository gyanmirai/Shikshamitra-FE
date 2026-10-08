import { it, expect, describe } from 'vitest';

import { isHostSessionContext } from './session-context';

const caps = {
  canViewTenants: true,
  canCreateTenants: true,
  canUpdateTenants: true,
  canManageTenantStatus: true,
};
describe('verified account context', () => {
  it('accepts a host context only without a tenant ID', () => {
    expect(isHostSessionContext({ accountMode: 'host', tenantId: null, ...caps })).toBe(true);
    expect(isHostSessionContext({ accountMode: 'host', tenantId: 'school-id', ...caps })).toBe(
      false
    );
  });
  it('does not infer host access from role names or malformed capabilities', () => {
    expect(isHostSessionContext({ role: 'super-admin', tenantId: null })).toBe(false);
    expect(
      isHostSessionContext({ accountMode: 'host', tenantId: null, ...caps, canViewTenants: 'true' })
    ).toBe(false);
    expect(isHostSessionContext({ accountMode: 'tenant', tenantId: null, ...caps })).toBe(false);
  });
});
