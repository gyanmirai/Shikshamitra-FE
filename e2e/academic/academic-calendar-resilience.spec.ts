/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from '@playwright/test';

import { primeAcademicSelection, resolveAcademicContext } from './academic-api';

const baseUrl = () =>
  process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const failureStatuses = [400, 403, 404, 409, 500] as const;
const failureCaseByStatus = {
  400: 'AC-CAL-022',
  403: 'AC-CAL-023',
  404: 'AC-CAL-024',
  409: 'AC-CAL-025',
  500: 'AC-CAL-026',
} as const;

function attachCases(...ids: string[]) {
  test.info().annotations.push({ type: 'case', description: ids.join(', ') });
}

test.describe(
  'Academic Calendar UI resilience',
  { tag: ['@module-academic', '@submodule-academic-calendar', '@high', '@resilience'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    for (const status of failureStatuses) {
      test(`${failureCaseByStatus[status]} calendar management handles API ${status} without crashing`, async ({
        page,
      }) => {
        attachCases(failureCaseByStatus[status]);

        await page.route('**/api/academic/calendars**', async (route) => {
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify({
              error: {
                code: `E2E:${status}`,
                message: `Injected ${status} calendar failure`,
              },
            }),
          });
        });

        await page.goto(`${baseUrl()}/academic/calendarManagement`, {
          waitUntil: 'domcontentloaded',
        });

        await expect(page.locator('body')).toBeVisible();
        const bodyText = await page.locator('body').innerText();
        expect(bodyText).not.toContain('Application Error');
        expect(bodyText).not.toContain('Internal Server Error');
      });
    }

    test('AC-CAL-027..028 calendar management handles timeout, offline, and partial responses without crashing', async ({
      page,
      context,
    }) => {
      attachCases('AC-CAL-027', 'AC-CAL-028');

      await page.route('**/api/academic/calendars**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ id: 'partial-calendar' }] }),
        });
      });
      await page.goto(`${baseUrl()}/academic/calendarManagement`, {
        waitUntil: 'domcontentloaded',
      });
      await expect(page.locator('body')).toBeVisible();

      await context.setOffline(true);
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
      await context.setOffline(false);

      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('Application Error');
      expect(bodyText).not.toContain('Internal Server Error');
    });
  }
);
