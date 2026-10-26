import { it, expect, describe } from 'vitest';

import { hrLeavePolicyPermissions, hrPolicyActionPermissions } from './hr-policy-permissions';

const flattenTitles = (items: any[]): string[] =>
  items.flatMap((item) => [item.title, ...flattenTitles(item.children || [])]);

const flattenItems = (items: any[]): any[] =>
  items.flatMap((item) => [item, ...flattenItems(item.children || [])]);

describe('HR production menu', () => {
  it('exposes HR MVP routes with production permissions', async () => {
    process.env.BUILD_STATIC_EXPORT = process.env.BUILD_STATIC_EXPORT ?? 'false';
    const { default: hrModule, hrPaths, hrPermissions } = await import('./hr-menus');
    expect(hrPermissions.policyActions).toBe(hrPolicyActionPermissions);
    expect(hrPaths.policyActions).toBe(hrPolicyActionPermissions);
    expect(hrPermissions.policies.leavePolicies).toBe(hrLeavePolicyPermissions.root);
    const navItems = Object.values(hrModule(true)).flatMap((sections) =>
      sections.flatMap((section) => section.items)
    );
    const titles = flattenTitles(navItems);

    expect(titles).toContain('I-card');
    expect(titles).toContain('Performance Management');

    expect(titles).toContain('Staff Directory');
    expect(titles).not.toContain('Employee List');
    expect(titles).not.toContain('Policy Impact');
    expect(titles).not.toContain('Holiday Impact');
    const items = flattenItems(navItems);
    const staff = items.find((item) => item.title === 'Staff');
    expect(staff.children.slice(0, 2)).toMatchObject([
      {
        title: 'Staff Onboarding',
        path: hrPaths.employee.onboarding,
        permissionName: hrPermissions.employee.onboarding,
        shortcutKey: 'Alt+H+E+2',
      },
      {
        title: 'Staff Directory',
        path: hrPaths.employee.list,
        exactMatch: true,
        permissionName: hrPermissions.employee.list,
        shortcutKey: 'Alt+H+E+1',
      },
    ]);
    expect(items.find((item) => item.title === 'I-card')).toMatchObject({
      path: '/hr/i-card',
      permissionName: hrPermissions.employee.iCard,
    });
    expect(items.find((item) => item.title === 'Performance Management')).toMatchObject({
      path: '/hr/professional-management/overview',
      permissionName: 'HR.ProfessionalManagement.View',
    });
    const performanceManagement = items.find((item) => item.title === 'Performance Management');
    expect(performanceManagement?.children?.map((item: any) => item.title)).toEqual([
      'Overview',
      'Reviews',
      'Cycles & Templates',
      'Outcomes',
      'Reports',
      'Settings',
    ]);
    expect(performanceManagement?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Overview',
          path: hrPaths.professionalManagement.overview,
          permissionName: hrPermissions.performanceManagement.view,
        }),
        expect.objectContaining({
          title: 'Reviews',
          path: hrPaths.professionalManagement.reviews,
          permissionName: hrPermissions.performanceManagement.reviewEmployees,
        }),
        expect.objectContaining({
          title: 'Cycles & Templates',
          path: hrPaths.professionalManagement.cycles,
          permissionName: hrPermissions.performanceManagement.manageCycles,
        }),
        expect.objectContaining({
          title: 'Outcomes',
          path: hrPaths.professionalManagement.outcomes,
          permissionName: hrPermissions.performanceManagement.outcomes,
        }),
        expect.objectContaining({
          title: 'Reports',
          path: hrPaths.professionalManagement.reports,
          permissionName: hrPermissions.performanceManagement.reports,
        }),
        expect.objectContaining({
          title: 'Settings',
          path: hrPaths.professionalManagement.settings.root,
          permissionName: hrPermissions.professionalManagement,
        }),
      ])
    );
    const performanceSettings = performanceManagement?.children?.find(
      (item: any) => item.title === 'Settings'
    );
    expect(performanceSettings?.children).toEqual([
      expect.objectContaining({
        title: 'Setup & Readiness',
        path: hrPaths.professionalManagement.settings.setup,
        permissionName: hrPermissions.performanceManagement.setting.setup,
      }),
    ]);
    expect(items.find((item) => item.title === 'Run Payroll')).toMatchObject({
      path: hrPaths.payroll.runPayroll,
      permissionName: 'HR.PayrollManagement.RunPayroll',
    });
    const policyMenu = items.find((item) => item.title === 'Policies & Rules');
    expect(policyMenu?.children?.map((item: any) => item.title)).toEqual([
      'Work Calendars',
      'Attendance Policies',
      'Leave Policies',
      'Payroll Policies',
      'Policy Assignments',
    ]);
    expect(policyMenu?.children?.map((item: any) => item.shortcutKeyName)).toEqual([
      'Alt+H+Y+1',
      'Alt+H+Y+2',
      'Alt+H+Y+3',
      'Alt+H+Y+4',
      'Alt+H+Y+5',
    ]);
    expect(items.find((item) => item.title === 'Leave Policies')).toMatchObject({
      path: hrPaths.policies.leavePolicies,
      permissionName: 'HR.LeaveManagement.Setting.LeavePolicy',
    });
    expect(
      items.find(
        (item) =>
          item.title === 'Leave Policy' && item.path === '/hr/leave-management-setting/leavePolicy'
      )
    ).toBeUndefined();
    expect(items.find((item) => item.title === 'Leave Types')).toBeUndefined();
    expect(
      items.find((item) => item.path === '/hr/leave-management-setting/leaveType')
    ).toBeUndefined();
  });
});

it('groups Reports and Templates under Reporting without changing grants', async () => {
  const { default: hrModule, hrPermissions } = await import('./hr-menus');
  const items = Object.values(hrModule(true)).flatMap((sections) =>
    sections.flatMap((section) => section.items)
  );
  const reporting = items.find((item) => item.title === 'Reporting');
  expect(reporting).toMatchObject({ path: '/hr/reports', permissionName: hrPermissions.reports });
  expect(
    reporting?.children?.map((item: any) => [item.title, item.path, item.permissionName])
  ).toEqual([
    ['Reports', '/hr/reports', hrPermissions.reports],
    ['Templates', '/hr/reports/templates', hrPermissions.reports],
  ]);
});
