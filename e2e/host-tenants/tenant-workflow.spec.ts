import { test, expect } from '@playwright/test';

import { login, field, fixture, fillCreate } from './helpers';

test.beforeEach(async ({ request }) => {
  await request.post(fixture, { data: {} });
});

test('host logout stays local and a new login restores only the host workspace', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
  await page.getByRole('button', { name: 'Account menu for current user' }).click();
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(/^http:\/\/(?:127\.0\.0\.1|localhost):4398\/login\/?$/);
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
  await expect(page.getByRole('button', { name: 'Add tenant', exact: true })).toBeEnabled();
  await page.goto('/host/tenants/');
  await expect(page.getByRole('button', { name: 'Add tenant', exact: true })).toBeVisible();
});

test('host login opens only Tenant and supports creation, editing and status changes @tenant', async ({
  page,
}) => {
  const paths: string[] = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) paths.push(new URL(frame.url()).pathname);
  });
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
  expect(paths).not.toContain('/dashboard');
  const sidebar = page.locator('#onboarding-sidebar');
  await expect(sidebar.getByRole('link', { name: 'Tenant', exact: true })).toHaveCount(1);
  await expect(sidebar.locator('a:not([aria-label="logo"])')).toHaveCount(1);
  await page.getByRole('button', { name: /next page/i }).click();
  await expect(page.getByRole('cell', { name: 'SCHOOL_26', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /previous page/i }).click();
  await page.getByRole('button', { name: 'Add tenant', exact: true }).click();
  await expect(field(page, 'School code')).toBeFocused();
  await fillCreate(page);
  const create = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().endsWith('/api/host/tenants')
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  expect((await create).postDataJSON().adminPassword).toBe('Fixture-School-29!');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page
    .getByPlaceholder(/search/i)
    .first()
    .fill('NEW_SCHOOL');
  await page.getByRole('button', { name: 'Edit New Synthetic School', exact: true }).click();
  await expect(field(page, 'School code')).toBeDisabled();
  await expect(field(page, 'Initial password')).toHaveCount(0);
  await field(page, 'Institute name').fill('Updated Synthetic School');
  const update = page.waitForRequest(
    (request) => request.method() === 'PUT' && !request.url().endsWith('/status')
  );
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  expect((await update).postDataJSON()).not.toHaveProperty('name');
  await page
    .getByRole('button', { name: 'Deactivate Updated Synthetic School', exact: true })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'Deactivate', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Enter a reason');
  await field(page, 'Reason').fill('Synthetic suspension');
  await page.getByRole('dialog').getByRole('button', { name: 'Deactivate', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Activate Updated Synthetic School', exact: true })
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Activate Updated Synthetic School', exact: true })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'Activate', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Deactivate Updated Synthetic School', exact: true })
  ).toBeVisible();
  await page.screenshot({ path: '.artifacts/host-tenant-browser/tenant-workspace.png' });
});
