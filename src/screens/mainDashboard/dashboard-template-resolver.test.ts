import { it, expect, describe } from 'vitest';

import { DASHBOARD_TEMPLATES } from './dashboard-types';
import {
  getSessionRoles,
  isDashboardTemplate,
  normalizeDashboardRole,
  resolveDashboardTemplate,
  getSessionDashboardTemplate,
} from './dashboard-template-resolver';

describe('dashboard template resolver', () => {
  it('normalizes common role formats', () => {
    expect(normalizeDashboardRole('Vice_Principal')).toBe('vice principal');
    expect(normalizeDashboardRole('super-admin')).toBe('super admin');
    expect(normalizeDashboardRole('  HR   Manager  ')).toBe('hr manager');
  });

  it('extracts session roles from string and array claims', () => {
    expect(getSessionRoles({ profile: { role: 'Teacher' } })).toEqual(['Teacher']);
    expect(getSessionRoles({ profile: { role: ['Teacher', 'HOD'] } })).toEqual(['Teacher', 'HOD']);
    expect(getSessionRoles({ profile: { roleNames: ['Parent'] } })).toEqual(['Parent']);
  });

  it('resolves seeded roles to dashboard templates', () => {
    expect(resolveDashboardTemplate({ roles: ['Director'] })).toBe(DASHBOARD_TEMPLATES.leadership);
    expect(resolveDashboardTemplate({ roles: ['Principal'] })).toBe(
      DASHBOARD_TEMPLATES.principalAdmin
    );
    expect(resolveDashboardTemplate({ roles: ['Teacher'] })).toBe(DASHBOARD_TEMPLATES.teacher);
    expect(resolveDashboardTemplate({ roles: ['Finance Officer'] })).toBe(
      DASHBOARD_TEMPLATES.financeHr
    );
    expect(resolveDashboardTemplate({ roles: ['Parent'] })).toBe(DASHBOARD_TEMPLATES.studentParent);
  });

  it('uses priority when a user has multiple roles', () => {
    expect(resolveDashboardTemplate({ roles: ['Teacher', 'Finance Officer'] })).toBe(
      DASHBOARD_TEMPLATES.financeHr
    );
    expect(resolveDashboardTemplate({ roles: ['Student', 'Principal'] })).toBe(
      DASHBOARD_TEMPLATES.principalAdmin
    );
  });

  it('supports explicit templates and future Security role mappings', () => {
    expect(
      resolveDashboardTemplate({
        roles: ['Custom Accountant'],
        roleTemplateMap: { 'Custom Accountant': DASHBOARD_TEMPLATES.financeHr },
      })
    ).toBe(DASHBOARD_TEMPLATES.financeHr);

    expect(
      resolveDashboardTemplate({
        roles: ['Teacher'],
        explicitTemplate: DASHBOARD_TEMPLATES.leadership,
      })
    ).toBe(DASHBOARD_TEMPLATES.leadership);
  });

  it('validates and reads explicit session dashboard template claims', () => {
    expect(isDashboardTemplate(DASHBOARD_TEMPLATES.teacher)).toBe(true);
    expect(isDashboardTemplate('unknown')).toBe(false);
    expect(getSessionDashboardTemplate({ profile: { dashboardTemplate: 'teacher' } })).toBe(
      DASHBOARD_TEMPLATES.teacher
    );
    expect(getSessionDashboardTemplate({ profile: { dashboardTemplate: 'invalid' } })).toBeNull();
  });
});
