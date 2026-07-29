/* eslint-disable import/no-extraneous-dependencies */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { primeAcademicSelection, resolveAcademicContext } from './academic-api';

const criticalRoutes = [
  { id: 'ACM-A11Y-001', label: 'Dashboard', path: '/academic/dashboard' },
  { id: 'ACM-A11Y-001', label: 'Subject Allocation', path: '/academic/curriculumSubjects' },
  { id: 'ACM-A11Y-001', label: 'Schedule Exam', path: '/academic/scheduleExam' },
  { id: 'ACM-A11Y-001', label: 'Calendar Management', path: '/academic/calendarManagement' },
];

test.describe(
  'Academic accessibility release checks',
  { tag: ['@module-academic', '@accessibility', '@high'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    for (const route of criticalRoutes) {
      test(
        `${route.label} has no serious or critical automated accessibility violations`,
        {
          annotation: [{ type: 'requirement', description: route.id }],
        },
        async ({ page }) => {
          await page.goto(route.path, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('body')).toBeVisible();

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

          const releaseBlockingViolations = results.violations.filter((violation) =>
            ['serious', 'critical'].includes(violation.impact || '')
          );

          expect(releaseBlockingViolations).toEqual([]);
        }
      );
    }
  }
);
