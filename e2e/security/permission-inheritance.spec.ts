import type { Page, Locator } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('/fixture/reset');
  await page.route(/https:\/\/[^/]*iconify[^/]*\//, (route) =>
    route.fulfill({ json: { icons: {} } })
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
});
async function openActions(page: Page, target = 'User') {
  await page.getByRole('button', { name: `${target} Module Permission`, exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Select a Sub-module', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Academics', exact: true }).click();
  await page.getByRole('button', { name: 'Curriculum', exact: true }).click();
  return page.getByTestId('permission-Subject Allocation');
}
async function editor(page: Page, row: Locator, action: string, feature = 'Subject Allocation') {
  const group = row.getByRole('group', { name: `${feature} ${action} editor`, exact: true });
  await expect(group).toBeVisible();
  return group;
}
async function choose(page: Page, row: Locator, action: string, state: string, feature?: string) {
  await (
    await editor(page, row, action, feature)
  )
    .getByRole('radio', { name: state, exact: true })
    .click();
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function accessible(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
    ).violations
  ).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
}
async function wheelScroll(page: Page, viewport: Locator) {
  const bounds = await viewport.boundingBox();
  expect(bounds).not.toBeNull();
  const before = await viewport.evaluate((element) => element.scrollTop);
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.wheel(0, 400);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(before);
}
test('navigation and permission lists scroll independently in both dialogs', async ({
  page,
  request,
}) => {
  if (page.viewportSize()!.width >= 900) {
    await page.setViewportSize({ width: page.viewportSize()!.width, height: 560 });
  }
  await ['User', 'Role HOD']
    .flatMap((target) =>
      ['Module Permission', 'Set Module Visibility'].map((mode) => ({ target, mode }))
    )
    .reduce(async (previous, { target, mode }) => {
      await previous;
      await page.getByRole('button', { name: `${target} ${mode}`, exact: true }).click();
      const dialog = page.getByRole('dialog');
      const navigation = dialog.getByRole('navigation', { name: 'Permission modules' });
      await dialog
        .getByRole('button', {
          name: mode === 'Module Permission' ? 'Academics' : 'HR/Staff',
          exact: true,
        })
        .click();
      if (mode === 'Module Permission') {
        await dialog.getByRole('button', { name: 'Curriculum', exact: true }).click();
      }
      await expect(dialog.getByRole('radiogroup').first()).toBeVisible();
      await expect(navigation).toHaveCSS('border-right-width', '0px');
      await expect(dialog.getByText('Role permissions', { exact: true })).toHaveCount(0);
      await wheelScroll(page, navigation.locator('.simplebar-content-wrapper').first());
      const navigationOffset = await navigation
        .locator('.simplebar-content-wrapper')
        .evaluate((element) => element.scrollTop);
      const permissionViewport =
        page.viewportSize()!.width >= 900
          ? dialog
              .getByTestId(
                `permission-matrix-${target === 'User' ? 'user' : 'role'}-${mode === 'Module Permission' ? 'actions' : 'visibility'}`
              )
              .locator('.simplebar-content-wrapper')
              .first()
          : dialog.getByRole('region', { name: 'Permission details', exact: true });
      const firstPermission = dialog.getByRole('radiogroup').first();
      const firstPermissionTop = (await firstPermission.boundingBox())!.y;
      await wheelScroll(page, permissionViewport);
      await expect
        .poll(async () => (await firstPermission.boundingBox())!.y)
        .toBeLessThan(firstPermissionTop);
      expect(
        await navigation
          .locator('.simplebar-content-wrapper')
          .evaluate((element) => element.scrollTop)
      ).toBe(navigationOffset);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await expect(
        dialog.getByRole('button', { name: 'Review changes', exact: true })
      ).toBeInViewport();
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    }, Promise.resolve());
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
});
test('visibility lists only frontend constants regardless of the API catalogue', async ({
  page,
  request,
}) => {
  const module = 'ShikshaMitra.Module.Academics';
  await page.route(
    /\/api\/(?:permission-management\/permissions|shikshamitra-permissions\/users\/[^/]+\/permissions)/,
    async (route) => {
      const response = await route.fetch();
      const catalogue = await response.json();
      catalogue.groups[0].permissions = catalogue.groups[0].permissions
        .filter((entry: { name: string }) => entry.name !== `${module}.Curriculum.Settings`)
        .map((entry: { name: string; displayName: string }) => ({
          ...entry,
          displayName:
            entry.name === `${module}.Curriculum` ? 'API curriculum label' : entry.displayName,
        }));
      catalogue.groups[0].permissions.push(
        ...[`${module}.ServerOnly`, 'ShikshaMitra.Module.ServerOnly'].map((name) => ({
          name,
          displayName: 'API-only visibility',
          allowedProviders: [],
          isGranted: true,
          grantedProviders: [{ providerName: 'R', providerKey: 'HOD' }],
        }))
      );
      await route.fulfill({ response, json: catalogue });
    }
  );
  await ['User', 'Role HOD'].reduce(async (previous, target) => {
    await previous;
    await page.getByRole('button', { name: `${target} Set Module Visibility`, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Academics', exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: 'Additional visibility', exact: true })
    ).toHaveCount(0);
    await expect(dialog.getByText('API-only visibility', { exact: true })).toHaveCount(0);
    await expect(dialog.getByText('API curriculum label', { exact: true })).toHaveCount(0);
    const curriculum = dialog.getByTestId('permission-Curriculum');
    await expect(curriculum).toBeVisible();
    await expect(curriculum.getByRole('radio', { name: 'Allow', exact: true })).toBeEnabled();
    const settings = dialog.getByTestId('permission-Curriculum / Settings');
    await expect(settings).toBeVisible();
    await expect(settings.getByRole('radio', { name: 'Allow', exact: true })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
    await dialog.getByRole('button', { name: 'HR/Staff', exact: true }).click();
    const staff = dialog.getByTestId('permission-Staff');
    await expect(staff).toBeVisible();
    await expect(staff.getByRole('radio', { name: 'Allow', exact: true })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  }, Promise.resolve());
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
});

test('editable defaults, persistent selection and accessible light/dark layouts', async ({
  page,
  request,
}, testInfo) => {
  let row = await openActions(page);
  await ['View', 'Add', 'Delete'].reduce(async (previous, action) => {
    await previous;
    const group = await editor(page, row, action);
    await expect(group.getByRole('radio', { name: 'Follow role', exact: true })).toBeChecked();
    await expect(group.getByRole('radio', { name: 'Deny', exact: true })).toBeEnabled();
  }, Promise.resolve());
  await page.getByRole('button', { name: 'Curriculum', exact: true }).click();
  await expect(row).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
  await accessible(page);
  await page.screenshot({ path: testInfo.outputPath('permission-matrix-light.png') });
  const add = await editor(page, row, 'Add');
  const deny = add.getByRole('radio', { name: 'Deny', exact: true });
  await deny.click();
  await expect(deny).toBeChecked();
  await expect(page.getByText('1 unsaved permission change', { exact: true })).toBeVisible();
  await deny.click();
  await expect(deny).toBeChecked();
  await expect(page.getByText('1 unsaved permission change', { exact: true })).toBeVisible();
  await add.getByRole('radio', { name: 'Follow role', exact: true }).press('Space');
  await expect(page.getByText('No unsaved changes', { exact: true })).toBeVisible();
  expect(
    (await add
      .locator('label')
      .filter({ has: page.getByRole('radio', { name: 'Deny', exact: true }) })
      .boundingBox())!.height
  ).toBe(page.viewportSize()!.width >= 900 ? 32 : 44);
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
  row = await openActions(page);
  await editor(page, row, 'Add');
  await accessible(page);
  await page.screenshot({ path: testInfo.outputPath('permission-matrix-dark.png') });
});
test('deny and allow survive role updates; Follow role removes explicit overrides', async ({
  page,
}) => {
  let row = await openActions(page);
  await choose(page, row, 'Add', 'Deny');
  await expect(
    (await editor(page, row, 'Add')).getByText('Denied by user override', { exact: true })
  ).toBeVisible();
  await expect(
    (await editor(page, row, 'Add')).getByText('Role default: Allowed', { exact: true })
  ).toBeVisible();
  await accessible(page);
  await save(page);
  row = await openActions(page, 'Role HOD');
  await choose(page, row, 'Add', 'Revoke');
  await save(page);
  row = await openActions(page);
  await expect(
    (await editor(page, row, 'Add')).getByRole('radio', { name: 'Deny', exact: true })
  ).toBeChecked();
  await choose(page, row, 'Add', 'Allow');
  await expect(
    (await editor(page, row, 'Add')).getByText('Allowed by user override', { exact: true })
  ).toBeVisible();
  await expect(
    (await editor(page, row, 'Add')).getByText('Role default: Denied', { exact: true })
  ).toBeVisible();
  await expect(
    (await editor(page, row, 'Add')).getByText('Denied by role', { exact: true })
  ).toHaveCount(0);
  await save(page);
  row = await openActions(page);
  await expect(
    (await editor(page, row, 'Add')).getByRole('radio', { name: 'Allow', exact: true })
  ).toBeChecked();
  await expect(
    (await editor(page, row, 'Add')).getByText('Allowed by user override', { exact: true })
  ).toBeVisible();
  await expect(
    (await editor(page, row, 'Add')).getByText('Role default: Denied', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  row = await openActions(page, 'Role HOD');
  await choose(page, row, 'Add', 'Allow');
  await save(page);
  row = await openActions(page);
  await expect(
    (await editor(page, row, 'Add')).getByRole('radio', { name: 'Allow', exact: true })
  ).toBeChecked();
  await choose(page, row, 'Add', 'Follow role');
  await choose(page, row, 'View', 'Follow role');
  await save(page);
  row = await openActions(page);
  await ['View', 'Add', 'Delete'].reduce(async (previous, action) => {
    await previous;
    await expect(
      (await editor(page, row, action)).getByRole('radio', { name: 'Follow role', exact: true })
    ).toBeChecked();
    await expect(
      (await editor(page, row, action)).getByText('Allowed by role', { exact: true })
    ).toBeVisible();
  }, Promise.resolve());
});
test('keyboard editing and visibility saves only the intended user delta', async ({
  page,
  request,
}) => {
  await page.getByRole('button', { name: 'User Set Module Visibility', exact: true }).click();
  await page.getByRole('button', { name: 'Academics', exact: true }).click();
  const row = page.getByTestId('permission-Curriculum');
  const group = await editor(page, row, 'Visible', 'Curriculum');
  const deny = group.getByRole('radio', { name: 'Deny', exact: true });
  await group.getByRole('radio', { name: 'Follow role', exact: true }).press('ArrowLeft');
  await expect(deny).toBeChecked();
  expect(
    (await group
      .locator('label')
      .filter({ has: page.getByRole('radio', { name: 'Deny', exact: true }) })
      .boundingBox())!.height
  ).toBe(page.viewportSize()!.width >= 900 ? 32 : 44);
  await accessible(page);
  await save(page);
  expect(await (await request.get('/fixture/writes')).json()).toEqual([
    {
      provider: 'U',
      key: 'synthetic-user',
      permissions: [{ name: 'ShikshaMitra.Module.Academics.Curriculum', state: 'deny' }],
    },
  ]);
  await page.getByRole('button', { name: 'User Set Module Visibility', exact: true }).click();
  await page.getByRole('button', { name: 'Academics', exact: true }).click();
  await expect(
    (await editor(page, row, 'Visible', 'Curriculum')).getByRole('radio', {
      name: 'Deny',
      exact: true,
    })
  ).toBeChecked();
});
test('dependency review and discard preserve saved data and keep the footer reachable', async ({
  page,
  request,
}) => {
  const row = await openActions(page);
  await choose(page, row, 'View', 'Deny');
  await expect(page.getByText('3 unsaved permission changes')).toBeVisible();
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Review permission changes' });
  await expect(review.getByText('Deny', { exact: true })).toHaveCount(3);
  await accessible(page);
  await review.getByRole('button', { name: 'Back to editing' }).click();
  await page.getByRole('checkbox', { name: 'Overrides only' }).check();
  await expect(row).toBeVisible();
  const discard = page.getByRole('button', { name: 'Discard changes', exact: true });
  const bounds = await discard.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await discard.click();
  await page
    .getByRole('dialog', { name: 'Discard permission changes?' })
    .getByRole('button', { name: 'Discard changes', exact: true })
    .click();
  await expect(page.getByText('No matching permissions')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(
    (await editor(page, row, 'View')).getByRole('radio', { name: 'Follow role', exact: true })
  ).toBeChecked();
  expect(await (await request.get('/fixture/writes')).json()).toEqual([]);
});
