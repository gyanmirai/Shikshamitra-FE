import { test, expect } from '@playwright/test';

import {
  ensureAcademicAdmin,
  isAuthenticatedAdminProject,
  openAcademicCurriculumMenuPage,
} from './subject-management.fixtures';

test.describe('Academic curriculum navigation', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      !isAuthenticatedAdminProject(testInfo),
      'Subject-management specs run against the authenticated admin project.'
    );
    await ensureAcademicAdmin(page);
  });

  const routes = [
    {
      label: 'Subject Allocation',
      linkName: 'Subject Allocation',
      heading: /Subject Allocation/i,
    },
    {
      label: 'Syllabus',
      linkName: 'Syllabus',
      heading: /Syllabus|Chapters|Subjects/i,
    },
    {
      label: 'Lesson Plan / Teacher Diary',
      linkName: 'Lesson Plan / Teacher Diary',
      heading: /Lesson Plan|Teacher Diary/i,
    },
    {
      label: 'Curriculum Reports',
      linkName: 'Reports',
      heading: /Reports|Curriculum/i,
    },
    {
      label: 'Subjects Creation',
      linkName: 'Subjects Creation',
      heading: /Subject Creation/i,
      settings: true,
    },
    {
      label: 'Elective Group Creation',
      linkName: 'Elective Group Creation',
      heading: /Elective|Group/i,
      settings: true,
    },
  ];

  for (const route of routes) {
    test(`${route.label} route loads with authenticated curriculum context`, async ({ page }) => {
      await openAcademicCurriculumMenuPage(page, route.linkName, route.heading, {
        settings: route.settings,
      });
      await expect(page.getByText('Curriculum', { exact: true }).first()).toBeVisible();
    });
  }
});
