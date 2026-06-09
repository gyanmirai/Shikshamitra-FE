import { test, expect } from '@playwright/test';

test.describe('HR Performance Management', () => {
  test('renders overview, SQAAF audit pack reports, settings, and legacy setup redirect', async ({
    page,
  }) => {
    await page.goto('/hr/professional-management/overview', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Performance Management').first()).toBeVisible();
    await expect(page.getByText('Prepare SQAAF Audit Pack')).toBeVisible();
    await expect(page.getByText('SQAAF readiness')).toBeVisible();

    const auditPackResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/hr/professional-management/reports/sqaaf-audit-pack') &&
        response.request().method() === 'GET'
    );
    await page.goto('/hr/professional-management/reports', { waitUntil: 'domcontentloaded' });
    const auditResponse = await auditPackResponse;
    expect(auditResponse.ok()).toBeTruthy();
    await expect(page.getByText('SQAAF Audit Pack')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export Audit Pack' })).toBeVisible();
    await expect(
      page
        .getByTestId('performance-report-sqaaf-audit-pack-missing-evidence')
        .getByText('Missing Evidence')
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SQAAF Evidence Coverage' })).toBeVisible();

    await page.goto('/hr/professional-management/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Performance settings')).toBeVisible();
    await expect(page.getByText('Board Presets / SQAAF Mapping')).toBeVisible();

    await page.goto('/hr/professional-management/setup', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/hr\/professional-management\/settings\/setup/);
    await expect(page.getByRole('heading', { name: 'Setup & readiness' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/hr/professional-management/reports', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('SQAAF Audit Pack')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export Audit Pack' })).toBeVisible();
  });
});
