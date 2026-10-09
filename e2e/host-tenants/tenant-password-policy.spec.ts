import { test, expect } from '@playwright/test';

import { login, field, fixture, fillCreate } from './helpers';

test.beforeEach(async ({ page, request }) => {
  await request.post(fixture, { data: {} });
  await login(page);
  await expect(page).toHaveURL(/\/host\/tenants\/?$/);
});

test('numeric initial password is rejected before tenant creation', async ({ page }) => {
  let creates = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/host/tenants')) creates += 1;
  });
  await page.getByRole('button', { name: 'Add tenant', exact: true }).click();
  await fillCreate(page);
  await expect(page.getByText(/At least 8 characters; include/)).toContainText(
    'a special character'
  );
  await field(page, 'Initial password').fill('12345678');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(field(page, 'Initial password')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Include a lowercase letter', { exact: true })).toBeVisible();
  await expect(field(page, 'School code')).toHaveValue('NEW_SCHOOL');
  expect(creates).toBe(0);
  await field(page, 'Initial password').fill('Fixture-School-29!');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(creates).toBe(1);
});

test('server password rejection appears on the field and retains the draft for correction', async ({
  page,
}) => {
  await page.route('**/api/host/tenants', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    return route.fulfill({
      status: 400,
      json: {
        title: 'Business rule violated',
        detail: 'One or more business rules were violated.',
        errorCode: 'Volo.Abp.Identity:PasswordRequiresNonAlphanumeric',
      },
    });
  });
  await page.getByRole('button', { name: 'Add tenant', exact: true }).click();
  await fillCreate(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(
    page.getByText('Password must include a special character.', { exact: true })
  ).toBeVisible();
  await expect(field(page, 'Initial password')).toBeFocused();
  await expect(field(page, 'School code')).toHaveValue('NEW_SCHOOL');
  await page.unroute('**/api/host/tenants');
  await field(page, 'Initial password').fill('Corrected-Fixture-29!');
  await page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('password policy lookup can be retried without losing the tenant draft', async ({ page }) => {
  await page.route('**/api/abp/application-configuration?*', (route) =>
    route.fulfill({ status: 503, json: { title: 'Unavailable' } })
  );
  await page.getByRole('button', { name: 'Add tenant', exact: true }).click();
  await fillCreate(page);
  await expect(page.getByRole('alert')).toContainText('Unable to load password requirements');
  const submit = page.getByRole('dialog').getByRole('button', { name: 'Submit', exact: true });
  await expect(submit).toBeDisabled();
  await page.unroute('**/api/abp/application-configuration?*');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(submit).toBeEnabled();
  await expect(field(page, 'School code')).toHaveValue('NEW_SCHOOL');
  await submit.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
