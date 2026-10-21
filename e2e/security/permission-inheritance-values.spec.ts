import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('role values stay visible beside user overrides in both themes', async ({ page, request }) => {
  await request.post('/fixture/reset');
  await page.route(/https:\/\/[^/]*iconify[^/]*\//, (route) =>
    route.fulfill({ json: { icons: {} } })
  );
  await page.route(/\/api\/shikshamitra-permissions\/users\/[^/]+\/permissions/, async (route) => {
    const response = await route.fetch();
    const catalogue = await response.json();
    catalogue.groups[0].permissions = catalogue.groups[0].permissions.map(
      (entry: { name: string; isGranted: boolean; grantedProviders: unknown[] }) =>
        entry.name === 'Academics.CurriculumManagement.SubjectAssignment.Delete'
          ? { ...entry, grantedProviders: [], isGranted: false }
          : entry
    );
    await route.fulfill({ response, json: catalogue });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await [false, true].reduce(async (previous, dark) => {
    await previous;
    if (dark) await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
    await page.getByRole('button', { name: 'User Module Permission', exact: true }).click();
    await page.getByRole('button', { name: 'Academics', exact: true }).click();
    await page.getByRole('button', { name: 'Curriculum', exact: true }).click();
    const row = page.getByTestId('permission-Subject Allocation');
    const view = row.getByRole('group', { name: 'Subject Allocation View editor', exact: true });
    const remove = row.getByRole('group', {
      name: 'Subject Allocation Delete editor',
      exact: true,
    });
    await expect(view.getByText('Allowed by role', { exact: true })).toBeVisible();
    await expect(remove.getByText('Denied by role', { exact: true })).toBeVisible();
    await remove.getByRole('radio', { name: 'Allow', exact: true }).press('Space');
    await expect(remove.getByText('Denied by role', { exact: true })).toBeVisible();
    await expect(remove.getByText('User override: Allowed', { exact: true })).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .include('[role="dialog"]')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze()
      ).violations
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({
      path: `.artifacts/role-permission-values/${page.viewportSize()!.width}-${dark ? 'dark' : 'light'}.png`,
    });
    await remove.getByRole('radio', { name: 'Follow role', exact: true }).click();
    await expect(remove.getByText(/User override:/)).toHaveCount(0);
    await expect(remove.getByRole('radio', { name: 'Follow role', exact: true })).toBeChecked();
    await expect(remove.getByText('Denied by role', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Discard permission changes?' })
      .getByRole('button', { name: 'Discard changes', exact: true })
      .click();
    await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  }, Promise.resolve());
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
});
