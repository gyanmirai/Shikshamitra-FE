/* eslint-disable no-restricted-syntax -- Each viewport/theme combination is an independent browser test. */
import type { Page } from '@playwright/test';

import { test, expect } from '@playwright/test';

async function approve(page: Page) {
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Approve application', exact: true })
    .getByRole('button', { name: 'Approve application', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Finalize admission', exact: true })
  ).toBeVisible();
}

// Actual card, readiness form, Redux and HTTP clients; only transport and the parent workflow
// callback are synthetic. The destination is displayed locally, not a real Next router navigation.
for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test(`approval opens finalization automatically at ${viewport.width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
      await approve(page);
      await expect(
        page.getByRole('status', { name: 'Loading finalization readiness' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Finalize admission', exact: true })
      ).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
      await expect(page.getByLabel('Loading student record details')).toBeVisible();
      await expect(
        page.getByText('No additional Student profile details were captured.')
      ).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Finalizing admission…', exact: true })
      ).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Continue admission', exact: true })
      ).toHaveCount(0);
      await page.getByRole('button', { name: 'Release preparation', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Finalization checks', exact: true })
      ).toBeVisible();
      const finalSave = page.getByRole('button', { name: 'Finalize admission', exact: true });
      await expect(finalSave).toBeDisabled();
      await page.getByRole('checkbox', { name: /I verified the primary guardian/ }).check();
      await expect(finalSave).toBeEnabled();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBeTruthy();
      if (viewport.width === 1440 && theme === 'dark')
        await page.screenshot({
          path: '.artifacts/admission-finalization-20261028/finalization-dark.png',
          fullPage: true,
          animations: 'disabled',
        });
      if (viewport.width === 390 && theme === 'dark')
        await page.screenshot({
          path: '.artifacts/admission-finalization-20261028/finalization-mobile-dark.png',
          fullPage: true,
          animations: 'disabled',
        });
      await finalSave.dblclick();
      const pendingSave = page.getByRole('button', { name: 'Finalizing admission…', exact: true });
      await expect(pendingSave).toBeDisabled();
      const requests = JSON.parse((await page.getByLabel('Finalization requests').textContent())!);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatchObject({
        concurrencyStamp: 'ready-stamp',
        confirmCreateNew: true,
        confirmGuardianContactVerified: true,
      });
      expect(requests[0].idempotencyKey).toMatch(/^[0-9a-f-]{36}$/i);
      await page.getByRole('button', { name: 'Release final save', exact: true }).click();
      await expect(page.getByRole('status', { name: 'Onboarding destination' })).toHaveText(
        '/student/onboarding/setup?case=case-synthetic-123'
      );
    });
  }
}

test('retains approved state and retries preparation without a second approval', async ({
  page,
}) => {
  await page.goto('/?prepareFailure=1');
  await approve(page);
  await expect(page.getByText('Finalization readiness could not be loaded.')).toBeVisible();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Loading finalization readiness' })).toBeVisible();
  await page.getByRole('button', { name: 'Release preparation', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Finalization checks', exact: true })
  ).toBeVisible();
  expect(JSON.parse((await page.getByLabel('Decision requests').textContent())!)).toHaveLength(1);
});

test('retries a failed readiness read without approving or preparing again', async ({ page }) => {
  await page.goto('/?readinessFailure=1');
  await approve(page);
  await page.getByRole('button', { name: 'Release preparation', exact: true }).click();
  await expect(page.getByText('Finalization readiness could not be loaded.')).toBeVisible();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Finalization checks', exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('Readiness reads')).toHaveText('2');
  expect(JSON.parse((await page.getByLabel('Decision requests').textContent())!)).toHaveLength(1);
});

test('keeps identity requirements even after guardian contact is verified', async ({ page }) => {
  await page.goto('/?identityMissing=1');
  await approve(page);
  await page.getByRole('button', { name: 'Release preparation', exact: true }).click();
  await expect(page.getByText('Gender is required.')).toBeVisible();
  await page.getByRole('checkbox', { name: /I verified the primary guardian/ }).check();
  await expect(
    page.getByRole('button', { name: 'Finalize admission', exact: true })
  ).toBeDisabled();
  await expect(page.getByLabel('Finalization requests')).toHaveText('[]');
});
