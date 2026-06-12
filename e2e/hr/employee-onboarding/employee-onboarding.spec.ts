/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type Browser, type Locator } from '@playwright/test';

import { employeeApiRequest } from '../employee/employee-api';
import {
  searchEmployee,
  gotoEmployeeList,
  dismissAcademicYearTour,
} from '../employee/employee-page';

const EmployeeApplicationStatus = {
  InvitationSent: 0,
  Applied: 1,
  ReadyForOnboarding: 5,
  Finalized: 6,
} as const;

const onboardingPermissions = [
  'HR.Employee.EmployeeOnboarding',
  'HR.Employee.EmployeeOnboarding.View',
  'HR.Employee.EmployeeOnboarding.Add',
  'HR.Employee.EmployeeOnboarding.Edit',
  'HR.Employee.EmployeeOnboarding.Delete',
  'HR.Employee.EmployeeOnboarding.Finalize',
];

type CandidateFixture = ReturnType<typeof createCandidateFixture>;

type InviteResponse = {
  token: string;
  publicPath: string;
  tokenExpiresAt: string;
  application: {
    id: string;
    status: number | string;
    email?: string;
  };
};

const appBaseUrl = () => process.env.E2E_BASE_URL || 'http://localhost:3000';

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }

  return url.replace(/\/$/, '');
};

const randomSuffix = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const alphaSuffix = (value: string) =>
  value
    .split('')
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join('');

function createCandidateFixture(prefix = 'Onboard Candidate') {
  const suffix = randomSuffix();
  const nameSuffix = alphaSuffix(suffix);

  return {
    suffix,
    firstName: prefix,
    middleName: 'Auto',
    lastName: nameSuffix,
    fullName: `${prefix} Auto ${nameSuffix}`,
    email: `e2e.hr.onboarding.${suffix}@ddvs.test`,
    mobileNo: `9${suffix.slice(-9).padStart(9, '0')}`,
    secondaryMobileNo: `8${suffix.slice(-9).padStart(9, '1')}`,
    panNo: `ABCDE${suffix.slice(-4).padStart(4, '0')}F`,
    adharNo: `900${suffix.slice(-9).padStart(9, '0')}`,
    positionAppliedFor: 'Mathematics Teacher',
    departmentAppliedFor: 'Academics',
    dateOfBirth: '1990-01-01',
    religion: 'Hindu',
    familyCaste: 'General',
    qualificationSummary: `M.Sc Mathematics with B.Ed automation ${suffix}`,
    skillsSummary: `Algebra, classroom management, lesson planning ${suffix}`,
    address1: 'E2E House 1',
    address2: 'Automation Road',
    address3: 'Regression Area',
    countryName: 'India',
    countryIsoCode: 'IN',
    stateName: 'Gujarat',
    stateIsoCode: 'GJ',
    city: 'Ahmedabad',
    pinCode: '380001',
    resumeName: `onboarding-resume-${suffix}.pdf`,
    photoName: `onboarding-photo-${suffix}.png`,
    experience: {
      organization: `Previous School ${suffix}`,
      designation: 'Math Faculty',
      department: 'Academics',
      city: 'Surat',
      startDate: '2020-04-01',
      endDate: '2023-03-31',
    },
  };
}

function isStatus(value: unknown, expected: number) {
  if (typeof value === 'number') return value === expected;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value) === expected;
  return (
    String(value).toLowerCase() ===
    Object.keys(EmployeeApplicationStatus)
      .find(
        (key) =>
          EmployeeApplicationStatus[key as keyof typeof EmployeeApplicationStatus] === expected
      )
      ?.toLowerCase()
  );
}

function expectOk(response: Awaited<ReturnType<typeof employeeApiRequest>>, label: string) {
  expect(response.ok(), `${label}: ${response.status()}`).toBe(true);
}

async function jsonFrom(response: Awaited<ReturnType<typeof employeeApiRequest>>, label: string) {
  expectOk(response, label);
  return response.json();
}

async function fieldByLabel(scope: Page | Locator, label: string) {
  const exactField = scope.getByLabel(label, { exact: true });
  if (await exactField.count()) {
    return exactField.first();
  }

  return scope.getByLabel(label, { exact: false }).first();
}

async function fillField(scope: Page | Locator, label: string, value: string) {
  await (await fieldByLabel(scope, label)).fill(value);
}

async function selectControlByLabel(scope: Page | Locator, label: string) {
  const exactField = scope.getByLabel(label, { exact: true });
  if (await exactField.count()) {
    return exactField.first();
  }

  const namedCombobox = scope.getByRole('combobox', { name: label, exact: true });
  if (await namedCombobox.count()) {
    return namedCombobox.first();
  }

  const fuzzyField = scope.getByLabel(label, { exact: false });
  if (await fuzzyField.count()) {
    return fuzzyField.first();
  }

  const comboboxes = scope.getByRole('combobox');
  if ((await comboboxes.count()) === 1) {
    return comboboxes.first();
  }

  throw new Error(`Unable to resolve select control "${label}".`);
}

async function selectOption(
  page: Page,
  scope: Page | Locator,
  label: string,
  optionName: string | RegExp
) {
  await (await selectControlByLabel(scope, label)).click();
  await page.getByRole('option', { name: optionName }).first().click();
}

async function selectFirstOption(page: Page, scope: Locator, label: string) {
  const field = await selectControlByLabel(scope, label);
  await expect(field).toBeEnabled({ timeout: 30_000 });
  await field.click();
  await page.getByRole('option').first().click();
}

async function gotoOnboarding(page: Page) {
  await page.addInitScript(() => localStorage.setItem('onboarding_completed', 'true'));
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: appBaseUrl(),
  });
  await page.goto('/hr/employee/onboarding', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('employee-onboarding-page')).toBeVisible({ timeout: 45_000 });
  await dismissAcademicYearTour(page);
  await ensureOnboardingPermissions(page);
}

async function ensureOnboardingPermissions(page: Page) {
  const response = await employeeApiRequest(
    page,
    '/permission-management/permissions?providerName=R&providerKey=admin',
    {
      method: 'PUT',
      body: JSON.stringify({
        permissions: onboardingPermissions.map((name) => ({ name, isGranted: true })),
      }),
    }
  );

  expect(response.ok(), `grant onboarding permissions: ${response.status()}`).toBe(true);
}

async function createInviteThroughUi(page: Page, candidate: CandidateFixture) {
  await page.getByTestId('employee-onboarding-create-invite').click();
  const dialog = page.getByTestId('employee-onboarding-invite-dialog');
  await expect(dialog).toBeVisible();

  await fillField(dialog, 'First name', candidate.firstName);
  await fillField(dialog, 'Middle name', candidate.middleName);
  await fillField(dialog, 'Last name', candidate.lastName);
  await fillField(dialog, 'Email', candidate.email);
  await fillField(dialog, 'Mobile no.', candidate.mobileNo);
  await fillField(dialog, 'Position', candidate.positionAppliedFor);
  await fillField(dialog, 'Department', candidate.departmentAppliedFor);

  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/employee-applications') &&
      response.request().method() === 'POST' &&
      !response.url().includes('/finalize') &&
      !response.url().includes('/regenerate-link')
  );
  await dialog.getByRole('button', { name: /Create link/i }).click();
  const createResponse = await createResponsePromise;
  if (!createResponse.ok()) {
    throw new Error(`create invite: ${createResponse.status()} ${await createResponse.text()}`);
  }

  const invite = (await createResponse.json()) as InviteResponse;
  expect(invite.token).toBeTruthy();
  expect(invite.publicPath).toContain('/employee-application/');
  expect(invite.application.id).toBeTruthy();

  await expect(dialog).toBeHidden({ timeout: 20_000 });
  return invite;
}

async function searchApplication(page: Page, search: string) {
  const filters = page.getByTestId('employee-onboarding-filters');
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/employee-applications') && response.request().method() === 'GET'
  );
  await filters.getByLabel('Search', { exact: false }).fill(search);
  await responsePromise.catch(() => undefined);
}

async function filterApplicationsByStatus(page: Page, statusLabel: string) {
  const filters = page.getByTestId('employee-onboarding-filters');
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/employee-applications') && response.request().method() === 'GET'
  );
  await filters.getByRole('combobox').click();
  await page.getByRole('option', { name: statusLabel, exact: true }).click();
  await responsePromise.catch(() => undefined);
}

function applicationRow(page: Page, candidate: CandidateFixture) {
  return page.getByTestId('employee-onboarding-row').filter({ hasText: candidate.email });
}

async function openApplicationDetails(page: Page, candidate: CandidateFixture) {
  const row = applicationRow(page, candidate);
  await expect(row).toBeVisible({ timeout: 30_000 });
  await row.getByTestId('employee-onboarding-row-details').click();
  const drawer = page.getByTestId('employee-onboarding-detail-drawer');
  await expect(drawer).toBeVisible();
  return drawer;
}

async function closeDrawer(page: Page) {
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('employee-onboarding-detail-drawer')).toBeHidden({
    timeout: 10_000,
  });
}

async function withAnonymousPage(
  browser: Browser,
  callback: (anonymousPage: Page) => Promise<void>
) {
  const context = await browser.newContext({
    baseURL: appBaseUrl(),
    ignoreHTTPSErrors: true,
  });
  const anonymousPage = await context.newPage();

  try {
    await callback(anonymousPage);
  } finally {
    await context.close();
  }
}

async function fillPublicApplication(page: Page, candidate: CandidateFixture) {
  const form = page.getByTestId('employee-application-public-form');
  await expect(form).toBeVisible({ timeout: 45_000 });

  await fillField(form, 'First name', candidate.firstName);
  await fillField(form, 'Middle name', candidate.middleName);
  await fillField(form, 'Last name', candidate.lastName);
  await fillField(form, 'Email', candidate.email);
  await fillField(form, 'Mobile no.', candidate.mobileNo);
  await fillField(form, 'Secondary mobile no.', candidate.secondaryMobileNo);
  await fillField(form, 'Date of birth', candidate.dateOfBirth);
  await selectOption(page, form, 'Gender', 'Male');
  await selectOption(page, form, 'Category', 'General');
  await fillField(form, 'Religion', candidate.religion);
  await fillField(form, 'Family caste', candidate.familyCaste);
  await selectOption(page, form, 'Marital status', 'Unmarried');
  await fillField(form, 'Position', candidate.positionAppliedFor);
  await fillField(form, 'Department', candidate.departmentAppliedFor);
  await fillField(form, 'Qualification summary', candidate.qualificationSummary);
  await fillField(form, 'Skills summary', candidate.skillsSummary);
  await fillField(form, 'Address line 1', candidate.address1);
  await fillField(form, 'Address line 2', candidate.address2);
  await fillField(form, 'Country', candidate.countryName);
  await form.getByLabel('Code', { exact: true }).nth(0).fill(candidate.countryIsoCode);
  await fillField(form, 'State', candidate.stateName);
  await form.getByLabel('Code', { exact: true }).nth(1).fill(candidate.stateIsoCode);
  await fillField(form, 'City', candidate.city);
  await fillField(form, 'Pin code', candidate.pinCode);

  await form.getByRole('button', { name: /Add experience/i }).click();
  await fillField(form, 'Organization', candidate.experience.organization);
  await fillField(form, 'Designation', candidate.experience.designation);
  await form
    .getByLabel('Department', { exact: false })
    .last()
    .fill(candidate.experience.department);
  await form.getByLabel('City', { exact: false }).last().fill(candidate.experience.city);
  await fillField(form, 'Start', candidate.experience.startDate);
  await fillField(form, 'End', candidate.experience.endDate);
}

async function uploadValidPublicFiles(page: Page, candidate: CandidateFixture) {
  await page.getByTestId('employee-application-resume-input').setInputFiles({
    name: candidate.resumeName,
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'),
  });
  await page.getByTestId('employee-application-photo-input').setInputFiles({
    name: candidate.photoName,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lN8mxQAAAABJRU5ErkJggg==',
      'base64'
    ),
  });
}

function duplicatePublicSubmitPayload(candidate: CandidateFixture) {
  return {
    firstName: candidate.firstName,
    middleName: candidate.middleName,
    lastName: candidate.lastName,
    email: candidate.email,
    mobileNo: candidate.mobileNo,
    positionAppliedFor: candidate.positionAppliedFor,
    departmentAppliedFor: candidate.departmentAppliedFor,
  };
}

async function submitPublicApplication(page: Page) {
  await page.getByTestId('employee-application-submit').click();
  await expect(page.getByTestId('employee-application-submit-success')).toBeVisible({
    timeout: 45_000,
  });
}

async function updateStatusToReady(page: Page, drawer: Locator, applicationId: string) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/employee-applications/${applicationId}/status`) &&
      response.request().method() === 'PUT'
  );
  await selectOption(page, drawer, 'Status', 'Ready for onboarding');
  await drawer.getByRole('button', { name: /^Update$/i }).click();
  const response = await responsePromise;
  expect(response.ok(), `status update: ${response.status()}`).toBe(true);
}

async function finalizeApplication(page: Page, candidate: CandidateFixture, applicationId: string) {
  const row = applicationRow(page, candidate);
  await row.getByTestId('employee-onboarding-row-finalize').click();

  const dialog = page.getByTestId('employee-onboarding-finalize-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(candidate.email);
  await expect(dialog).toContainText(candidate.mobileNo);

  await dialog.getByRole('button', { name: /^Next$/i }).click();
  await expect(dialog.getByLabel('First name', { exact: false })).toHaveValue(candidate.firstName);
  await expect(dialog.getByLabel('Last name', { exact: false })).toHaveValue(candidate.lastName);
  await expect(dialog.getByLabel('Email', { exact: false })).toHaveValue(candidate.email);

  await fillField(dialog, 'PAN', candidate.panNo);
  await fillField(dialog, 'Aadhaar no.', candidate.adharNo);
  await fillField(dialog, 'Joining date', '2024-06-01');
  await selectFirstOption(page, dialog, 'Role');
  await selectFirstOption(page, dialog, 'Shift');
  await fillField(dialog, 'Address line 1', candidate.address1);
  await fillField(dialog, 'Address line 2', candidate.address2);
  await fillField(dialog, 'Country', candidate.countryName);
  await fillField(dialog, 'Country code', candidate.countryIsoCode);
  await fillField(dialog, 'State', candidate.stateName);
  await fillField(dialog, 'State code', candidate.stateIsoCode);
  await fillField(dialog, 'City', candidate.city);
  await fillField(dialog, 'Pin code', candidate.pinCode);

  await dialog.getByRole('button', { name: /^Next$/i }).click();
  await expect(dialog.getByLabel('Use submitted photo as profile picture')).toBeChecked();
  await expect(dialog.getByLabel('Attach submitted resume to employee documents')).toBeChecked();

  const finalizeRequestPromise = page.waitForRequest(
    (request) =>
      request.url().includes(`/api/employee-applications/${applicationId}/finalize`) &&
      request.method() === 'POST'
  );
  const finalizeResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/employee-applications/${applicationId}/finalize`) &&
      response.request().method() === 'POST'
  );
  await dialog.getByRole('button', { name: /^Finalize$/i }).click();

  const finalizeRequest = await finalizeRequestPromise;
  const finalizeResponse = await finalizeResponsePromise;
  expect(finalizeResponse.ok(), `finalize: ${finalizeResponse.status()}`).toBe(true);
  const result = await finalizeResponse.json();
  expect(isStatus(result.application?.status, EmployeeApplicationStatus.Finalized)).toBe(true);
  expect(result.application?.finalizedEmployeeId).toBeTruthy();
  expect(result.employee?.email).toBe(candidate.email);

  await expect(dialog).toBeHidden({ timeout: 30_000 });

  return {
    finalizedEmployeeId: result.application.finalizedEmployeeId as string,
    finalizeBody: finalizeRequest.postData() || '',
  };
}

async function expectEmployeeCreated(page: Page, candidate: CandidateFixture, employeeId: string) {
  await gotoEmployeeList(page);
  await searchEmployee(page, candidate.email);
  await expect(page.getByText(candidate.email)).toBeVisible({ timeout: 30_000 });

  const list = await jsonFrom(
    await employeeApiRequest(
      page,
      `/employees?page=1&pageSize=10&search=${encodeURIComponent(candidate.email)}`
    ),
    'employee search'
  );
  const employee = (list.items || []).find((item: any) => item.email === candidate.email);
  expect(employee?.id).toBe(employeeId);
}

async function expectFinalizedApiState(
  page: Page,
  candidate: CandidateFixture,
  applicationId: string,
  employeeId: string
) {
  const application = await jsonFrom(
    await employeeApiRequest(page, `/employee-applications/${applicationId}`),
    'application detail'
  );
  expect(isStatus(application.status, EmployeeApplicationStatus.Finalized)).toBe(true);
  expect(application.finalizedEmployeeId).toBe(employeeId);

  const workExperience = await jsonFrom(
    await employeeApiRequest(page, `/employees/${employeeId}/work-experience`),
    'employee work experience'
  );
  expect(JSON.stringify(workExperience)).toContain(candidate.experience.organization);
  expect(JSON.stringify(workExperience)).toContain(candidate.experience.designation);

  const documentsResponse = await employeeApiRequest(
    page,
    `/employees/${employeeId}/documents?page=1&pageSize=20`
  );
  if (documentsResponse.ok()) {
    const documents = await documentsResponse.json();
    expect(JSON.stringify(documents)).toContain(candidate.resumeName);
  }
}

test.describe('HR Employee onboarding E2E', () => {
  test('creates invite, accepts anonymous application, finalizes employee, and verifies employee record', async ({
    browser,
    page,
  }) => {
    test.setTimeout(240_000);
    const candidate = createCandidateFixture();

    await gotoOnboarding(page);
    const invite = await createInviteThroughUi(page, candidate);
    expect(isStatus(invite.application.status, EmployeeApplicationStatus.InvitationSent)).toBe(
      true
    );

    const expiresAt = new Date(invite.tokenExpiresAt).getTime();
    const now = Date.now();
    expect(expiresAt).toBeGreaterThan(now + 29 * 24 * 60 * 60 * 1000);
    expect(expiresAt).toBeLessThan(now + 31 * 24 * 60 * 60 * 1000);

    await searchApplication(page, candidate.email);
    await expect(applicationRow(page, candidate)).toContainText('Invitation sent');

    await withAnonymousPage(browser, async (publicPage) => {
      await publicPage.goto(invite.publicPath, { waitUntil: 'domcontentloaded' });
      await expect(publicPage).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(publicPage.getByTestId('employee-application-public-form')).toBeVisible();
      await expect(
        publicPage.getByRole('textbox', { name: /aadhaar|pan|bank|payroll|login/i })
      ).toHaveCount(0);

      await fillPublicApplication(publicPage, candidate);
      await uploadValidPublicFiles(publicPage, candidate);
      await submitPublicApplication(publicPage);

      const duplicateResponse = await publicPage.request.post(
        `${apiBaseUrl()}/api/public/employee-applications/${invite.token}/submit`,
        {
          multipart: {
            data: JSON.stringify(duplicatePublicSubmitPayload(candidate)),
          },
        }
      );
      expect(duplicateResponse.status()).toBeGreaterThanOrEqual(400);
      expect(duplicateResponse.status()).toBeLessThan(500);
    });

    await gotoOnboarding(page);
    await searchApplication(page, candidate.email);
    await expect(applicationRow(page, candidate)).toContainText('Applied', { timeout: 30_000 });
    await filterApplicationsByStatus(page, 'Applied');
    await expect(applicationRow(page, candidate)).toBeVisible();

    const drawer = await openApplicationDetails(page, candidate);
    await expect(drawer).toContainText(candidate.qualificationSummary);
    await expect(drawer).toContainText(candidate.skillsSummary);
    await expect(drawer.getByTestId('employee-onboarding-work-experience-list')).toContainText(
      candidate.experience.organization
    );
    await expect(drawer.getByTestId('employee-onboarding-work-experience-list')).toContainText(
      candidate.experience.designation
    );
    await expect(drawer.getByRole('button', { name: /^Resume$/i })).toBeEnabled();
    await expect(drawer.getByRole('button', { name: /^Photo$/i })).toBeEnabled();

    await updateStatusToReady(page, drawer, invite.application.id);
    await closeDrawer(page);
    await filterApplicationsByStatus(page, 'Ready for onboarding');
    await expect(applicationRow(page, candidate)).toContainText('Ready for onboarding', {
      timeout: 30_000,
    });

    const { finalizedEmployeeId, finalizeBody } = await finalizeApplication(
      page,
      candidate,
      invite.application.id
    );
    expect(finalizedEmployeeId).toBeTruthy();

    const duplicateFinalize = await employeeApiRequest(
      page,
      `/employee-applications/${invite.application.id}/finalize`,
      {
        method: 'POST',
        body: finalizeBody,
      }
    );
    expect(duplicateFinalize.status()).toBeGreaterThanOrEqual(400);
    expect(duplicateFinalize.status()).toBeLessThan(500);

    await filterApplicationsByStatus(page, 'Finalized');
    await expect(applicationRow(page, candidate)).toContainText('Finalized', { timeout: 30_000 });
    await expectEmployeeCreated(page, candidate, finalizedEmployeeId);
    await expectFinalizedApiState(page, candidate, invite.application.id, finalizedEmployeeId);
  });

  test('regenerates an invite link and invalidates the old public token', async ({
    browser,
    page,
  }) => {
    test.setTimeout(120_000);
    const candidate = createCandidateFixture('Regenerate Candidate');

    await gotoOnboarding(page);
    const invite = await createInviteThroughUi(page, candidate);
    await searchApplication(page, candidate.email);
    const drawer = await openApplicationDetails(page, candidate);

    const regenerateResponsePromise = page.waitForResponse(
      (response) =>
        response
          .url()
          .includes(`/api/employee-applications/${invite.application.id}/regenerate-link`) &&
        response.request().method() === 'POST'
    );
    await drawer.getByTestId('employee-onboarding-regenerate-link').click();
    const regenerateResponse = await regenerateResponsePromise;
    expect(regenerateResponse.ok(), `regenerate link: ${regenerateResponse.status()}`).toBe(true);
    const regenerated = (await regenerateResponse.json()) as InviteResponse;
    expect(regenerated.token).not.toBe(invite.token);
    expect(regenerated.publicPath).not.toBe(invite.publicPath);

    await withAnonymousPage(browser, async (publicPage) => {
      await publicPage.goto(invite.publicPath, { waitUntil: 'domcontentloaded' });
      await expect(publicPage.getByTestId('employee-application-unavailable')).toBeVisible({
        timeout: 30_000,
      });

      await publicPage.goto(regenerated.publicPath, { waitUntil: 'domcontentloaded' });
      await expect(publicPage.getByTestId('employee-application-public-form')).toBeVisible({
        timeout: 30_000,
      });
    });
  });

  test('blocks unsupported resume and photo files on the anonymous form', async ({
    browser,
    page,
  }) => {
    test.setTimeout(120_000);
    const candidate = createCandidateFixture('Upload Guard');

    await gotoOnboarding(page);
    const invite = await createInviteThroughUi(page, candidate);

    await withAnonymousPage(browser, async (publicPage) => {
      await publicPage.goto(invite.publicPath, { waitUntil: 'domcontentloaded' });
      await fillPublicApplication(publicPage, candidate);

      await publicPage.getByTestId('employee-application-resume-input').setInputFiles({
        name: 'unsupported.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('unsupported'),
      });
      await publicPage.getByTestId('employee-application-submit').click();
      await expect(publicPage.getByText(/Resume must be a PDF, DOC, or DOCX file/i)).toBeVisible();

      await publicPage.getByTestId('employee-application-resume-input').setInputFiles({
        name: candidate.resumeName,
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'),
      });
      await publicPage.getByTestId('employee-application-photo-input').setInputFiles({
        name: 'unsupported.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('unsupported'),
      });
      await publicPage.getByTestId('employee-application-submit').click();
      await expect(publicPage.getByText(/Photo must be an image file/i)).toBeVisible();
    });
  });
});
