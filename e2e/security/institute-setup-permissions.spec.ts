import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('/fixture/reset');
  await page.route(/https:\/\/[^/]*iconify[^/]*\//, (route) => route.fulfill({ json: { icons: {} } }));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});

[
  ['Shift Management', 'ShiftManagement'], ['Academic Setup', 'AcademicSetup'],
].forEach(([title, feature]) => {
  ['User', 'Role HOD'].forEach((target) => {
    test(`${title}: ${target} renders all actions and saves only its exact Edit delta`, async ({ page, request }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const open = async () => {
        await page.getByRole('button', { name: `${target} Module Permission`, exact: true }).click();
        await page.getByRole('button', { name: 'Institute Setup', exact: true }).click();
        await page.getByRole('button', { name: title, exact: true }).click();
        await expect(page.getByText('No permission actions available', { exact: true })).toHaveCount(0);
      };
      await open();
      const row = page.getByTestId(`permission-${title}`);
      await Promise.all(['View', 'Add', 'Edit', 'Delete'].map((action) =>
        expect(row.getByRole('group', { name: `${title} ${action} editor`, exact: true })).toBeVisible()
      ));
      const edit = row.getByRole('group', { name: `${title} Edit editor`, exact: true });
      const state = target === 'User' ? 'Deny' : 'Revoke';
      await edit.getByRole('radio', { name: state, exact: true }).press('Space');
      await expect(edit.getByRole('radio', { name: state, exact: true })).toBeChecked();
      await expect(page.getByText('1 unsaved permission change', { exact: true })).toBeVisible();
      const result = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(result.violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.getByRole('button', { name: 'Review changes', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Review permission changes' }).getByText(`InstituteSetup.${feature}.Edit`, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const writes = await (await request.get('/fixture/writes')).json();
      expect(writes).toEqual([{
        provider: target === 'User' ? 'U' : 'R', key: target === 'User' ? 'synthetic-user' : 'HOD',
        permissions: [target === 'User' ? { name: `InstituteSetup.${feature}.Edit`, state: 'deny' }
          : { name: `InstituteSetup.${feature}.Edit`, isGranted: false }],
      }]);
      await page.reload();
      await page.getByRole('button', { name: /Use (dark|light) theme/ }).click();
      await open();
      await expect(edit.getByRole('radio', { name: state, exact: true })).toBeChecked();
      await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
      await expect(row.getByRole('group')).toHaveCount(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  });
});
