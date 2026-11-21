import { test, expect } from '@playwright/test';

import { login, field, fixture, fillCreate } from './helpers';

test.beforeEach(async ({ request }) => {
  await request.post(fixture, { data: {} });
});

test('filters tenant status in the table across pages and combines it with search', async ({
  page,
}) => {
  await login(page);
  const statusFilter = page.getByRole('button', { name: 'Filter Status', exact: true });
  await expect(statusFilter).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('combobox', { name: /^Status/ })).toHaveCount(0);
  await page.getByRole('button', { name: /next page/i }).click();
  await expect(page.getByRole('cell', { name: 'SCHOOL_26', exact: true })).toBeVisible();

  await statusFilter.click();
  await page.getByRole('combobox', { name: /status/i }).click();
  await page.getByRole('option', { name: 'Inactive', exact: true }).click();
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/host/tenants' && url.searchParams.get('isActive') === 'false';
  });
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  expect(new URL((await filteredRequest).url()).searchParams.get('skipCount')).toBe('0');
  await expect(page.getByText('No results found', { exact: true })).toBeVisible();

  const combinedRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/host/tenants' && url.searchParams.get('filter') === 'SCHOOL_26';
  });
  await page.getByRole('textbox', { name: 'Search tenants' }).fill('SCHOOL_26');
  expect(new URL((await combinedRequest).url()).searchParams.get('isActive')).toBe('false');
  await expect(page.getByText(/No results found for.*SCHOOL_26/)).toBeVisible();

  await statusFilter.click();
  await page.getByRole('combobox', { name: /status/i }).click();
  await page.getByRole('option', { name: 'Active', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'SCHOOL_26', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Status → Equals → Inactive' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Clear (1)', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'SCHOOL_26', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'SCHOOL_01', exact: true })).toHaveCount(0);
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
