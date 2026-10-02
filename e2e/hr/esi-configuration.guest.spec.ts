/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect } from '@playwright/test';

// These credentials belong only to the disposable FullDemo database.
test.skip(
  process.env.ESI_LOCAL_E2E !== '1',
  'Requires a disposable local FullDemo API and frontend.'
);

test('ESIC configuration supports responsive review, keyboard use, loading, and retry', async ({
  page,
  baseURL,
}) => {
  expect(new URL(baseURL!).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  // The global first-use tour is outside this payroll regression.
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
  await page.goto('/login');
  await page.getByLabel('SCHOOL CODE').fill('DDVS');
  await page.getByLabel('EMAIL / USERNAME').fill('admin-ddvs@ddvs.com');
  await page.getByLabel('Password', { exact: true }).fill('Temp@123');
  await page.getByLabel('Remember me').uncheck();
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/dashboard');
  const route = '/hr/payroll/setting/statutory-schemes';
  const endpoint = '**/api/payroll/statutory-schemes/esi/configuration';
  let releaseLoading!: () => void;
  const loading = new Promise<void>((resolve) => {
    releaseLoading = resolve;
  });
  await page.route(endpoint, async (request) => {
    await loading;
    await request.continue();
  });
  await page.goto(route);
  await expect(page.getByRole('heading', { name: 'Statutory Schemes', exact: true })).toBeVisible();
  await expect(page.getByLabel('Loading ESIC settings')).toBeVisible();
  releaseLoading();
  await expect(page.getByRole('switch', { name: 'Calculate ESIC in payroll' })).toBeEnabled();
  await page.unroute(endpoint);

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByText('Applies to current and future unlocked payroll.')).toBeVisible();
    await expect(page.getByLabel('Apply from')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({ path: `test-results/esic-${width}.png`, fullPage: true });
  }

  const toggle = page.getByRole('switch', { name: 'Calculate ESIC in payroll' });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect(page.getByLabel('ESIC registration number')).toHaveCount(0);

  await page.route(endpoint, (request) =>
    request.request().method() === 'PUT'
      ? request.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
      : request.continue()
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText(/Your changes are preserved/)).toBeVisible();
  await expect(toggle).not.toBeChecked();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.unroute(endpoint);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(toggle).toBeChecked();
});
