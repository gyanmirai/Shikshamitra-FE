/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type Page, type Locator } from '@playwright/test';

import { createEmployeeFixture } from './employee-fixtures';
import {
  employeeApiRequest,
  getEmployeeOnboardingRoleId,
  createEmployeeFromExistingDefaults,
} from './employee-api';
import {
  fillDate,
  saveStep,
  searchEmployee,
  fillTextByLabel,
  gotoEmployeeList,
  openFirstRowEdit,
} from './employee-page';

function asItems<T = Record<string, any>>(body: any): T[] {
  const payload = body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.Items)) return payload.Items;
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

async function academicYears(page: Page) {
  const body = await getJson<any>(page, '/app/academic-year?Sorting=name');
  const years = asItems<any>(body)
    .map(toAcademicYear)
    .filter((year) => year?.id);

  if (!years.length) {
    throw new Error('Unable to resolve academic years for Academic Permission E2E');
  }

  return years;
}

function pickCurrentAcademicYear(years: any[]) {
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
  const boardAcademicYearId =
    board?.academicYearId ||
    board?.academicYear?.id ||
    board?.AcademicYearId ||
    board?.AcademicYear?.Id;
  return (
    !boardAcademicYearId ||
    String(boardAcademicYearId).toLowerCase() === academicYearId.toLowerCase()
  );
}

function optionValue(item: any, ...keys: string[]) {
  const matchedValue = keys
    .map((key) => key.split('.').reduce((current, part) => current?.[part], item))
    .find(Boolean);
  return matchedValue ? String(matchedValue) : undefined;
}

async function firstMediumFromOrganizationOptions(page: Page, academicYearId: string) {
  const body = await getJson<any>(
    page,
    `/app/academic-organization-options?academicYearId=${academicYearId}`
  );
  const option = asItems<any>(body).find(
    (item) =>
      optionValue(item, 'mediumId', 'academicMediumId', 'educationMediumId', 'medium.id') &&
      optionValue(item, 'boardId', 'academicBoardId', 'educationBoardId', 'board.id')
  );
  const boardId = optionValue(option, 'boardId', 'academicBoardId', 'educationBoardId', 'board.id');
  const mediumId = optionValue(
    option,
    'mediumId',
    'academicMediumId',
    'educationMediumId',
    'medium.id'
  );

  return boardId && mediumId
    ? {
        boardId,
        mediumId,
        board: { id: boardId },
        medium: { id: mediumId, educationBoardId: boardId },
      }
    : null;
}

async function firstMediumFromAcademicSetup(page: Page, academicYearId: string) {
  const optionsMedium = await firstMediumFromOrganizationOptions(page, academicYearId);
  if (optionsMedium) {
    return optionsMedium;
  }

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
  const board = boardsById.get(
    String(medium.educationBoardId || medium.EducationBoardId || '').toLowerCase()
  );
  const boardId = board?.id || medium.educationBoardId || medium.EducationBoardId;
  if (!boardId) {
    throw new Error('Unable to resolve a board for the Academic Permission parent medium');
  }

  return {
    board,
    boardId,
    medium,
    mediumId: medium.id,
  };
}

async function firstConfiguredAcademicMedium(page: Page) {
  const years = await academicYears(page);
  const currentYear = pickCurrentAcademicYear(years);
  const yearsToProbe = [
    currentYear,
    ...years.filter(
      (year) => String(year.id).toLowerCase() !== String(currentYear.id).toLowerCase()
    ),
  ];
  let lastScopeError: unknown;

  for (const academicYear of yearsToProbe) {
    try {
      return {
        academicYear,
        ...(await firstMediumFromAcademicSetup(page, academicYear.id)),
      };
    } catch (error) {
      lastScopeError = error;
    }
  }

  throw lastScopeError instanceof Error
    ? lastScopeError
    : new Error('Unable to resolve an Academic Permission parent medium from academic setup');
}

type AcademicMediumSelection = Awaited<ReturnType<typeof firstConfiguredAcademicMedium>>;

async function primeAcademicSelection(page: Page, selection: AcademicMediumSelection) {
  const state = {
    currentYear: selection.academicYear,
    currentBoard: {
      id: selection.boardId,
      name: optionValue(selection.board, 'name', 'Name', 'boardName') || '',
    },
    currentMedium: {
      id: selection.mediumId,
      name: optionValue(selection.medium, 'name', 'Name', 'mediumName') || '',
      educationMediumStages: [],
    },
  };
  const writeState = (nextState: typeof state) => {
    window.localStorage.setItem(
      'persist:root',
      JSON.stringify({
        globalState: JSON.stringify(nextState),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      })
    );
    window.localStorage.setItem('onboarding_completed', 'true');
  };

  await page.addInitScript(writeState, state);
  await page.evaluate(writeState, state).catch(() => undefined);
}

async function firstNonAdminRoleId(page: Page) {
  return getEmployeeOnboardingRoleId(page);
}

async function firstShiftId(page: Page) {
  const shiftsBody = await getJson<any>(page, '/app/shift-management');
  const shift = asItems<any>(shiftsBody).find((candidate) => candidate?.id);

  if (!shift?.id) {
    throw new Error('Unable to resolve an employee shift for edit-stepper E2E');
  }

  return shift.id as string;
}

async function employeeUserId(
  page: Page,
  fixture: ReturnType<typeof createEmployeeFixture>,
  created: any
) {
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
  boardId: string,
  mediumId: string
) {
  const response = await employeeApiRequest(page, '/app/user-scope/bulk-assign', {
    method: 'POST',
    body: JSON.stringify({
      academicYearId,
      userIds: [userId],
      scopes: [
        {
          educationBoardId: boardId,
          educationMediumId: mediumId,
        },
      ],
      clearExisting: false,
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

async function firstCheckedMediumParentCheckbox(
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
    await stepControl.click({ force: true, timeout: 120_000 });
  } else {
    await page.getByText(name, { exact: true }).click({ force: true });
  }
  const alertDialog = page.getByRole('dialog', { name: /Alert/i });
  if (await alertDialog.isVisible().catch(() => false)) {
    await alertDialog.getByRole('button', { name: /^Yes$/i }).click();
    await expect(alertDialog).toBeHidden();
  }
}

async function waitForEmployeeFormIdle(page: Page) {
  await expect(page.getByText('Saving...')).toHaveCount(0, { timeout: 120_000 });
}

async function advanceToAcademicPermissionStep(page: Page) {
  await closeNotifications(page);
  await clickWizardStep(page, 'Academic Permission');

  await expect(page.getByText('Academic Permission', { exact: true }).first()).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText('mediums', { exact: true }).first()).toBeVisible({ timeout: 30_000 });
}

async function closeNotifications(page: Page) {
  const closeButtons = page
    .getByRole('region', { name: /Notifications/i })
    .getByRole('button', { name: /close/i });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const count = await closeButtons.count().catch(() => 0);
    if (count === 0) {
      break;
    }

    await closeButtons
      .first()
      .click({ force: true })
      .catch(() => undefined);
  }
}

async function submitAndCaptureBulkAssign(page: Page) {
  await closeNotifications(page);
  const button = page.getByRole('button', { name: /^Submit$/i });
  await expect(button).toBeEnabled({ timeout: 20_000 });
  await expect
    .poll(() => page.evaluate(() => document.querySelector('form')?.checkValidity() ?? false), {
      timeout: 5_000,
    })
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

    const { academicYear, boardId, mediumId } = await firstConfiguredAcademicMedium(page);
    const payload = {
      academicYearId: academicYear.id,
      userIds: [userId],
      scopes: [
        {
          educationBoardId: boardId,
          educationMediumId: mediumId,
        },
      ],
      clearExisting: false,
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

  test('updates personal info and saves a parent Academic Permission node', async ({ page }) => {
    test.setTimeout(300_000);

    const employee = createEmployeeFixture('E2E HR EDIT');
    await page.goto('/dashboard/');
    const roleId = await firstNonAdminRoleId(page);
    const shiftId = await firstShiftId(page);
    const createdEmployee = await createEmployeeFromExistingDefaults(page, employee, {
      roleId,
      shiftId,
    });
    const userId = await employeeUserId(page, employee, createdEmployee);
    const academicSelection = await firstConfiguredAcademicMedium(page);
    await primeAcademicSelection(page, academicSelection);
    const { academicYear, boardId, mediumId } = academicSelection;
    await assignParentMediumAccess(page, userId, academicYear.id, boardId, mediumId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await page.route('**/api/employees/*/personal-info', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }

      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({
        response,
        json: {
          ...body,
          dob: body.dob ?? body.dateOfBirth ?? '1990-01-01',
          doj: body.doj ?? body.dateOfJoining ?? '2024-06-01',
          familyCaste: body.familyCaste || employee.familyCaste,
          casteType: body.casteType ?? body.castType ?? 0,
          gender: body.gender ?? body.genderType ?? 1,
          religion: 0,
          maritalStatus: body.maritalStatus ?? 0,
          roleId: body.roleId || roleId,
          address1: body.address1 || body.addressLine1 || employee.addressLine1,
          address2: body.address2 || body.addressLine2 || employee.addressLine2,
          address3: body.address3 || body.addressLine3 || employee.addressLine3,
          country: body.country?.name ? body.country : { name: 'India', isoCode: 'IN' },
          state: body.state?.name
            ? body.state
            : { name: 'Gujarat', isoCode: 'GJ', countryCode: 'IN' },
          city: body.city || employee.city,
          pinCode: body.pinCode || body.pincode || employee.pincode,
          shiftId: body.shiftId || shiftId,
          panNo: '',
          adharNo: '',
        },
      });
    });
    await openFirstRowEdit(page);
    await expect(
      page.getByRole('textbox', { name: /Building No\.\/Flat\/House No\./i })
    ).toHaveValue(employee.addressLine1);

    const middleNameInput = page.locator('input[name="middleName"]');
    const areaInput = page.locator('input[name="addressLine2"]');
    const updatedMiddleName = `Auto ${employee.lastName.slice(-4)}`;
    await areaInput.fill(`Automation Road ${employee.suffix.slice(-4)}`);
    await middleNameInput.fill(updatedMiddleName);
    await expect(middleNameInput).toHaveValue(updatedMiddleName);
    const personalInfoRequestPromise = page.waitForRequest(
      (request) =>
        /\/api\/employees\/[^/]+\/personal-info/.test(request.url()) && request.method() === 'PUT'
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
    expect(personalInfoPayload.middleName).toBe(updatedMiddleName);
    expect(personalInfoPayload.panNo).toBeUndefined();
    expect(personalInfoPayload.adharNo).toBeUndefined();
    await waitForEmployeeFormIdle(page);

    await clearAcademicPermission(page, userId);
    await advanceToAcademicPermissionStep(page);
    await prepareAndCheckMediumParentNode(page);
    const { request: accessControlRequest, response: accessControlResponse } =
      await submitAndCaptureBulkAssign(page);

    expect(accessControlResponse.ok()).toBe(true);
    const payload = JSON.parse(accessControlRequest.postData() || '{}');
    expect(payload.scopes?.length).toBeGreaterThan(0);
    expect(payload.scopes[0].educationBoardId).toBeTruthy();
    expect(payload.scopes[0].educationMediumId).toBeTruthy();
    expect(payload).not.toHaveProperty('educationBoardIds');
    expect(payload).not.toHaveProperty('educationMediumIds');
    expect(payload).not.toHaveProperty('educationMediumStageIds');
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
    const academicSelection = await firstConfiguredAcademicMedium(page);
    await primeAcademicSelection(page, academicSelection);
    const { academicYear, boardId, mediumId } = academicSelection;
    await assignParentMediumAccess(page, userId, academicYear.id, boardId, mediumId);

    await gotoEmployeeList(page);
    await searchEmployee(page, employee.email);
    await openFirstRowEdit(page);
    await clickWizardStep(page, 'Academic Permission');

    const { request: accessControlRequest, response: accessControlResponse } =
      await submitAndCaptureBulkAssign(page);

    expect(accessControlResponse.ok()).toBe(true);
    const payload = JSON.parse(accessControlRequest.postData() || '{}');
    expect(payload.scopes).toEqual([
      {
        educationBoardId: boardId,
        educationMediumId: mediumId,
      },
    ]);
    expect(payload).not.toHaveProperty('educationBoardIds');
    expect(payload).not.toHaveProperty('educationMediumIds');
    expect(payload).not.toHaveProperty('educationMediumStageIds');
    expect(payload).not.toHaveProperty('standardIds');
    expect(payload).not.toHaveProperty('divisionIds');
    expect(payload.clearExisting).toBe(false);
    await expect(page.getByText(/Failed to save employee details/i)).toHaveCount(0);
  });

  test('clears empty Academic Permission selection with clearExisting', async ({ page }) => {
    const employee = createEmployeeFixture('E2E HR EMPTY PERM');
    await page.goto('/dashboard/');
    const roleId = await firstNonAdminRoleId(page);
    const createdEmployee = await createEmployeeFromExistingDefaults(page, employee, { roleId });
    const userId = await employeeUserId(page, employee, createdEmployee);
    const academicSelection = await firstConfiguredAcademicMedium(page);
    await primeAcademicSelection(page, academicSelection);
    const { academicYear, boardId, mediumId } = academicSelection;
    await assignParentMediumAccess(page, userId, academicYear.id, boardId, mediumId);

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
    expect(payload.scopes || []).toEqual([]);
    expect(payload).not.toHaveProperty('educationBoardIds');
    expect(payload).not.toHaveProperty('educationMediumIds');
    expect(payload).not.toHaveProperty('educationMediumStageIds');
    expect(payload).not.toHaveProperty('standardIds');
    expect(payload).not.toHaveProperty('divisionIds');
    expect(payload.clearExisting).toBe(true);
    await expect(page.getByText(/Failed to save employee details/i)).toHaveCount(0);
  });

  test('validates work experience date ordering and payroll bank fields', async ({ page }) => {
    await gotoEmployeeList(page);
    await openFirstRowEdit(page);

    await clickWizardStep(page, 'Work Experience');
    await fillTextByLabel(page, 'Organization Name', `Invalid Dates ${Date.now()}`);
    await fillDate(page, 'Start Date', '01-04-2024');
    await fillDate(page, 'End Date', '01-04-2023');
    await saveStep(page);
    await expect(page.getByText(/End Date must be greater than start date/i)).toBeVisible();

    await clickWizardStep(page, 'Payroll');
    await fillTextByLabel(page, 'Account Number', '123');
    await fillTextByLabel(page, 'IFSC', 'BAD');
    await saveStep(page);
    await expect(page.getByText(/Account number must be at least 9 characters/i)).toBeVisible();
    const ifscInput = page.getByLabel('IFSC', { exact: false }).first();
    const ifscError = page.getByText(/IFSC code must follow/i).first();
    await expect(ifscError).toBeVisible();
    await expectBelow(ifscInput, ifscError);

    const saveButton = page.getByRole('button', { name: /^Save$/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click({ trial: true });
  });

  test('builds a payroll salary structure from the default template', async ({ page }) => {
    await page.route('**/payroll/salary-templates**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST' && request.url().includes('/calculate')) {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            templateId: 'template-1',
            templateVersionId: 'version-1',
            templateVersion: 1,
            salaryBasis: 'GROSS',
            quotedMonthlyAmount: 30000,
            grossSalary: 30000,
            basicSalary: 18000,
            totalDeductions: 2000,
            netSalary: 28000,
            employerContributionTotal: 1800,
            employerCost: 31800,
            earnings: [
              { componentId: 'basic-1', code: 'BASIC', name: 'Basic Salary', amount: 18000, semanticType: 'BASIC', formulaType: 'PERCENTAGE_OF_GROSS', isStatutory: false },
              { componentId: 'allowance-1', code: 'SPECIAL_ALLOWANCE', name: 'Special Allowance', amount: 12000, semanticType: 'BALANCING_EARNING', formulaType: 'REMAINDER_OF_GROSS', isStatutory: false },
            ],
            deductions: [
              { componentId: 'pf-1', code: 'EMPLOYEE_PF', name: 'Provident Fund', amount: 1800, semanticType: 'EMPLOYEE_PROVIDENT_FUND', formulaType: 'EMPLOYEE_PROVIDENT_FUND', isStatutory: true },
              { componentId: 'pt-1', code: 'PROFESSIONAL_TAX', name: 'Professional Tax', amount: 200, semanticType: 'PROFESSIONAL_TAX', formulaType: 'PROFESSIONAL_TAX', isStatutory: true },
            ],
            employerContributions: [],
            formulaTrace: [
              'Basic Salary = gross x 60% = 18000.00',
              'Special Allowance = gross remainder = 12000.00',
            ],
            warnings: [],
            pfRuleId: null,
            pfRuleVersion: null,
            professionalTaxProfile: 'IN-GJ',
            generatedAt: '2026-08-13T10:00:00Z',
          }),
        });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'template-1',
              name: 'Gujarat Standard Salary',
              description: 'Default Gujarat salary structure',
              status: 'PUBLISHED',
              isDefault: true,
              latestVersion: 1,
              publishedVersion: 1,
              latest: { id: 'version-1', versionNumber: 1, status: 'PUBLISHED', rules: [] },
              published: { id: 'version-1', versionNumber: 1, status: 'PUBLISHED', rules: [] },
            },
          ],
        }),
      });
    });

    await gotoEmployeeList(page);
    await openFirstRowEdit(page);
    await clickWizardStep(page, 'Payroll');

    await expect(page.getByText('Build salary structure', { exact: true })).toBeVisible();
    await page.getByLabel('Quoted monthly salary').fill('30000');
    const calculateButton = page.getByRole('button', { name: /^Calculate$/ });
    await expect(calculateButton).toBeEnabled();
    await calculateButton.click();

    await expect(page.getByText('Formula breakdown', { exact: true })).toBeVisible();
    await expect(page.getByText('Employer cost', { exact: true })).toBeVisible();
    await page.getByText('Formula breakdown', { exact: true }).click();
    await expect(page.getByText(/Basic Salary = gross x 60%/i)).toBeVisible();

    await page.getByLabel('Quoted monthly salary').fill('31000');
    await expect(page.getByRole('button', { name: /Apply to earnings and deductions/i })).toBeHidden();
    await page.getByLabel('Quoted monthly salary').fill('30000');
    await calculateButton.click();

    await page.getByRole('button', { name: /Apply to earnings and deductions/i }).click();
    await expect(page.getByText(/Rule controlled/i).first()).toBeVisible();
  });
});
