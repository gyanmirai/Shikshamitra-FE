/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax */
import { expect, test } from '@playwright/test';

import { primeAcademicSelection, resolveAcademicContext } from './academic-api';

const routes = [
  { label: 'Dashboard', path: '/academic/dashboard', expected: /Dashboard/i },
  {
    label: 'Homework Learning Tasks',
    path: '/academic/homeworkCreation',
    expected: /Homework|Learning Tasks/i,
  },
  { label: 'Grade Entry', path: '/academic/gradeEntry', expected: /Grade Entry|Record Marks/i },
];

const viewports = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 900 },
];

test.describe(
  'Academic responsive smoke checks',
  { tag: ['@module-academic', '@responsive', '@high'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    for (const viewport of viewports) {
      for (const route of routes) {
        test(
          `${route.label} remains usable at ${viewport.label} viewport`,
          {
            annotation: [{ type: 'requirement', description: 'ACM-RESP-001' }],
          },
          async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto(route.path, { waitUntil: 'domcontentloaded' });

            const body = page.locator('body');
            await expect(body).toBeVisible();
            await expect(body).toContainText(route.expected, { timeout: 15_000 });

            const bodyText = await body.innerText();
            expect(bodyText).not.toContain('Application Error');
            expect(bodyText).not.toContain('Internal Server Error');
          }
        );
      }
    }
  }
);
