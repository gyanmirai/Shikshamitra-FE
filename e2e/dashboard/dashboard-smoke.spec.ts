/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop */
import { test, expect, type Page } from '@playwright/test';

const templates = ['leadership', 'principalAdmin', 'teacher', 'financeHr', 'studentParent'];
const tenant = () => process.env.E2E_TENANT || 'DDVS';
const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL before running dashboard E2E.');
  }

  return url.replace(/\/$/, '');
};
const limitedEmail = () => process.env.E2E_DASHBOARD_LIMITED_EMAIL || 'finance-officer@ddvs.com';
const limitedPassword = () => process.env.E2E_DASHBOARD_LIMITED_PASSWORD || 'Temp@123';

async function waitForBackend(page: Page) {
  const healthUrl = `${apiBaseUrl()}/api/abp/application-configuration`;
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < 60_000) {
    try {
      const response = await page.request.get(healthUrl, {
        headers: { __tenant: tenant() },
        timeout: 5_000,
      });
      if (response.ok()) {
        return;
      }
      lastError = `${response.status()} ${await response.text()}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await page.waitForTimeout(2_000);
  }

  throw new Error(`Backend API is not ready at ${healthUrl}. Last error: ${lastError}`);
}

async function hasAccessToken(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return false;

    const session = await response.json();
    return Boolean(session?.accessToken);
  });
}

async function loginLimitedDashboardUser(page: Page) {
  await waitForBackend(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(tenant());
  await page.getByLabel('Email / Username').fill(limitedEmail());
  await page.getByLabel('Password').fill(limitedPassword());

  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toBeEnabled({ timeout: 30_000 });
  await signInButton.click();

  await expect.poll(() => hasAccessToken(page), { timeout: 60_000 }).toBe(true);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
  await page.evaluate(() => localStorage.setItem('onboarding_completed', 'true'));
}

test.describe('role-based dashboard', () => {
  test('renders dashboard for authenticated user', async ({ page }) => {
    await page.goto('/dashboard/', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.getByTestId('dashboard-root')).toBeVisible();
    await expect(page.getByTestId('dashboard-zone-kpis')).toBeVisible();
  });

  templates.forEach((template) => {
    test(`renders ${template} template in dev override`, async ({ page }) => {
      await page.goto(`/dashboard/?dashboardTemplate=${template}`, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      });

      await expect(page).not.toHaveURL(/\/login/i);
      await expect(page.getByTestId(`dashboard-template-${template}`)).toBeVisible();
      await expect(page.getByTestId('dashboard-zone-actions')).toBeVisible();
      await expect(page.getByTestId('dashboard-zone-modules')).toBeVisible();
    });
  });

  test('desktop and mobile smoke do not blank the dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard/?dashboardTemplate=principalAdmin', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page.getByTestId('dashboard-root')).toBeVisible();
    await expect(page.getByTestId('dashboard-zone-kpis')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/?dashboardTemplate=principalAdmin', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page.getByTestId('dashboard-root')).toBeVisible();
    await expect(page.getByTestId('dashboard-zone-announcements')).toBeVisible();
  });

  test('routes widget drilldowns to configured module screens', async ({ page }) => {
    await page.goto('/dashboard/?dashboardTemplate=financeHr&dashboardDataSource=mock', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await page.getByRole('button', { name: 'Open HR Dashboard' }).click();

    await expect(page).toHaveURL(/\/hr\/dashboard\/?$/);
  });

  test('renders an intercepted dashboard summary response from the API source', async ({
    page,
  }) => {
    await page.route('**/api/dashboard/summary?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dashboardTemplate: 'principalAdmin',
          dateRange: { label: 'API summary' },
          kpiCards: [
            {
              id: 'principal-teacher-attendance',
              title: 'API Teacher Attendance',
              value: '97.4%',
            },
          ],
          actionItems: [
            {
              id: 'principal-leave-approvals',
              title: 'API Staff leave approvals',
              count: 7,
              subtitle: '7 leave requests awaiting action',
            },
          ],
          moduleSnapshots: [
            {
              id: 'principal-academic-dashboard',
              title: 'API Academic Dashboard',
              value: 'Open',
            },
          ],
        }),
      });
    });

    await page.goto('/dashboard/?dashboardTemplate=principalAdmin', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.locator('[data-dashboard-source="api"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'API Teacher Attendance' })).toBeVisible();
    await expect(page.getByText('97.4%')).toBeVisible();
    await expect(page.getByTestId('dashboard-widget-principal-leave-approvals')).toContainText('7');
    await expect(page.getByText('7 leave requests awaiting action')).toBeVisible();
  });

  test('keeps the dashboard usable for a partial dashboard summary response', async ({ page }) => {
    await page.route('**/api/dashboard/summary?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dashboardTemplate: 'financeHr',
          kpiCards: [
            {
              id: 'unknown-widget',
              title: 'Unknown API Widget',
              value: 'Hidden',
            },
          ],
          zoneErrors: {
            kpis: 'Finance snapshot could not be loaded.',
          },
        }),
      });
    });

    await page.goto('/dashboard/?dashboardTemplate=financeHr', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.getByTestId('dashboard-root')).toBeVisible();
    await expect(page.locator('[data-dashboard-source="api"]')).toBeVisible();
    await expect(page.getByText('Unknown API Widget')).toHaveCount(0);
    await expect(page.getByTestId('dashboard-zone-kpis-error')).toContainText(
      'Finance snapshot could not be loaded.'
    );
  });

  test('shows an honest error state without mock operational values when the dashboard API fails', async ({
    page,
  }) => {
    await page.route('**/api/dashboard/summary?**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'summary unavailable' }),
      });
    });

    await page.goto('/dashboard/?dashboardTemplate=financeHr', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.locator('[data-dashboard-source="apiError"]')).toBeVisible();
    await expect(page.getByTestId('dashboard-data-source-error')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Staff Attendance' })).toHaveCount(0);
  });

  test('renders an intercepted dashboard contract preview response', async ({ page }) => {
    await page.route('**/api/dashboard/contract-preview?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dashboardTemplate: 'financeHr',
          dateRange: { label: 'Contract preview' },
          kpiCards: [
            {
              id: 'hr-staff-attendance',
              title: 'Preview Staff Attendance',
              value: '99.1%',
            },
          ],
          moduleSnapshots: [
            {
              id: 'hr-dashboard',
              title: 'Preview HR Dashboard',
              value: 'Open',
            },
          ],
        }),
      });
    });

    await page.goto('/dashboard/?dashboardTemplate=financeHr&dashboardDataSource=contractPreview', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.locator('[data-dashboard-source="contractPreview"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preview Staff Attendance' })).toBeVisible();
    await expect(page.getByText('99.1%')).toBeVisible();
  });

  test('keeps the dashboard usable for a partial contract preview response', async ({ page }) => {
    await page.route('**/api/dashboard/contract-preview?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dashboardTemplate: 'financeHr',
          kpiCards: [
            {
              id: 'unknown-widget',
              title: 'Unknown Preview Widget',
              value: 'Hidden',
            },
          ],
        }),
      });
    });

    await page.goto('/dashboard/?dashboardTemplate=financeHr&dashboardDataSource=contractPreview', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.getByTestId('dashboard-root')).toBeVisible();
    await expect(page.getByText('Unknown Preview Widget')).toHaveCount(0);
    await expect(page.getByTestId('dashboard-zone-kpis-empty')).toBeVisible();
  });

  test('falls back to mock dashboard data when contract preview fails', async ({ page }) => {
    await page.route('**/api/dashboard/contract-preview?**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'preview unavailable' }),
      });
    });

    await page.goto('/dashboard/?dashboardTemplate=financeHr&dashboardDataSource=contractPreview', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.locator('[data-dashboard-source="contractPreviewFallback"]')).toBeVisible();
    await expect(page.getByTestId('dashboard-data-source-error')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Staff Attendance' })).toBeVisible();
  });
});

test.describe('role-based dashboard limited permissions', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('finance officer sees finance dashboard widgets without unauthorized HR widgets', async ({
    page,
  }) => {
    await loginLimitedDashboardUser(page);
    await page.goto('/dashboard/', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    await expect(page).not.toHaveURL(/\/login/i);
    await expect(page.getByTestId('dashboard-root')).toBeVisible();
    await expect(page.getByTestId('dashboard-template-financeHr')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Today Collection' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Finance Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payroll Readiness' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Staff Attendance' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'HR Dashboard' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open HR Dashboard' })).toHaveCount(0);
  });
});
