import { test, expect } from '@playwright/test';

['Role admin', 'Admin user'].forEach((target) => {
  ['Module Permission', 'Set Module Visibility'].forEach((mode) => {
    test(`${target} ${mode} shows granted access and prevents changes`, async ({ page, request }) => {
      await request.post('/fixture/reset');
      await page.goto('/');
      await page.getByRole('button', { name: `${target} ${mode}`, exact: true }).click();
      await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Admin has all permissions by default.');
      await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
      if (mode === 'Module Permission') {
        await page.getByRole('button', { name: 'Payroll Management', exact: true }).click();
        const payroll = page.getByTestId('permission-Run Payroll');
        if (target === 'Role admin') {
          await Promise.all((await payroll.getByRole('radio', { name: 'Allow', exact: true }).all())
            .map((allow) => expect(allow).toBeChecked()));
        } else {
          await expect(payroll.getByText('Allowed by role', { exact: true }).first()).toBeVisible();
        }
      }
      const radios = page.getByRole('radio');
      await expect(radios.first()).toBeVisible();
      await Promise.all((await radios.all()).map((radio) => expect(radio).toBeDisabled()));
      await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
      await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
      await page.screenshot({ path: test.info().outputPath('admin-read-only.png') });
      await page.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
    });
  });
});
