/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type Locator } from '@playwright/test';

import { createEmployeeFixture } from './employee-fixtures';
import { createEmployeeFromExistingDefaults, employeeApiRequest } from './employee-api';
import {
  fillDate,
  saveStep,
  fillTextByLabel,
  searchEmployee,
  gotoEmployeeList,
  openFirstRowEdit,
} from './employee-page';

function asItems<T = Record<string, any>>(body: any): T[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.Items)) return body.Items;
  return [];
}

async function expectOk(response: Awaited<ReturnType<typeof employeeApiRequest>>, label: string) {
  if (!response.ok()) {
    throw new Error(`${label}: ${response.status()} ${await response.text()}`);
  }
}

async function getJson<T = any>(page: Page, path: string): Promise<T> {
  const response = await employeeApiRequest(page, path);
  await expectOk(response, `GET ${path}`);
  return response.json() as Promise<T>;
}

function toAcademicYear(item: any) {
  return item?.academicYear || item?.AcademicYear || item;
}

function uniqueById(items: any[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = String(item?.id || '').toLowerCase();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

async function currentAcademicYear(page: Page) {
  const body = await getJson<any>(page, '/app/academic-year?Sorting=name');
  const years = asItems<any>(body).map(toAcademicYear).filter((year) => year?.id);
  const today = new Date();
  const current =
    years.find((year) => {
      const start = year.startDate ? new Date(year.startDate) : null;
      const end = year.endDate ? new Date(year.endDate) : null;
      return start && end && start <= today && today <= end;
    }) || years[0];

  if (!current?.id) {
    throw new Error('Unable to resolve current academic year for Academic Permission E2E');
  }

  return current;
}

function boardMatchesAcademicYear(board: any, academicYearId: string) {
  return (
    String(board?.academicYearId || board?.academicYear?.id || board?.AcademicYearId || '').toLowerCase() ===
    academicYearId.toLowerCase()
  );
}

async function firstMediumFromAcademicSetup(page: Page, academicYearId: string) {
  const [boardsBody, mediumsBody] = await Promise.all([
    getJson<any>(page, '/app/education-board'),
    getJson<any>(page, '/app/education-medium'),
  ]);
  const boards = asItems<any>(boardsBody);
  const nestedMediums = boards.flatMap((board) =>
    asItems<any>(board.educationMediums || board.EducationMediums || []).map((medium) => ({
      ...medium,
      educationBoardId: medium.educationBoardId || medium.EducationBoardId || board.id,
    }))
  );
  const mediums = uniqueById([...asItems<any>(mediumsBody), ...nestedMediums]);
  const boardsById = new Map(boards.map((board) => [String(board.id).toLowerCase(), board]));
  const medium = mediums.find((candidate) => {
    const board = boardsById.get(
      String(candidate.educationBoardId || candidate.EducationBoardId || '').toLowerCase()
    );
    return candidate.id && boardMatchesAcademicYear(board, academicYearId);
  });

  if (!medium?.id) {
    throw new Error('Unable to resolve an Academic Permission parent medium from academic setup');
  }

  return {
    medium,
    mediumId: medium.id,
  };
}

async function firstNonAdminRoleId(page: Page) {
  const rolesBody = await getJson<any>(page, '/identity/roles/all');
  const role = asItems<any>(rolesBody).find((candidate) => {
    const name = String(candidate.name || candidate.Name || '').toLowerCase();
    return candidate.id && name !== 'admin' && !name.includes('admin');
  });

  if (!role?.id) {
    throw new Error('Unable to resolve a non-admin employee role for Academic Permission E2E');
  }

  return role.id;
}

async function employeeUserId(page: Page, fixture: ReturnType<typeof createEmployeeFixture>, created: any) {
  const employeeList = await getJson<any>(
    page,
    `/employees?page=1&pageSize=10&search=${encodeURIComponent(fixture.email)}`
  );
  const listedEmployee = asItems<any>(employeeList).find(
    (item) => String(item.email || item.Email).toLowerCase() === fixture.email.toLowerCase()
  );
  const userId =
    created.userId ||
    created.UserId ||
    listedEmployee?.userId ||
    listedEmployee?.UserId ||
    listedEmployee?.identityUserId ||
    listedEmployee?.IdentityUserId;
  if (!userId) {
    throw new Error('Created employee did not expose a userId for Academic Permission assignment');
  }

  return userId;
}

async function clearAcademicPermission(page: Page, userId: string) {
  const response = await employeeApiRequest(page, `/app/user-scope/revoke-user-scopes/${userId}`, {
    method: 'POST',
  });
  await expectOk(response, 'clear Academic Permission before UI parent-node regression');
}

async function assignParentMediumAccess(
  page: Page,
  userId: string,
  academicYearId: string,
  mediumId: string
) {
  const response = await employeeApiRequest(page, '/app/user-scope/bulk-assign', {
    method: 'POST',
    body: JSON.stringify({
      academicYearIds: [academicYearId],
      userIds: [userId],
      educationBoardIds: [],
      educationMediumIds: [mediumId],
      educationMediumStageIds: [],
      standardIds: [],
      divisionIds: [],
    }),
  });
  await expectOk(response, 'assign parent Academic Permission medium');
}

function mediumFromHierarchy(hierarchy: any, academicYearId: string, expectedMediumId: string) {
  const years = asItems<any>(hierarchy?.accessibleHierarchy || hierarchy?.AccessibleHierarchy);
  const year = years.find(
    (item) =>
      String(item.academicYearId || item.AcademicYearId || item.id || item.Id).toLowerCase() ===
      academicYearId.toLowerCase()
  );
  const boards = asItems<any>(year?.boards || year?.Boards);
  const mediumId = expectedMediumId.toLowerCase();
  const board = boards.find((candidate) =>
    asItems<any>(candidate.mediums || candidate.Mediums).some(
      (medium) => String(medium.mediumId || medium.MediumId).toLowerCase() === mediumId
    )
  );
  const medium = asItems<any>(board?.mediums || board?.Mediums).find(
    (candidate) => String(candidate.mediumId || candidate.MediumId).toLowerCase() === mediumId
  );

  if (!medium?.mediumId && !medium?.MediumId) {
    throw new Error(
      `Unable to resolve Academic Permission parent medium ${expectedMediumId} from hierarchy: ${JSON.stringify(
        hierarchy
      ).slice(0, 1_500)}`
    );
  }

  return {
    board,
    medium,
    mediumId: medium.mediumId || medium.MediumId,
  };
}

async function expectBelow(referenceLocator: Locator, targetLocator: Locator) {
  const referenceBox = await referenceLocator.boundingBox();
  const targetBox = await targetLocator.boundingBox();

  expect(referenceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();

  if (!referenceBox || !targetBox) {
    throw new Error('Unable to measure payroll field layout');
  }

  expect(targetBox.y).toBeGreaterThanOrEqual(referenceBox.y + referenceBox.height - 1);
}

async function mediumParentCheckbox(page: Page, index = 0) {
  const mediumChips = page.getByText('mediums', { exact: true });
  await expect(mediumChips.first()).toBeVisible({ timeout: 20_000 });
  const mediumChipCount = await mediumChips.count();
  if (index >= mediumChipCount) {
    throw new Error('Unable to find an Academic Permission medium parent node');
  }

  const mediumChip = mediumChips.nth(index);
  return mediumChip.locator('xpath=preceding::input[@type="checkbox"][1]');
}

async function firstCheckedMediumParentCheckbox(page: Page, index = 0): Promise<Locator | undefined> {
  const mediumChips = page.getByText('mediums', { exact: true });
  await expect(mediumChips.first()).toBeVisible({ timeout: 30_000 });
  const mediumChipCount = await mediumChips.count();
  if (index >= mediumChipCount) {
    return undefined;
  }

  const checkbox = await mediumParentCheckbox(page, index);
  if (!(await checkbox.isChecked())) {
    return firstCheckedMediumParentCheckbox(page, index + 1);
  }

  return checkbox;
}

async function firstUncheckedMediumParentCheckbox(
  page: Page,
  index = 0
): Promise<Locator | undefined> {
  const mediumChips = page.getByText('mediums', { exact: true });
  await expect(mediumChips.first()).toBeVisible({ timeout: 30_000 });
  const mediumChipCount = await mediumChips.count();
  if (index >= mediumChipCount) {
    return undefined;
  }

  const checkbox = await mediumParentCheckbox(page, index);
  if (await checkbox.isChecked()) {
    return firstUncheckedMediumParentCheckbox(page, index + 1);
  }

  return checkbox;
}

async function clickWizardStep(page: Page, name: string) {
  const stepControl = page
    .locator('.MuiStepButton-root, .MuiStepLabel-root')
    .filter({ hasText: name })
    .first();
  if (await stepControl.isVisible().catch(() => false)) {
    await stepControl.click();
  } else {
    await page.getByText(name, { exact: true }).click();
  }
  const alertDialog = page.getByRole('dialog', { name: /Alert/i });
  if (await alertDialog.isVisible().catch(() => false)) {
    await alertDialog.getByRole('button', { name: /^Yes$/i }).click();
    await expect(alertDialog).toBeHidden();
  }
}

async function closeNotifications(page: Page) {
  const notificationButtons = page
    .getByRole('region', { name: /Notifications/i })
    .getByRole('button');
  const notificationButtonCount = await notificationButtons.count().catch(() => 0);
  await Promise.all(
    Array.from({ length: notificationButtonCount }, (_, index) =>
      notificationButtons.nth(index).click({ force: true }).catch(() => undefined)
    )
  );
}

async function submitAndCaptureBulkAssign(page: Page) {
  await closeNotifications(page);
  const button = page.getByRole('button', { name: /^Submit$/i });
  await expect(button).toBeEnabled({ timeout: 20_000 });
  await expect
    .poll(
      () => page.evaluate(() => document.querySelector('form')?.checkValidity() ?? false),
      { timeout: 5_000 }
    )
    .toBe(true);

  const requestPromise = page.waitForRequest(
    (request) =>
      request.url().includes('/api/app/user-scope/bulk-assign') && request.method() === 'POST'
  );
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/app/user-scope/bulk-assign') &&
      response.request().method() === 'POST'
  );

  await button.click();
  return {
    request: await requestPromise,
    response: await responsePromise,
  };
}

async function prepareAndCheckMediumParentNode(page: Page) {
  const checkbox = await firstUncheckedMediumParentCheckbox(page);
  if (!checkbox) {
    throw new Error(
      'Expected at least one unchecked Academic Permission medium parent after clearing access.'
    );
  }

  await checkbox.check({ force: true });
  await expect(checkbox).toBeChecked();
}

test.describe('HR Employee edit stepper', () => {
  test('4762 parent Academic Permission medium payload saves and reads back full child access', async ({
    page,
  }) => {
    await page.goto('/dashboard/');

    const fixture = createEmployeeFixture('Parent Academic Permission');
    const roleId = await firstNonAdminRoleId(page);
    const employee = await createEmployeeFromExistingDefaults(page, fixture, { roleId });
    const userId = await employeeUserId(page, fixture, employee);

    const academicYear = await currentAcademicYear(page);
    const { mediumId } = await firstMediumFromAcademicSetup(page, academicYear.id);
    const payload = {
      academicYearIds: [academicYear.id],
      userIds: [userId],
      educationBoardIds: [],
      educationMediumIds: [mediumId],
      educationMediumStageIds: [],
      standardIds: [],
      divisionIds: [],
      description: `E2E parent Academic Permission ${Date.now()}`,
    };

    const response = await employeeApiRequest(page, '/app/user-scope/bulk-assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await expectOk(response, 'save parent Academic Permission medium payload');
    const result = await response.json();
    expect(result.affectedUserIds || result.AffectedUserIds || []).toContain(userId);

    const hierarchyAfter = await getJson<any>(
      page,
      `/app/user-scope/user-scope-hierarchy?userId=${userId}&academicYearId=${academicYear.id}`
    );
    const { medium } = mediumFromHierarchy(hierarchyAfter, academicYear.id, mediumId);
    const hasFullMediumStageAccess =
      medium.hasFullMediumStageAccess ?? medium.HasFullMediumStageAccess;
    if (hasFullMediumStageAccess !== true) {
      throw new Error(
        `Expected parent medium to read back as full child access. Medium=${JSON.stringify(
          medium
        )} Hierarchy=${JSON.stringify(hierarchyAfter).slice(0, 1_500)}`
      );
    }
    expect(asItems(medium.mediumStages || medium.MediumStages)).toHaveLength(0);
  });

  test('updates personal info and saves a parent Academic Permission node', async ({
    page,
  }) => {
    const employee = createEmployeeFixture('E2E HR EDIT');
    await page.goto('/dashboard/');
    const roleId = await firstNonAdminRoleId(page);
    const createdEmployee = await createEmployeeFromExistingDefaults(page, employee, { roleId });
    const userId = await employeeUserId(page, employee, createdEmployee);
    await clearAcademicPermission(page, userId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await page.route('**/api/employees/*/personal-info', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }

      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({ response, json: { ...body, panNo: '', adharNo: '' } });
    });
    await openFirstRowEdit(page);

    await fillTextByLabel(page, 'Middle Name', `Auto ${employee.suffix.slice(-4)}`);
    await fillTextByLabel(page, 'Area', `Automation Road ${employee.suffix.slice(-4)}`);
    const personalInfoRequestPromise = page.waitForRequest(
      (request) =>
        /\/api\/employees\/[^/]+\/personal-info/.test(request.url()) &&
        request.method() === 'PUT'
    );
    const personalInfoResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/employees\/[^/]+\/personal-info/.test(response.url()) &&
        response.request().method() === 'PUT'
    );
    await saveStep(page);
    const personalInfoRequest = await personalInfoRequestPromise;
    const personalInfoResponse = await personalInfoResponsePromise;
    expect(personalInfoResponse.ok()).toBe(true);
    const personalInfoPayload = JSON.parse(personalInfoRequest.postData() || '{}');
    expect(personalInfoPayload.panNo).toBeUndefined();
    expect(personalInfoPayload.adharNo).toBeUndefined();

    await clickWizardStep(page, 'Academic Permission');
    await prepareAndCheckMediumParentNode(page);
    const { request: accessControlRequest, response: accessControlResponse } =
      await submitAndCaptureBulkAssign(page);

    expect(accessControlResponse.ok()).toBe(true);
    const payload = JSON.parse(accessControlRequest.postData() || '{}');
    expect(payload.educationMediumIds?.length).toBeGreaterThan(0);
    expect(payload.educationBoardIds || []).toEqual([]);
    expect(payload.educationMediumStageIds || []).toEqual([]);
    expect(payload.clearExisting).toBe(false);
    await expect(page.getByText(/Failed to save employee details/i)).toHaveCount(0);
  });

  test('submits existing parent Academic Permission access as parent-only payload', async ({
    page,
  }) => {
    const employee = createEmployeeFixture('E2E HR EXISTING PERM');
    await page.goto('/dashboard/');
    const roleId = await firstNonAdminRoleId(page);
    const createdEmployee = await createEmployeeFromExistingDefaults(page, employee, { roleId });
    const userId = await employeeUserId(page, employee, createdEmployee);
    const academicYear = await currentAcademicYear(page);
    const { mediumId } = await firstMediumFromAcademicSetup(page, academicYear.id);
    await assignParentMediumAccess(page, userId, academicYear.id, mediumId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await openFirstRowEdit(page);
    await clickWizardStep(page, 'Academic Permission');

    const { request: accessControlRequest, response: accessControlResponse } =
      await submitAndCaptureBulkAssign(page);

    expect(accessControlResponse.ok()).toBe(true);
    const payload = JSON.parse(accessControlRequest.postData() || '{}');
    expect(payload.educationMediumIds).toEqual([mediumId]);
    expect(payload.educationBoardIds || []).toEqual([]);
    expect(payload.educationMediumStageIds || []).toEqual([]);
    expect(payload.standardIds || []).toEqual([]);
    expect(payload.divisionIds || []).toEqual([]);
    expect(payload.clearExisting).toBe(false);
    await expect(page.getByText(/Failed to save employee details/i)).toHaveCount(0);
  });

  test('clears empty Academic Permission selection with clearExisting', async ({ page }) => {
    const employee = createEmployeeFixture('E2E HR EMPTY PERM');
    await page.goto('/dashboard/');
    const roleId = await firstNonAdminRoleId(page);
    const createdEmployee = await createEmployeeFromExistingDefaults(page, employee, { roleId });
    const userId = await employeeUserId(page, employee, createdEmployee);
    const academicYear = await currentAcademicYear(page);
    const { mediumId } = await firstMediumFromAcademicSetup(page, academicYear.id);
    await assignParentMediumAccess(page, userId, academicYear.id, mediumId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await openFirstRowEdit(page);
    await clickWizardStep(page, 'Academic Permission');

    const checkbox = await firstCheckedMediumParentCheckbox(page);
    if (!checkbox) {
      throw new Error('Expected a checked Academic Permission medium parent to clear.');
    }
    await checkbox.uncheck({ force: true });
    await expect(checkbox).not.toBeChecked();

    const { request: accessControlRequest, response: accessControlResponse } =
      await submitAndCaptureBulkAssign(page);

    expect(accessControlResponse.ok()).toBe(true);
    const payload = JSON.parse(accessControlRequest.postData() || '{}');
    expect(payload.educationBoardIds || []).toEqual([]);
    expect(payload.educationMediumIds || []).toEqual([]);
    expect(payload.educationMediumStageIds || []).toEqual([]);
    expect(payload.standardIds || []).toEqual([]);
    expect(payload.divisionIds || []).toEqual([]);
    expect(payload.clearExisting).toBe(true);
    await expect(page.getByText(/Failed to save employee details/i)).toHaveCount(0);
  });

  test('validates work experience date ordering and payroll bank fields', async ({ page }) => {
    await gotoEmployeeList(page);
    await openFirstRowEdit(page);

    await clickWizardStep(page, 'Work Experience');
    await page.getByRole('button', { name: /Add/i }).first().click();
    await fillTextByLabel(page, 'Organization Name', `Invalid Dates ${Date.now()}`);
    await fillDate(page, 'Start Date', '01-04-2024');
    await fillDate(page, 'End Date', '01-04-2023');
    await saveStep(page);
    await expect(page.getByText(/End Date must be greater than start date/i)).toBeVisible();

    await clickWizardStep(page, 'Payroll');
    await fillTextByLabel(page, 'Account Number', 'ABC');
    await fillTextByLabel(page, 'IFSC', 'BAD');
    await saveStep(page);
    await expect(page.getByText(/Account number must contain only digits/i)).toBeVisible();
    const ifscInput = page.getByLabel('IFSC', { exact: false }).first();
    const ifscError = page.getByText(/IFSC code must follow/i).first();
    await expect(ifscError).toBeVisible();
    await expectBelow(ifscInput, ifscError);

    const saveButton = page.getByRole('button', { name: /^Save$/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click({ trial: true });
  });
});
