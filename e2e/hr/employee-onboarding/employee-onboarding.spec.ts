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

const onboardingColumns = ['Candidate', 'Position', 'Status', 'Submitted', 'Expires', 'Actions'];

type CandidateFixture = ReturnType<typeof createCandidateFixture>;

type AcademicYear = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
};

type InviteResponse = {
  token: string;
  publicPath: string;
  tokenExpiresAt: string;
  emailDeliverySucceeded: boolean;
  emailDeliveryMessage?: string | null;
  application: {
    id: string;
    status: number | string;
    email?: string;
    publicPath?: string | null;
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
    identificationMark1: `Left hand mark automation ${suffix}`,
    fatherName: `Father ${nameSuffix}`,
    fatherOccupation: 'Teacher',
    fatherMobileNo: `7${suffix.slice(-9).padStart(9, '2')}`,
    secondLanguage: 'Gujarati',
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

async function jsonFrom(response: Awaited<ReturnType<typeof employeeApiRequest>>, label: string) {
  const text = await response.text();
  if (!response.ok()) {
    throw new Error(`${label}: ${response.status()} ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function jsonFromWhenAuthorized(
  response: Awaited<ReturnType<typeof employeeApiRequest>>,
  label: string
) {
  if (response.status() === 403) {
    return null;
  }

  return jsonFrom(response, label);
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const getInAcademicYearDate = (academicYear: AcademicYear) => {
  const start = academicYear.startDate ? new Date(academicYear.startDate) : new Date();
  const end = academicYear.endDate ? new Date(academicYear.endDate) : addDays(start, 180);
  let candidate = new Date(Math.max(addDays(start, 1).getTime(), new Date().getTime()));

  if (candidate > end) {
    candidate = addDays(start, 1);
  }
  if (candidate > end) {
    candidate = start;
  }

  return toDateInputValue(candidate);
};

async function getAcademicYearJoiningDate(page: Page) {
  const years = await jsonFrom(
    await employeeApiRequest(page, '/app/academic-year?Sorting=name'),
    'academic year list'
  );
  const items = (years.items || []) as AcademicYear[];
  const now = Date.now();
  const current =
    items.find((year) => {
      const start = year.startDate ? new Date(year.startDate).getTime() : 0;
      const end = year.endDate ? new Date(year.endDate).getTime() : 0;
      return start <= now && now <= end;
    }) || items.find((year) => year.name.includes(String(new Date().getFullYear())));

  if (!current?.id) {
    throw new Error('No academic year is available for employee onboarding E2E.');
  }

  await ensureDefaultLeavePolicy(page, current);

  return getInAcademicYearDate(current);
}

async function ensureDefaultLeavePolicy(page: Page, academicYear: AcademicYear) {
  const academicYearParam = encodeURIComponent(academicYear.id);
  const policies = await jsonFrom(
    await employeeApiRequest(
      page,
      `/leave-policies?academicYearId=${academicYearParam}&page=1&pageSize=500`
    ),
    'leave policy list'
  );
  const policyItems = (policies.items || []) as any[];
  const activeDefaults = policyItems.filter(
    (policy) => String(policy.status || '').toLowerCase() === 'active' && policy.isDefault
  );

  if (activeDefaults.length === 1) {
    return;
  }

  const reusablePolicy = policyItems.find(
    (policy) => String(policy.status || '').toLowerCase() === 'active'
  );

  if (reusablePolicy?.id) {
    await jsonFrom(
      await employeeApiRequest(page, `/leave-policies/${reusablePolicy.id}/set-default`, {
        method: 'PATCH',
      }),
      'set default leave policy'
    );
    return;
  }

  await jsonFrom(
    await employeeApiRequest(page, `/leave-policies?academicYearId=${academicYearParam}`, {
      method: 'POST',
      body: JSON.stringify({
        policyTitle: `E2E Default Leave ${academicYear.name}`,
        status: 'Active',
        effectiveFrom: academicYear.startDate || getInAcademicYearDate(academicYear),
        effectiveTo: academicYear.endDate || null,
        description: 'Created by employee onboarding E2E setup',
        isDefault: true,
        rules: [
          {
            paidType: 'Paid',
            entitlementMode: 'Limited',
            accrualPolicyType: 'Yearly',
            leaveCount: 12,
            carryForward: false,
            encashmentAllowed: false,
            requiresApproval: true,
            minNoticeDays: 0,
            maxDaysPerRequest: 30,
            allowHalfDay: true,
            allowNegativeBalance: false,
            isActive: true,
          },
          {
            paidType: 'Unpaid',
            entitlementMode: 'Unlimited',
            accrualPolicyType: 'Yearly',
            leaveCount: null,
            carryForward: false,
            encashmentAllowed: false,
            requiresApproval: true,
            minNoticeDays: 0,
            maxDaysPerRequest: 30,
            allowHalfDay: true,
            allowNegativeBalance: true,
            isActive: true,
          },
        ],
      }),
    }),
    'create default leave policy'
  );
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

const toDatePickerInputValue = (value: string) => {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}-${month}-${year}` : value;
};

async function fillDateField(page: Page, scope: Page | Locator, label: string, value: string) {
  const field = await fieldByLabel(scope, label);
  const [year, month, day] = value.split('-');
  const dayField = field.getByRole('spinbutton', { name: /day/i });
  if (year && month && day && (await dayField.count())) {
    await dayField.fill(day);
    await field.getByRole('spinbutton', { name: /month/i }).fill(month);
    await field.getByRole('spinbutton', { name: /year/i }).fill(year);
    await page.keyboard.press('Tab');
    return;
  }

  await field.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(toDatePickerInputValue(value));
  await page.keyboard.press('Tab');
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function fillOtpField(scope: Locator, label: string, value: string) {
  const labelNode = scope.getByText(new RegExp(`^${escapeRegex(label)}\\s*\\*?$`)).first();
  const fieldContainer = labelNode.locator('xpath=ancestor::*[.//input][1]');
  await fieldContainer.getByRole('textbox').first().fill(value);
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

async function clickStepperNext(scope: Locator) {
  await scope.getByRole('button', { name: /^(Next|Save & Next)$/i }).click();
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
  const onboardingTable = page.getByTestId('employee-onboarding-table');
  await expect(onboardingTable).toBeVisible();
  await Promise.all(
    onboardingColumns.map((column) =>
      expect(onboardingTable.getByRole('columnheader', { name: column })).toBeVisible()
    )
  );
  await expect(onboardingTable.getByText('Rows per page')).toBeVisible();
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

  if (response.status() === 403) {
    return;
  }

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
  await fillField(dialog, 'Primary Contact No.', candidate.mobileNo);
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
  expect(invite.application.publicPath).toBe(invite.publicPath);
  expect(typeof invite.emailDeliverySucceeded).toBe('boolean');

  await expect(dialog).toBeHidden({ timeout: 20_000 });
  return invite;
}

async function searchApplication(page: Page, search: string) {
  const onboardingTable = page.getByTestId('employee-onboarding-table');
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/employee-applications') && response.request().method() === 'GET'
  );
  await onboardingTable.getByPlaceholder('Search...').fill(search);
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
  await row.getByTestId('employee-onboarding-row-details').getByTestId('table-action-view').click();
  const detailView = page.getByTestId('employee-onboarding-detail-view');
  await expect(detailView).toBeVisible();
  await expect(page).toHaveURL(/application=/);
  return detailView;
}

async function closeDetailView(page: Page) {
  await page.getByTestId('breadcrumb-back').click();
  await expect(page.getByTestId('employee-onboarding-detail-view')).toBeHidden({
    timeout: 10_000,
  });
  await expect(page).not.toHaveURL(/application=/);
  await expect(page.getByTestId('employee-onboarding-table')).toBeVisible();
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
  await fillField(form, 'Primary Contact No.', candidate.mobileNo);
  await fillField(form, 'Secondary Contact No.', candidate.secondaryMobileNo);
  await fillDateField(page, form, 'Date of birth', candidate.dateOfBirth);
  await form.getByRole('radio', { name: 'Male', exact: true }).check();
  await selectOption(page, form, 'Category', 'General');
  await selectOption(page, form, 'Religion', candidate.religion);
  await fillField(form, 'Family caste', candidate.familyCaste);
  await selectOption(page, form, 'Marital status', 'Unmarried');
  await fillField(form, 'Department', candidate.departmentAppliedFor);
  await fillField(form, 'Designation', candidate.positionAppliedFor);
  await fillField(form, 'Qualification', candidate.qualificationSummary);
  await fillField(form, 'Identification mark', candidate.identificationMark1);
  await fillField(form, 'Building No./Flat/House No.', candidate.address1);
  await fillField(form, 'Area/Locality/Road Name', candidate.address2);
  await selectOption(
    page,
    form,
    'State',
    new RegExp(`${candidate.stateIsoCode}\\s+${candidate.stateName}`)
  );
  await selectOption(page, form, 'City', candidate.city);
  await fillField(form, 'Pin code', candidate.pinCode);
  await page.getByTestId('employee-application-step-0-next').click();

  const familyStep = form.getByTestId('employee-application-step-family');
  await expect(familyStep).toBeVisible();
  await familyStep.getByLabel('Name').first().fill(candidate.fatherName);
  await familyStep.getByLabel('Occupation').first().fill(candidate.fatherOccupation);
  await familyStep.getByLabel('Mobile no.').first().fill(candidate.fatherMobileNo);
  await page.getByTestId('employee-application-step-1-next').click();

  const additionalStep = form.getByTestId('employee-application-step-additional');
  await expect(additionalStep).toBeVisible();
  await fillField(additionalStep, 'Second language', candidate.secondLanguage);
  await additionalStep.getByLabel('Library member').check();
  await page.getByTestId('employee-application-step-2-next').click();

  await expect(form.getByTestId('employee-application-step-experience')).toBeVisible();
  await form.getByRole('button', { name: /Add experience/i }).click();
  await fillField(form, 'Organization', candidate.experience.organization);
  await fillField(form, 'Designation', candidate.experience.designation);
  await form
    .getByLabel('Department', { exact: false })
    .last()
    .fill(candidate.experience.department);
  await fillDateField(page, form, 'Start Date', candidate.experience.startDate);
  await fillDateField(page, form, 'End Date', candidate.experience.endDate);
  await page.getByTestId('employee-application-step-3-next').click();
  await expect(form.getByTestId('employee-application-step-uploads-review')).toBeVisible();
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
    personalInfo: {
      firstName: candidate.firstName,
      middleName: candidate.middleName,
      lastName: candidate.lastName,
      email: candidate.email,
      mobileNo: candidate.mobileNo,
      secondaryMobileNo: candidate.secondaryMobileNo,
      dateOfBirth: candidate.dateOfBirth,
      gender: 1,
      religion: candidate.religion,
      casteType: 0,
      familyCaste: candidate.familyCaste,
      maritalStatus: 0,
      department: candidate.departmentAppliedFor,
      designation: candidate.positionAppliedFor,
      qualification: candidate.qualificationSummary,
      identificationMark1: candidate.identificationMark1,
      address1: candidate.address1,
      address2: candidate.address2,
      address3: candidate.address3,
      country: { name: candidate.countryName, isoCode: candidate.countryIsoCode },
      state: { name: candidate.stateName, isoCode: candidate.stateIsoCode },
      city: candidate.city,
      pincode: candidate.pinCode,
    },
    familyInfo: {
      fatherDetails: {
        name: candidate.fatherName,
        occupation: candidate.fatherOccupation,
        mobileNo: candidate.fatherMobileNo,
      },
    },
    additionalInfo: {
      personWithDisability: false,
      secondLanguage: candidate.secondLanguage,
      isLibraryMember: true,
      isTransportMember: false,
    },
    workExperiences: [],
  };
}

async function submitPublicApplication(page: Page) {
  const submitResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/public/employee-applications/') &&
      response.url().includes('/submit') &&
      response.request().method() === 'POST',
    { timeout: 60_000 }
  );
  await page.getByTestId('employee-application-submit').click();
  const submitResponse = await submitResponsePromise;
  if (!submitResponse.ok()) {
    throw new Error(`public submit: ${submitResponse.status()} ${await submitResponse.text()}`);
  }
  await expect(page.getByTestId('employee-application-submit-success')).toBeVisible({
    timeout: 45_000,
  });
}

async function updateStatusToReady(page: Page, detailView: Locator, applicationId: string) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/employee-applications/${applicationId}/status`) &&
      response.request().method() === 'PUT'
  );
  await selectOption(page, detailView, 'Status', 'Ready for onboarding');
  await detailView.getByRole('button', { name: /^Update$/i }).click();
  const response = await responsePromise;
  expect(response.ok(), `status update: ${response.status()}`).toBe(true);
}

async function finalizeApplication(
  page: Page,
  candidate: CandidateFixture,
  applicationId: string,
  joiningDate: string
) {
  const row = applicationRow(page, candidate);
  await row.getByTestId('employee-onboarding-row-details').getByTestId('table-action-more').click();
  await page.getByTestId('employee-onboarding-row-finalize').click();

  const dialog = page.getByTestId('employee-onboarding-finalize-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(candidate.email);
  await expect(dialog).toContainText(candidate.mobileNo);

  await clickStepperNext(dialog);
  await expect(dialog.getByLabel('First name', { exact: false })).toHaveValue(candidate.firstName);
  await expect(dialog.getByLabel('Last name', { exact: false })).toHaveValue(candidate.lastName);
  await expect(dialog.getByLabel('Email', { exact: false })).toHaveValue(candidate.email);
  await expect(dialog.getByLabel('Designation', { exact: false })).toHaveValue(
    candidate.positionAppliedFor
  );
  await expect(dialog.getByLabel('Qualification', { exact: false })).toHaveValue(
    candidate.qualificationSummary
  );
  await expect(dialog.getByLabel('Identification mark', { exact: false })).toHaveValue(
    candidate.identificationMark1
  );

  await fillOtpField(dialog, 'PAN No.', candidate.panNo);
  await fillOtpField(dialog, 'Aadhaar No.', candidate.adharNo);
  await fillDateField(page, dialog, 'Date of Joining', joiningDate);
  await selectFirstOption(page, dialog, 'Role');
  await selectFirstOption(page, dialog, 'Shift');
  await fillField(dialog, 'Building No./Flat/House No.', candidate.address1);
  await fillField(dialog, 'Area/Locality/Road Name', candidate.address2);
  await selectOption(
    page,
    dialog,
    'Country',
    new RegExp(`${candidate.countryIsoCode}\\s+${candidate.countryName}`)
  );
  await selectOption(
    page,
    dialog,
    'State',
    new RegExp(`${candidate.stateIsoCode}\\s+${candidate.stateName}`)
  );
  await selectOption(page, dialog, 'City', candidate.city);
  await fillField(dialog, 'Pin code', candidate.pinCode);

  await clickStepperNext(dialog);
  await expect(dialog).toContainText('Academic Permission');
  await dialog.getByRole('checkbox').first().check();

  await clickStepperNext(dialog);
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
  const accessControlRequestPromise = page.waitForRequest(
    (request) =>
      request.url().includes('/api/app/user-scope/bulk-assign') && request.method() === 'POST'
  );
  const accessControlResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/app/user-scope/bulk-assign') &&
      response.request().method() === 'POST'
  );
  await dialog.getByRole('button', { name: /^Finalize$/i }).click();

  const finalizeRequest = await finalizeRequestPromise;
  const finalizeResponse = await finalizeResponsePromise;
  if (!finalizeResponse.ok()) {
    throw new Error(`finalize: ${finalizeResponse.status()} ${await finalizeResponse.text()}`);
  }
  const accessControlRequest = await accessControlRequestPromise;
  const accessControlResponse = await accessControlResponsePromise;
  const accessControlForbidden = accessControlResponse.status() === 403;
  if (!accessControlResponse.ok() && !accessControlForbidden) {
    throw new Error(
      `academic permission: ${accessControlResponse.status()} ${await accessControlResponse.text()}`
    );
  }
  const result = await finalizeResponse.json();
  expect(isStatus(result.application?.status, EmployeeApplicationStatus.Finalized)).toBe(true);
  expect(result.application?.finalizedEmployeeId).toBeTruthy();
  expect(result.employee?.email).toBe(candidate.email);
  const finalizeBody = finalizeRequest.postData() || '';
  expect(finalizeBody).not.toContain('organizationIds');
  const finalizePayload = JSON.parse(finalizeBody);
  expect(finalizePayload.personalInfo?.country?.isoCode).toBe(candidate.countryIsoCode);
  expect(finalizePayload.personalInfo?.state?.isoCode).toBe(candidate.stateIsoCode);
  expect(finalizePayload.personalInfo?.city).toBe(candidate.city);
  const accessControlPayload = JSON.parse(accessControlRequest.postData() || '{}');
  expect(accessControlPayload.scopes?.some((scope: any) => scope.educationMediumStageId)).toBe(
    true
  );
  expect(accessControlPayload).not.toHaveProperty('educationMediumStageIds');

  if (accessControlForbidden) {
    await dialog.getByRole('button', { name: /close/i }).click();
  }
  await expect(dialog).toBeHidden({ timeout: 30_000 });

  return {
    finalizedEmployeeId: result.application.finalizedEmployeeId as string,
    finalizeBody,
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

  const workExperience = await jsonFromWhenAuthorized(
    await employeeApiRequest(page, `/employees/${employeeId}/work-experience`),
    'employee work experience'
  );
  if (workExperience) {
    expect(JSON.stringify(workExperience)).toContain(candidate.experience.organization);
    expect(JSON.stringify(workExperience)).toContain(candidate.experience.designation);
  }

  const familyInfo = await jsonFromWhenAuthorized(
    await employeeApiRequest(page, `/employees/${employeeId}/family-info`),
    'employee family info'
  );
  if (familyInfo) {
    expect(JSON.stringify(familyInfo)).toContain(candidate.fatherName);
  }

  const additionalInfo = await jsonFromWhenAuthorized(
    await employeeApiRequest(page, `/employees/${employeeId}/additional-info`),
    'employee additional info'
  );
  if (additionalInfo) {
    expect(JSON.stringify(additionalInfo)).toContain(candidate.secondLanguage);
  }

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
    const joiningDate = await getAcademicYearJoiningDate(page);
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

    const detailView = await openApplicationDetails(page, candidate);
    await expect(detailView).toContainText(candidate.qualificationSummary);
    await expect(detailView).toContainText(candidate.identificationMark1);
    await expect(detailView).toContainText(candidate.fatherName);
    await expect(detailView).toContainText(candidate.secondLanguage);
    await expect(detailView.getByTestId('employee-onboarding-work-experience-list')).toContainText(
      candidate.experience.organization
    );
    await expect(detailView.getByTestId('employee-onboarding-work-experience-list')).toContainText(
      candidate.experience.designation
    );
    await expect(detailView.getByRole('button', { name: /^Applicant Resume$/i })).toBeEnabled();
    await expect(detailView.getByRole('button', { name: /^Applicant Photo$/i })).toBeEnabled();

    await updateStatusToReady(page, detailView, invite.application.id);
    await closeDetailView(page);
    await filterApplicationsByStatus(page, 'Ready for onboarding');
    await expect(applicationRow(page, candidate)).toContainText('Ready for onboarding', {
      timeout: 30_000,
    });

    const { finalizedEmployeeId, finalizeBody } = await finalizeApplication(
      page,
      candidate,
      invite.application.id,
      joiningDate
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
    const detailView = await openApplicationDetails(page, candidate);
    await expect(detailView.getByTestId('employee-onboarding-copy-link')).toBeVisible();

    const regenerateResponsePromise = page.waitForResponse(
      (response) =>
        response
          .url()
          .includes(`/api/employee-applications/${invite.application.id}/regenerate-link`) &&
        response.request().method() === 'POST'
    );
    await detailView.getByTestId('employee-onboarding-regenerate-link').click();
    const regenerateResponse = await regenerateResponsePromise;
    expect(regenerateResponse.ok(), `regenerate link: ${regenerateResponse.status()}`).toBe(true);
    const regenerated = (await regenerateResponse.json()) as InviteResponse;
    expect(regenerated.token).not.toBe(invite.token);
    expect(regenerated.publicPath).not.toBe(invite.publicPath);
    expect(regenerated.application.publicPath).toBe(regenerated.publicPath);
    expect(typeof regenerated.emailDeliverySucceeded).toBe('boolean');

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
      await expect(
        publicPage.getByText(/Resume must be a PDF, DOC, or DOCX file/i).first()
      ).toBeVisible();

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
      await expect(publicPage.getByText(/Photo must be an image file/i).first()).toBeVisible();
    });
  });
});
