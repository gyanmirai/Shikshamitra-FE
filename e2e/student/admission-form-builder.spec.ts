/* eslint-disable import/no-extraneous-dependencies */
import type { Page } from '@playwright/test';

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const draft = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Admission application 2027-28',
  code: 'ADMISSION_2027',
  version: 1,
  status: 0,
  approvalStatus: 0,
  layoutType: 1,
  fieldsPerRow: 2,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'gu'],
  sectionCount: 2,
  sections: [],
  concurrencyStamp: 'form-stamp',
};

async function seriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
}

test.describe('Admission Form Builder', { tag: ['@student', '@accessibility', '@visual'] }, () => {
  test.use({ storageState: 'playwright/.auth/academic-admin.json' });

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', (route) =>
      route.fulfill({
        json: {
          user: { id: 'form-admin', email: 'form-admin@example.test' },
          expires: '2099-01-01T00:00:00.000Z',
          accessToken: 'form-builder-e2e-token',
          profile: { sub: 'form-admin', exp: 4070908800 },
        },
      })
    );
    await page.route('**/api/permission-management/permissions*', (route) =>
      route.fulfill({
        json: {
          groups: [
            {
              permissions: [
                { name: 'ShikshaMitra.Module.Students', isGranted: true },
                { name: 'Students.Admissions.Forms.View', isGranted: true },
                { name: 'Students.Admissions.Forms.Manage', isGranted: true },
                { name: 'Students.Admissions.Forms.Publish', isGranted: true },
              ],
            },
          ],
        },
      })
    );
    await page.route('**/api/student/enrollment/admissions/forms/metadata/field-types*', (route) =>
      route.fulfill({ json: { data: [] } })
    );
    await page.route(
      '**/api/student/enrollment/admissions/forms/metadata/system-fields*',
      (route) => route.fulfill({ json: { data: [] } })
    );
    await page.route('**/api/student/enrollment/admissions/forms?*', (route) =>
      route.fulfill({ json: { data: { totalCount: 1, items: [draft] } } })
    );
  });

  test('is accessible and keeps the primary flow usable on desktop and mobile', async ({
    page,
  }) => {
    await page.goto('/student/admissions/settings/forms');
    await expect(page.getByRole('heading', { name: 'Form Builder' })).toBeVisible();
    await expect(page.getByText('Admission application 2027-28')).toBeVisible();
    await expect(page.getByText('Not requested')).toBeVisible();
    expect(await seriousAccessibilityViolations(page)).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Create form' }).click();
    await expect(page.getByRole('heading', { name: 'Create admission form' })).toBeVisible();
    await expect(page.getByLabel('Form name *')).toBeVisible();
    await expect(page.getByLabel('Applicant languages *')).toBeVisible();
    expect(await seriousAccessibilityViolations(page)).toEqual([]);
  });

  test('keeps the list response and rendered table within a practical baseline', async ({
    page,
  }) => {
    const startedAt = Date.now();
    await page.goto('/student/admissions/settings/forms');
    await expect(page.getByText('Admission application 2027-28')).toBeVisible();
    const elapsed = Date.now() - startedAt;
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeLessThanOrEqual(10);
    expect(elapsed).toBeLessThan(10_000);
  });
});
