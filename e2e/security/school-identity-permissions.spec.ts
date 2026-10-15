import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const base = 'InstituteSetup.SchoolIdentity';

['User', 'Role HOD'].forEach((target) => {
  ['light', 'dark'].forEach((theme) => {
    test(`${target} ${theme}: Delete stays unavailable while configuration grants persist`, async ({ page, request }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await request.post('/fixture/reset');
      await page.route(/https:\/\/[^/]*iconify[^/]*\//, (route) => route.fulfill({ json: { icons: {} } }));
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((mode) => localStorage.setItem('mui-mode', mode), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      const open = async () => {
        await page.getByRole('button', { name: `${target} Module Permission`, exact: true }).click();
        await page.getByRole('button', { name: 'Institute Setup', exact: true }).click();
        await page.getByRole('button', { name: 'School Identity', exact: true }).click();
      };
      await open();
      const row = page.getByTestId('permission-School Identity');
      const editor = (action: string) => row.getByRole('group', { name: `School Identity ${action} editor`, exact: true });
      await expect(editor('View').getByRole('radio').first()).toBeEnabled();
      await expect(editor('Add').getByRole('radio').first()).toBeEnabled();
      const deletion = editor('Delete');
      await Promise.all((await deletion.getByRole('radio').all()).map((radio) => expect(radio).toBeDisabled()));
      await expect(deletion.getByRole('radio')).toHaveCount(target === 'User' ? 3 : 2);
      await expect(row.getByText('Unavailable', { exact: true })).toBeVisible();
      await expect(row.getByText('This action is unavailable for this role or user in the server permission catalogue.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
      expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
      const choice = target === 'User' ? 'Deny' : 'Revoke';
      await editor('Add').getByRole('radio', { name: choice, exact: true }).press('Space');
      await expect(page.getByText('3 unsaved permission changes', { exact: true })).toBeVisible();
      const accessibility = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(accessibility.violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('school-identity.png'), fullPage: true });
      await page.getByRole('button', { name: 'Review changes', exact: true }).click();
      const review = page.getByRole('dialog', { name: 'Review permission changes' });
      await expect(review.getByText(`${base}.Delete`, { exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const permissions = ['ManageDefaults', 'ManageOverrides', 'AccessSignature'].map((action) =>
        target === 'User' ? { name: `${base}.${action}`, state: 'deny' }
          : { name: `${base}.${action}`, isGranted: false });
      const writes = await (await request.get('/fixture/writes')).json();
      expect(writes).toHaveLength(1);
      expect(writes[0].permissions).toHaveLength(3);
      expect(writes[0].permissions).toEqual(expect.arrayContaining(permissions));
      await page.reload();
      await open();
      await expect(editor('Add').getByRole('radio', { name: choice, exact: true })).toBeChecked();
      await Promise.all((await deletion.getByRole('radio').all()).map((radio) => expect(radio).toBeDisabled()));
      await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    });
  });
});
