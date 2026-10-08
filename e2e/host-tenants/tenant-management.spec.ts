import { test, expect } from '@playwright/test';

import { login, field, fixture, fillCreate } from './helpers';

test.use({ hasTouch: true });

test.beforeEach(async ({ request }) => {
  await request.post(fixture, { data: {} });
});

test('narrow form preserves drafts after failure and prevents accidental discard @accessibility', async ({
  page,
  request,
}) => {
  await request.post(fixture, { data: { failNext: 503, delay: 500 } });
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
  await page.getByRole('button', { name: 'Open primary navigation', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Tenant', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add tenant', exact: true }).click();
  await expect(field(page, 'School code')).toBeFocused();
  const dialog = page.getByRole('dialog');
  const targets = await Promise.all(
    ['close', 'Cancel', 'Submit'].map((name) =>
      dialog.getByRole('button', { name, exact: true }).boundingBox()
    )
  );
  targets.forEach((bounds) => {
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  });
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await fillCreate(page);
  await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true })
  ).toBeDisabled();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Synthetic retryable failure'
  );
  await expect(field(page, 'Institute name')).toHaveValue('New Synthetic School');
  page.once('dialog', (confirmation) => confirmation.dismiss());
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('view-only host sees Tenant with write actions disabled @permission', async ({
  page,
  request,
}) => {
  await request.post(fixture, { data: { canWrite: false } });
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
  await expect(page.getByRole('button', { name: 'Add tenant', exact: true })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Edit Synthetic School 1', exact: true })
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Deactivate Synthetic School 1', exact: true })
  ).toBeDisabled();
});

test('inactive school login gives a clear access message', async ({ page }) => {
  await login(page, 'INACTIVE');
  await expect(page.locator('form').getByRole('alert')).toContainText('This school is inactive');
  await expect(page).toHaveURL(/\/login\/?$/);
});

test('concurrent edit keeps the draft until explicit reload', async ({ page, request }) => {
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
  await page.getByRole('button', { name: 'Edit Synthetic School 1', exact: true }).click();
  await field(page, 'Institute name').fill('Unsaved draft');
  await request.post('http://127.0.0.1:4399/fixture/conflict', { data: {} });
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('The tenant changed');
  await expect(field(page, 'Institute name')).toHaveValue('Unsaved draft');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reload latest details', exact: true }).click();
  await expect(field(page, 'Institute name')).toHaveValue('Changed by another administrator');
  await field(page, 'Institute name').fill('Resolved update');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
