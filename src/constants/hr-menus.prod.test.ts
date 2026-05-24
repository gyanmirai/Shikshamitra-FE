import { it, expect, describe } from 'vitest';

const flattenTitles = (items: any[]): string[] =>
  items.flatMap((item) => [item.title, ...flattenTitles(item.children || [])]);

const flattenItems = (items: any[]): any[] =>
  items.flatMap((item) => [item, ...flattenItems(item.children || [])]);

describe('HR production menu', () => {
  it('exposes HR MVP routes with production permissions', async () => {
    process.env.BUILD_STATIC_EXPORT = process.env.BUILD_STATIC_EXPORT ?? 'false';
    const { default: hrModule } = await import('./hr-menus');
    const navItems = Object.values(hrModule(true)).flatMap((sections) =>
      sections.flatMap((section) => section.items)
    );
    const titles = flattenTitles(navItems);

    expect(titles).toContain('I-card');
    expect(titles).toContain('Professional Management');

    const items = flattenItems(navItems);
    expect(items.find((item) => item.title === 'I-card')).toMatchObject({
      path: '/hr/i-card',
      permissionName: 'HR.Employee.ICard.View',
    });
    expect(items.find((item) => item.title === 'Professional Management')).toMatchObject({
      path: '/hr/professional-management',
      permissionName: 'HR.ProfessionalManagement.View',
    });
  });
});
