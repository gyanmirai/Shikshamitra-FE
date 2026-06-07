import { it, expect, describe } from 'vitest';

const flattenTitles = (items: any[]): string[] =>
  items.flatMap((item) => [item.title, ...flattenTitles(item.children || [])]);

const flattenItems = (items: any[]): any[] =>
  items.flatMap((item) => [item, ...flattenItems(item.children || [])]);

describe('HR production menu', () => {
  it('exposes HR MVP routes with production permissions', async () => {
    process.env.BUILD_STATIC_EXPORT = process.env.BUILD_STATIC_EXPORT ?? 'false';
    const { default: hrModule, hrPaths } = await import('./hr-menus');
    const navItems = Object.values(hrModule(true)).flatMap((sections) =>
      sections.flatMap((section) => section.items)
    );
    const titles = flattenTitles(navItems);

    expect(titles).toContain('I-card');
    expect(titles).toContain('Performance Management');

    const items = flattenItems(navItems);
    expect(items.find((item) => item.title === 'I-card')).toMatchObject({
      path: '/hr/i-card',
      permissionName: 'HR.Employee.ICard.View',
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
          permissionName: 'HR.ProfessionalManagement.View',
        }),
        expect.objectContaining({
          title: 'Reviews',
          path: hrPaths.professionalManagement.reviews,
          permissionName: 'HR.ProfessionalManagement.View',
        }),
        expect.objectContaining({
          title: 'Cycles & Templates',
          path: hrPaths.professionalManagement.cycles,
          permissionName: 'HR.ProfessionalManagement.View',
        }),
        expect.objectContaining({
          title: 'Outcomes',
          path: hrPaths.professionalManagement.outcomes,
          permissionName: 'HR.ProfessionalManagement.View',
        }),
        expect.objectContaining({
          title: 'Reports',
          path: hrPaths.professionalManagement.reports,
          permissionName: 'HR.ProfessionalManagement.View',
        }),
        expect.objectContaining({
          title: 'Settings',
          path: hrPaths.professionalManagement.settings.root,
          permissionName: 'HR.ProfessionalManagement.View',
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
        permissionName: 'HR.ProfessionalManagement.View',
      }),
    ]);
    expect(items.find((item) => item.title === 'Run Payroll')).toMatchObject({
      path: hrPaths.payroll.runPayroll,
      permissionName: 'HR.PayrollManagement.RunPayroll',
    });
    expect(items.find((item) => item.title === 'Leave Policies')).toMatchObject({
      path: hrPaths.policies.leavePolicies,
      permissionName: 'HR.LeaveManagement.Setting.LeavePolicy',
    });
    expect(
      items.find(
        (item) =>
          item.title === 'Leave Policy' && item.path === hrPaths.leaveManagement.setting.leavePolicy
      )
    ).toBeUndefined();
    expect(
      items.find((item) => item.title === 'Settings' && item._action === 'leave-policy-setup')
    ).toMatchObject({
      path: hrPaths.leaveManagement.setting.leaveType,
    });
  });
});
