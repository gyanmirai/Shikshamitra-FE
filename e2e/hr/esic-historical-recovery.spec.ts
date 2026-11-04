/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test';

// Actual production components and clients, synthetic API responses only.
// Real save guards, transaction and payroll rules are covered by the HTTP/PostgreSQL suites.
for (const width of [1440, 390]) {
  test(`June ESIC errors preserve the draft at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install({ time: new Date('2026-11-03T12:00:00Z') });
    const settings = {
      hasSchoolWideScope: true,
      suggestedEffectiveMonth: '2026-12',
      history: [],
      current: {
        id: 'baseline',
        effectiveMonth: '1900-01',
        enabled: true,
        concurrencyStamp: 'reviewed',
        isCancelled: false,
      },
    };
    const writes: any[] = [];
    await page.route('**/api/payroll/statutory-schemes/esi/**', async (route) => {
      if (route.request().url().includes('/configuration')) {
        if (route.request().method() === 'PUT') {
          writes.push(route.request().postDataJSON());
          return route.fulfill({
            status: 409,
            json: { errorCode: 'HR:Payroll:EsiConfigurationLocked' },
          });
        }
        return route.fulfill({ json: settings });
      }
      return route.fulfill({
        status: 400,
        json: { errorCode: 'HR:Payroll:EsiPolicyNotEffective' },
      });
    });
    await page.goto('/hr/payroll/setting/statutory-schemes?scenario=esic-settings');
    await page.getByLabel('Changes effective from').fill('2026-06');
    await page.getByLabel('ESIC registration number').fill('SYNTHETIC-JUNE');
    await expect(
      page.getByText(/An ESIC policy effective for this month is unavailable/).first()
    ).toBeVisible();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      page.getByText(/This change would affect locked, finalized, or paid payroll/)
    ).toBeVisible();
    await expect(page.getByLabel('Changes effective from')).toHaveValue('2026-06');
    await expect(page.getByLabel('ESIC registration number')).toHaveValue('SYNTHETIC-JUNE');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => writes.length).toBe(2);
    expect(writes[1]).toEqual(writes[0]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
}

for (const { identity, allowed } of [
  { identity: 'denied', allowed: false },
  { identity: 'view-only', allowed: false },
  { identity: 'allowed', allowed: true },
]) {
  test(`School Identity link respects route permissions: ${identity}`, async ({ page }) => {
    await page.route('**/api/payroll/payslip-settings', (route) =>
      route.fulfill({
        json: {
          schoolName: 'Synthetic school',
          schoolAddress: 'Synthetic address',
          automaticEmail: false,
          concurrencyStamp: 'reviewed',
        },
      })
    );
    await page.route('**/api/payroll/payslip-settings/preview', (route) =>
      route.fulfill({ status: 503, json: {} })
    );
    await page.goto(`/hr/payroll/salary-slip?scenario=payslip-settings&identity=${identity}`);
    const link = page.getByRole('link', { name: 'Open School Identity' });
    if (allowed) await expect(link).toHaveAttribute('href', '/setting/school-identity');
    else {
      await expect(link).toHaveCount(0);
      await expect(
        page.getByText(/Ask an administrator with School Identity access/)
      ).toBeVisible();
    }
    await expect(page.getByText('Synthetic school')).toBeVisible();
  });
}
