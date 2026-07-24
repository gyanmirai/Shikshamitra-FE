import { test, expect } from '@playwright/test';

import {
  cleanupSubjectByApi,
  ensureAcademicAdmin,
  escapeRegExp,
  expectOkResponse,
  isAuthenticatedAdminProject,
  openSubjectCreation,
  selectFirstSubjectColor,
  uniqueName,
  type TestSubject,
} from './subject-management.fixtures';

test.describe('Academic subject creation', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      !isAuthenticatedAdminProject(testInfo),
      'Subject-management specs run against the authenticated admin project.'
    );
    await ensureAcademicAdmin(page);
  });

  test('shows the subject list, supports search, and validates required fields', async ({ page }) => {
    await openSubjectCreation(page);

    await expect(page.getByText('Total Subjects')).toBeVisible();
    await expect(page.getByText('Active Subjects')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Subject$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Bulk Add$/ })).toBeVisible();

    await page.getByPlaceholder('Search...').fill('Mathematics');
    await expect(page.getByRole('row', { name: /Mathematics/i })).toBeVisible();
    await page.getByPlaceholder('Search...').fill('No Such Subject From Playwright');
    await expect(page.getByText('Subject Data Not Found')).toBeVisible();
    await page.getByPlaceholder('Search...').clear();

    await page.getByRole('button', { name: /^Subject$/ }).click();
    const dialog = page.getByRole('dialog').filter({ hasText: 'Add Subject' });
    await expect(dialog.getByText('Basic Details')).toBeVisible();
    await dialog.getByRole('button', { name: /^Submit$/ }).click();
    await expect(dialog.getByText('Subject Name is required')).toBeVisible();
  });

  test('prevents exact duplicate subject creation before posting', async ({ page }) => {
    await openSubjectCreation(page);

    await page.getByRole('button', { name: /^Subject$/ }).click();
    const dialog = page.getByRole('dialog').filter({ hasText: 'Add Subject' });
    await dialog.getByLabel('Subject Name *').fill('Mathematics');
    await selectFirstSubjectColor(page);

    const duplicateResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/subjects/check-duplicate') && response.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: /^Submit$/ }).click();
    const duplicateResponse = await duplicateResponsePromise;
    await expectOkResponse(duplicateResponse, 'duplicate check');
    const duplicateBody = await duplicateResponse.json();
    expect(duplicateBody.hasExactDuplicate || duplicateBody.data?.hasExactDuplicate).toBe(true);
    await expect(page.getByText(/already exists/i)).toBeVisible();
  });

  test('creates a unique subject, verifies the API response, edits it, and cleans it up', async ({
    page,
  }, testInfo) => {
    const context = await ensureAcademicAdmin(page);
    const name = uniqueName('E2E Subject', testInfo.workerIndex);
    const updatedDisplayName = `${name} Display`;
    let createdSubject: TestSubject | undefined;

    try {
      await openSubjectCreation(page);
      await page.getByRole('button', { name: /^Subject$/ }).click();

      const dialog = page.getByRole('dialog').filter({ hasText: 'Add Subject' });
      await dialog.getByLabel('Subject Name *').fill(name);
      await dialog.getByLabel('Display Name').fill(name);
      await dialog.getByLabel('Description').fill('Created by Playwright subject-management tests.');
      await selectFirstSubjectColor(page);

      const createResponsePromise = page.waitForResponse((response) =>
        response.url().includes('/subjects') &&
        !response.url().includes('/check-duplicate') &&
        response.request().method() === 'POST'
      );
      await dialog.getByRole('button', { name: /^Submit$/ }).click();
      const createResponse = await createResponsePromise;
      await expectOkResponse(createResponse, 'create subject');
      const createBody = await createResponse.json();
      createdSubject = {
        id: createBody.id || createBody.data?.id,
        name: createBody.name || createBody.data?.name || name,
        displayName: createBody.displayName || createBody.data?.displayName,
      };

      await page.getByPlaceholder('Search...').fill(name);
      const row = page.getByRole('row', { name: new RegExp(escapeRegExp(name), 'i') }).first();
      await expect(row).toBeVisible();
      await expect(row.getByText('Unused')).toBeVisible();

      await row.getByRole('button', { name: /Edit subject/i }).click();
      const editDialog = page.getByRole('dialog').filter({ hasText: 'Edit Subject' });
      await expect(editDialog).toBeVisible();
      await editDialog.getByLabel('Display Name').fill(updatedDisplayName);

      const updateResponsePromise = page.waitForResponse((response) =>
        response.url().includes(`/subjects/${createdSubject?.id}`) &&
        response.request().method() === 'PUT'
      );
      await editDialog.getByRole('button', { name: /^Update$/ }).click();
      const updateResponse = await updateResponsePromise;
      await expectOkResponse(updateResponse, 'update subject');
      await expect(page.getByText(updatedDisplayName)).toBeVisible();
    } finally {
      await cleanupSubjectByApi(page, context.currentMedium.id, createdSubject);
    }
  });

  test('validates bulk add empty and duplicate rows', async ({ page }, testInfo) => {
    const bulkName = uniqueName('E2E Bulk Subject', testInfo.workerIndex);
    await openSubjectCreation(page);

    await page.getByRole('button', { name: /^Bulk Add$/ }).click();
    const drawer = page.getByRole('dialog').filter({ hasText: 'Add Subjects' });
    await expect(drawer.getByText('Add Subjects')).toBeVisible();
    await drawer.getByRole('button', { name: /^Save$/ }).click();
    await expect(page.getByText(/Please fix all errors before saving/i)).toBeVisible();
    await expect(drawer.getByText('Subject name is required')).toBeVisible();
    await expect(drawer.getByText('— Required')).toBeVisible();

    await drawer.getByLabel('Subject Name *').first().fill(bulkName);
    await drawer.getByText('Add Another Subject').click();
    await drawer.getByLabel('Subject Name *').last().fill(bulkName);
    await expect(drawer.getByText('Duplicate in this list')).toHaveCount(2);
  });
});
