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

  it('lands Student-only users on a permitted Student page without granting the main dashboard', () => {
    const complete = { ...tenant, setupCompleted: true };
    const permissions = [
      'ShikshaMitra.Module.Students',
      'ShikshaMitra.Module.Students.Dashboard',
      'Students.Dashboard.View',
    ].map((name) => ({ name, isGranted: true }));
    expect(workspaceLanding(complete, permissions)).toBe('/student/dashboard');
    expect(isWrongWorkspace(complete, '/dashboard/', permissions)).toBe(true);
    expect(isWrongWorkspace(complete, '/student/admissions/settings/forms', permissions)).toBe(
      false
    );
    expect(
      workspaceLanding(complete, [
        ...permissions,
        { name: 'ShikshaMitra.Module.Dashboard', isGranted: true },
      ])
    ).toBe('/dashboard');
    expect(workspaceLanding({ ...complete, setupCompleted: false }, permissions)).toBe(
      '/initial-setup'
    );
  });

  it('uses a visible permitted feature when the Student dashboard is unavailable', () => {
    const permissions = [
      'ShikshaMitra.Module.Students',
      'ShikshaMitra.Module.Students.Enrollment',
      'Students.Admissions.Forms.View',
    ].map((name) => ({ name, isGranted: true }));
    expect(workspaceLanding({ ...tenant, setupCompleted: true }, permissions)).toBe(
      '/student/admissions/settings/forms'
    );
  });
});
