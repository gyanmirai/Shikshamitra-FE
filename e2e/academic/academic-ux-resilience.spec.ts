/* eslint-disable import/no-extraneous-dependencies */
import { expect, test } from '@playwright/test';

import { primeAcademicSelection, resolveAcademicContext } from './academic-api';

const baseUrl = () =>
  process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const routes = [
  { label: 'Calendar Management', path: '/academic/calendarManagement', expected: /Calendar/i },
  {
    label: 'Homework Learning Tasks',
    path: '/academic/homeworkCreation',
    expected: /Homework|Learning Tasks/i,
  },
  { label: 'Schedule Exam', path: '/academic/scheduleExam', expected: /Schedule Exam/i },
];

test.describe(
  'Academic cross-module UX resilience',
  { tag: ['@module-academic', '@submodule-cross-module-ux', '@high', '@resilience'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    for (const route of routes) {
      test(`${route.label} survives direct load, refresh, browser back, and reset navigation`, async ({
        page,
      }) => {
        await page.goto(`${baseUrl()}${route.path}`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).toContainText(route.expected, { timeout: 15000 });

        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).toContainText(route.expected, { timeout: 15000 });

        await page.goto(`${baseUrl()}/academic/dashboard`, { waitUntil: 'domcontentloaded' });
        await page.goBack({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).toContainText(route.expected, { timeout: 15000 });

        const bodyText = await page.locator('body').innerText();
        expect(bodyText).not.toContain('Application Error');
        expect(bodyText).not.toContain('Internal Server Error');
      });
    }
  }
);
