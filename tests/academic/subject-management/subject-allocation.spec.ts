import { test, expect } from '@playwright/test';

import {
  cleanupAssignmentByApi,
  cleanupSubjectByApi,
  createSubjectByApi,
  currentClassIdFromAllocationPage,
  ensureAcademicAdmin,
  escapeRegExp,
  expectOkResponse,
  findAssignmentForSubject,
  isAuthenticatedAdminProject,
  openSubjectAllocation,
  uniqueName,
  type TestSubject,
} from './subject-management.fixtures';

test.describe('Academic subject allocation', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      !isAuthenticatedAdminProject(testInfo),
      'Subject-management specs run against the authenticated admin project.'
    );
    await ensureAcademicAdmin(page);
  });

  test('shows allocation table and validates required subject selection', async ({ page }) => {
    await openSubjectAllocation(page);

    await expect(page.getByLabel('Class')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Teacher' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Subject Allocation$/ })).toBeVisible();
    await expect(page.getByRole('table', { name: 'customizable table' })).toBeVisible();
    await expect(page.getByText('Total Subjects')).toBeVisible();
    await expect(page.getByText('Setup Health')).toBeVisible();

    await page.getByRole('button', { name: /^Subject Allocation$/ }).click();
    await expect(page.getByText('Class *', { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel('Subjects *')).toBeVisible();
    await page.getByRole('button', { name: /^Save Draft$/ }).click();
    await expect(page.getByText('At least one subject is required')).toBeVisible();
  });

  test('assigns a newly created subject to the selected class as draft and cleans up', async ({
    page,
  }, testInfo) => {
    const context = await ensureAcademicAdmin(page);
    const subjectName = uniqueName('E2E Allocation Subject', testInfo.workerIndex);
    const subjectCode = `E2E${String(testInfo.workerIndex).padStart(2, '0')}${Date.now()
      .toString()
      .slice(-4)}`;
    let subject: TestSubject | undefined;
    let assignmentId: string | undefined;

    try {
      subject = await createSubjectByApi(page, context.currentMedium.id, subjectName);
      const classId = await currentClassIdFromAllocationPage(page);

      await page.getByRole('button', { name: /^Subject Allocation$/ }).click();
      await page.getByLabel('Subjects *').click();
      await page.getByRole('option', { name: new RegExp(escapeRegExp(subjectName), 'i') }).click();
      await page.keyboard.press('Escape');
      await page
        .getByRole('button', { name: new RegExp(`${escapeRegExp(subjectName)}.*Remove subject`, 'i') })
        .click();
      await page.getByRole('textbox', { name: 'Subject Code *' }).fill(subjectCode);

      const createAssignmentResponsePromise = page.waitForResponse((response) =>
        response.url().includes('/academics/curriculum/subject-assignments') &&
        response.request().method() === 'POST'
      );
      await page.getByRole('button', { name: /^Save Draft$/ }).click();
      const createAssignmentResponse = await createAssignmentResponsePromise;
      await expectOkResponse(createAssignmentResponse, 'create subject assignment');

      await expect(page.getByRole('heading', { name: 'Subject Allocation' })).toBeVisible();
      await expect(page.getByText(new RegExp(escapeRegExp(subjectName), 'i')).first()).toBeVisible();
      await expect(page.getByText(subjectCode).first()).toBeVisible();

      const assignment = await findAssignmentForSubject(page, classId, subject.id);
      expect(assignment, 'created assignment should be returned by subject assignment API').toBeTruthy();
      assignmentId = assignment?.id;
      expect(assignment?.subjects?.[0]?.subjectCode).toBe(subjectCode);
    } finally {
      await cleanupAssignmentByApi(page, assignmentId);
      await cleanupSubjectByApi(page, context.currentMedium.id, subject);
    }
  });
});
