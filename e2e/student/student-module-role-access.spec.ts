/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import * as fs from 'node:fs';
import * as nodePath from 'node:path';
import { test, expect, type Page, type APIResponse } from '@playwright/test';

const studentE2EEnabled = process.env.E2E_STUDENT_MODULE === '1';
const tenant = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || 'Temp@123';

const roleUsers = [
  { label: 'Admin', email: process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com' },
  { label: 'Principal', email: process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com' },
  { label: 'Teacher', email: process.env.E2E_TEACHER_EMAIL || 'teacher-gseb@ddvs.com' },
  { label: 'Clerk', email: process.env.E2E_CLERK_EMAIL || 'clerk-office@ddvs.com' },
  { label: 'Finance Officer', email: process.env.E2E_FINANCE_EMAIL || 'finance-officer@ddvs.com' },
];

const studentApiSmokePaths = (academicMediumId: string) => [
  `/student/enrollment/registrations?academicMediumId=${academicMediumId}&skipCount=0&maxResultCount=5`,
  '/students/admissions?skipCount=0&maxResultCount=5',
  '/students/attendance/leaves?skipCount=0&maxResultCount=5',
  '/students/attendance/settings/leave-types?skipCount=0&maxResultCount=5',
];

const studentUiSmokePaths = [
  '/student/dashboard',
  '/student/profile',
  '/student/upload-student-photo',
  '/student/upload-student-documents',
  '/student/enrollment/pipeline',
  '/student/enrollment/exams',
  '/student/enrollment/registrations',
  '/student/enrollment/offers-seats',
  '/student/enrollment/activation',
  '/student/enrollment/operations',
  '/student/enrollment/analytics',
  '/student/enrollment/settings',
  '/student/attendance/dashboard',
  '/student/attendance/take-attendance',
  '/student/attendance/leave-absent',
  '/student/management',
  '/student/management/bulk-data-update',
  '/student/reports',
];

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }

  return url.replace(/\/$/, '');
};

async function waitForBackend(page: Page) {
  const healthUrl = `${apiBaseUrl()}/api/abp/application-configuration`;
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < 60_000) {
    try {
      const response = await page.request.get(healthUrl, {
        headers: { __tenant: tenant() },
        timeout: 5_000,
      });
      if (response.ok()) {
        return;
      }

      lastError = `${response.status()} ${await response.text()}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await page.waitForTimeout(2_000);
  }

  throw new Error(`Backend API is not ready at ${healthUrl}. Last error: ${lastError}`);
}

async function hasAccessToken(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return false;

    const session = await response.json();
    return Boolean(session?.accessToken);
  });
}

async function getAccessToken(page: Page) {
  const token = await page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return null;

    const session = await response.json();
    return session?.accessToken ?? null;
  });

  if (!token) {
    throw new Error('Unable to read accessToken from NextAuth session.');
  }

  return token as string;
}

async function login(page: Page, email: string) {
  await waitForBackend(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(tenant());
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(password());

  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toBeEnabled({ timeout: 30_000 });
  await signInButton.click();

  await expect.poll(() => hasAccessToken(page), { timeout: 60_000 }).toBe(true);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
  await page.evaluate(() => localStorage.setItem('onboarding_completed', 'true'));
}

async function studentApiRequest(
  page: Page,
  path: string,
  init: RequestInit = {}
): Promise<APIResponse> {
  const token = await getAccessToken(page);
  const { body, ...requestInit } = init;

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(body ? { data: body } : {}),
    headers: {
      accept: 'application/json',
      __tenant: tenant(),
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

async function expectOk(response: APIResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson(page: Page, path: string) {
  const response = await studentApiRequest(page, path);
  await expectOk(response, `GET ${path}`);
  return response.json();
}

async function resolveAcademicMediumId(page: Page) {
  const academicYears = await getJson(page, '/app/academic-year?Sorting=name');
  const academicYearIds = (academicYears?.items ?? []).map((item: any) => item?.id).filter(Boolean);
  expect(
    academicYearIds.length,
    'Seeded academic year is required for student E2E.'
  ).toBeGreaterThan(0);

  for (const academicYearId of academicYearIds) {
    const options = await getJson(
      page,
      `/app/academic-organization-options?academicYearId=${academicYearId}`
    );
    const academicMediumId = options?.items?.find((item: any) => item?.mediumId)?.mediumId;
    if (academicMediumId) {
      return academicMediumId as string;
    }
  }

  throw new Error('Seeded academic medium is required for student E2E.');
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const format = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
      value.getDate()
    ).padStart(2, '0')}`;

  return { startDate: format(start), endDate: format(end) };
}

type AcademicPlacement = {
  academicYearId: string;
  academicMediumId: string;
  standardId: string;
  alternateStandardId?: string;
  divisionId?: string;
};

const unwrapApiData = (payload: any) =>
  payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;

const pagedItems = (payload: any) => unwrapApiData(payload)?.items ?? [];

const bugScreenshotPath = (fileName: string) => {
  const outputDir = nodePath.join(process.cwd(), 'output', 'playwright');
  fs.mkdirSync(outputDir, { recursive: true });
  return nodePath.join(outputDir, fileName);
};

async function captureBugScreenshot(page: Page, fileName: string) {
  await page.screenshot({ path: bugScreenshotPath(fileName), fullPage: true });
}

const uniqueToken = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const uniqueFormNumber = () =>
  `E2E-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const uniquePhone = () => `9${Date.now().toString().slice(-9)}`;

const yearsAgoIso = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString();
};

const nextWeekIso = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

const state = (name = 'Gujarat', isoCode = 'GJ') => ({ name, isoCode });
const country = () => ({ name: 'India', isoCode: 'IN' });

const address = (address1: string, city = 'Ahmedabad') => ({
  address1,
  address2: 'Near School Road',
  address3: 'E2E Area',
  city,
  state: state(),
  country: country(),
  pincode: '380015',
});

const parent = (fullName: string, aadharNo: string, organization: string) => ({
  fullName,
  occupation: 'Engineer',
  email: `${uniqueToken('parent').toLowerCase()}@example.com`,
  contactNo: uniquePhone(),
  officeNo: '0794000000',
  qualification: 'Graduate',
  yearOfPassing: '2005',
  designation: 'Manager',
  organization,
  aadharNo,
  officeAddress: address(`${organization} Office`),
  localAddress: address(`${fullName} Home`),
});

function collectStandards(medium: any) {
  const topLevel = Array.isArray(medium?.standards) ? medium.standards : [];
  const staged = Array.isArray(medium?.educationMediumStages)
    ? medium.educationMediumStages.flatMap((stage: any) => stage?.standards ?? [])
    : [];
  const seen = new Set<string>();

  return [...topLevel, ...staged].filter((standard: any) => {
    if (!standard?.id || seen.has(standard.id)) return false;
    seen.add(standard.id);
    return true;
  });
}

async function resolveAcademicPlacement(page: Page): Promise<AcademicPlacement> {
  const academicYears = pagedItems(await getJson(page, '/app/academic-year?Sorting=name'));
  expect(
    academicYears.length,
    'Seeded academic year is required for student bug E2E.'
  ).toBeGreaterThan(0);

  for (const academicYear of academicYears) {
    const options = pagedItems(
      await getJson(page, `/app/academic-organization-options?academicYearId=${academicYear.id}`)
    );

    for (const medium of options) {
      const academicMediumId = medium?.mediumId ?? medium?.id;
      const standardPayload = academicMediumId
        ? await getJson(page, `/education-medium/${academicMediumId}/standards`)
        : [];
      const standards = [
        ...collectStandards(medium),
        ...collectStandards({ standards: standardPayload }),
      ];
      const primaryStandard =
        standards.find((standard: any) =>
          standard?.divisions?.some((division: any) => division?.id)
        ) ?? standards[0];
      const alternateStandard = standards.find(
        (standard: any) => standard?.id !== primaryStandard?.id
      );
      const divisionId = primaryStandard?.divisions?.find((division: any) => division?.id)?.id;

      if (academicMediumId && primaryStandard?.id) {
        return {
          academicYearId: academicYear.id,
          academicMediumId,
          standardId: primaryStandard.id,
          alternateStandardId: alternateStandard?.id,
          divisionId,
        };
      }
    }
  }

  throw new Error('Seeded academic medium and standard are required for student bug E2E.');
}

async function createRegistration(
  page: Page,
  placement: AcademicPlacement,
  suffix: string,
  overrides: Record<string, unknown> = {}
) {
  const payload = {
    academicMediumId: placement.academicMediumId,
    standardId: placement.standardId,
    divisionId: placement.divisionId,
    formNumber: uniqueFormNumber(),
    firstName: uniqueToken(suffix),
    lastName: 'Playwright',
    dateOfBirth: yearsAgoIso(10),
    gender: 1,
    primaryContactNo: uniquePhone(),
    familyCast: 'General',
    city: 'Ahmedabad',
    state: state(),
    country: country(),
    ...overrides,
  };

  const response = await studentApiRequest(
    page,
    '/student/enrollment/registrations/general-details',
    {
      method: 'POST',
      body: payload as any,
    }
  );
  await expectOk(response, 'create direct registration');

  const registration = unwrapApiData(await response.json());
  expect(registration?.studentId, 'Created registration should return studentId.').toBeTruthy();
  return registration;
}

async function updateFamilyDetails(page: Page, studentId: string) {
  const response = await studentApiRequest(
    page,
    `/student/enrollment/registrations/${studentId}/family-details`,
    {
      method: 'PUT',
      body: {
        fatherDetails: parent('E2E Father', '111122223333', 'Father Org'),
        motherDetails: parent('E2E Mother', '444455556666', 'Mother Org'),
        guardianDetails: parent('E2E Guardian', '777788889999', 'Guardian Org'),
      } as any,
    }
  );
  await expectOk(response, 'update family details');
  return unwrapApiData(await response.json());
}

async function updateCommunicationDetails(page: Page, studentId: string) {
  const response = await studentApiRequest(
    page,
    `/student/enrollment/registrations/${studentId}/communication-details`,
    {
      method: 'PUT',
      body: {
        localAddress: address('Student Local Address'),
        permanentAddress: address('Student Permanent Address'),
        emergencyAddress: address('Student Emergency Address'),
        isPermanentSameAsLocal: false,
        isEmergencySameAsLocal: false,
        emergencyContactName: 'E2E Emergency',
        emergencyContactPhone: uniquePhone(),
        emergencyContactRelation: 'Uncle',
      } as any,
    }
  );
  await expectOk(response, 'update communication details');
}

async function openStudentPageForEvidence(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  expect(response?.status(), `GET ${route}`).toBeLessThan(400);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
  await expect(page.locator('body')).not.toContainText(
    /404|This page could not be found|Application error|Unhandled Runtime Error/i,
    { timeout: 5_000 }
  );
}

test.describe('Student module role-login E2E', () => {
  test.skip(!studentE2EEnabled, 'Set E2E_STUDENT_MODULE=1 against a seeded local backend.');
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const user of roleUsers) {
    test(`${user.label} can sign in and access student read surfaces`, async ({ page }) => {
      test.setTimeout(120_000);

      await login(page, user.email);
      const academicMediumId = await resolveAcademicMediumId(page);

      for (const path of studentApiSmokePaths(academicMediumId)) {
        const response = await studentApiRequest(page, path);
        await expectOk(response, `${user.label} GET ${path}`);
      }
    });
  }

  test('principal can open primary student module pages without route or render failures', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await login(page, process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com');

    for (const path of studentUiSmokePaths) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      expect(response?.status(), `GET ${path}`).toBeLessThan(400);
      await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
      await expect(page.locator('body')).not.toContainText(
        /404|This page could not be found|Application error|Unhandled Runtime Error/i,
        { timeout: 5_000 }
      );
    }

    expect(pageErrors, `Student UI page errors: ${pageErrors.join('\n')}`).toEqual([]);
  });

  test('principal attendance dashboard requests selected month summary params', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const summaryRequests: string[] = [];
    const { startDate, endDate } = currentMonthRange();
    let responsePercentage: number | null = null;

    page.on('request', (request) => {
      if (request.url().includes('/api/students/records/attendance-dashboard-summary')) {
        summaryRequests.push(request.url());
      }
    });

    await login(page, process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com');
    const summaryResponsePromise = page.waitForResponse(
      (summaryResponse) =>
        summaryResponse.url().includes('/api/students/records/attendance-dashboard-summary') &&
        summaryResponse.request().method() === 'GET' &&
        summaryResponse.ok(),
      { timeout: 60_000 }
    );
    const response = await page.goto('/student/attendance/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    const summaryResponse = await summaryResponsePromise;
    const summary = await summaryResponse.json();
    responsePercentage = Number(summary?.schoolAttendancePercentage ?? 0);

    expect(response?.status(), 'GET /student/attendance/dashboard').toBeLessThan(400);
    await expect(page.locator('body')).not.toContainText(
      /404|This page could not be found|Application error|Unhandled Runtime Error/i,
      { timeout: 5_000 }
    );
    await expect
      .poll(
        () =>
          summaryRequests.some((url) => {
            const parsed = new URL(url);
            return (
              parsed.searchParams.get('startDate') === startDate &&
              parsed.searchParams.get('endDate') === endDate
            );
          }),
        { timeout: 30_000 }
      )
      .toBe(true);
    await expect(page.getByText(`School Attendance : ${responsePercentage}%`)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('principal leave and absent table sends server paging params', async ({ page }) => {
    test.setTimeout(120_000);
    const leaveRequests: string[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/students/attendance/leaves')) {
        leaveRequests.push(request.url());
      }
    });

    await login(page, process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com');
    const response = await page.goto('/student/attendance/leave-absent', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });

    expect(response?.status(), 'GET /student/attendance/leave-absent').toBeLessThan(400);
    await expect
      .poll(
        () =>
          leaveRequests.some((url) => {
            const parsed = new URL(url);
            return (
              parsed.searchParams.get('skipCount') === '0' &&
              parsed.searchParams.get('maxResultCount') === '10' &&
              parsed.searchParams.has('sorting')
            );
          }),
        { timeout: 30_000 }
      )
      .toBe(true);
  });

  test('bulk upload multipart requests include a browser boundary', async ({ page }) => {
    test.setTimeout(120_000);

    await page.route('**/api/students/bulk-upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    });

    const uploadRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/api/students/bulk-upload')
    );

    await login(page, process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com');
    const response = await page.goto('/student/management?tab=bulkStudentAdd', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(response?.status(), 'GET /student/management?tab=bulkStudentAdd').toBeLessThan(400);
    await expect(page.getByRole('button', { name: /^Import$/ })).toBeVisible({ timeout: 30_000 });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /^Import$/ }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'students.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('FormNumber,FirstName,LastName\nE2E-001,Boundary,Check\n'),
    });

    const uploadRequest = await uploadRequestPromise;
    expect(uploadRequest.headers()['content-type']).toMatch(/multipart\/form-data; boundary=/);
  });
});

test.describe('Student module bug regression E2E', () => {
  test.skip(!studentE2EEnabled, 'Set E2E_STUDENT_MODULE=1 against a seeded local backend.');
  test.use({ storageState: { cookies: [], origins: [] } });

  test('4917 inquiry returns age, address, preference, reminder, and status', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    const preferenceName = uniqueToken('WalkIn');
    const preferenceResponse = await studentApiRequest(
      page,
      `/student-enrollment/${placement.academicYearId}/settings/inquiry-preferences`,
      {
        method: 'POST',
        body: { preferenceName } as any,
      }
    );
    await expectOk(preferenceResponse, 'create inquiry preference');
    const preference = await preferenceResponse.json();

    const firstName = uniqueToken('InqBug');
    const reminderDate = nextWeekIso();
    const createInquiryResponse = await studentApiRequest(page, '/student/enrollment/inquiries', {
      method: 'POST',
      body: {
        academicMediumId: placement.academicMediumId,
        standardId: placement.standardId,
        firstName,
        lastName: 'Computed',
        dateOfBirth: yearsAgoIso(9),
        gender: 0,
        dateOfInquiry: new Date().toISOString(),
        inquirySourceId: preference.id,
        primaryContactNo: uniquePhone(),
        address1: 'Inquiry House 17',
        address2: 'Near Main Road',
        city: 'Surat',
        state: state(),
        country: country(),
        pinCode: '395007',
      } as any,
    });
    await expectOk(createInquiryResponse, 'create inquiry');

    const inquiryList = unwrapApiData(
      await (
        await studentApiRequest(
          page,
          `/student/enrollment/${placement.academicMediumId}/inquiries?maxResultCount=20&searchTerm=${encodeURIComponent(
            firstName
          )}`
        )
      ).json()
    );
    const inquiry = inquiryList.items.find((item: any) => item.firstName === firstName);
    expect(inquiry?.studentId, 'Created inquiry should be discoverable in the list.').toBeTruthy();

    const noteResponse = await studentApiRequest(
      page,
      `/student/enrollment/${inquiry.studentId}/notes`,
      {
        method: 'POST',
        body: {
          note: 'Interested family requested a follow up.',
          nextReminderDate: reminderDate,
          status: 1,
        } as any,
      }
    );
    await expectOk(noteResponse, 'create inquiry note');

    const detail = unwrapApiData(
      await (
        await studentApiRequest(page, `/student/enrollment/inquiries/${inquiry.studentId}`)
      ).json()
    );
    const refreshedList = unwrapApiData(
      await (
        await studentApiRequest(
          page,
          `/student/enrollment/${placement.academicMediumId}/inquiries?maxResultCount=20&searchTerm=${encodeURIComponent(
            firstName
          )}`
        )
      ).json()
    );
    const refreshedInquiry = refreshedList.items.find(
      (item: any) => item.studentId === inquiry.studentId
    );

    for (const item of [detail, refreshedInquiry]) {
      expect(String(item.age), 'Inquiry age should be populated.').toMatch(/\d+\s+years?/i);
      expect(item.address, 'Inquiry address should be consolidated.').toContain('Inquiry House 17');
      expect(item.inquirySourceId).toBe(preference.id);
      expect(item.inquiryPreference).toBe(preferenceName);
      expect(
        Math.abs(Date.parse(String(item.nextReminderDate)) - Date.parse(reminderDate)),
        'Reminder date should round-trip as the same instant.'
      ).toBeLessThan(60_000);
      expect([1, 'Interested']).toContain(item.inquiryStatus);
    }

    await openStudentPageForEvidence(page, '/student/enrollment/inquiry');
    await captureBugScreenshot(page, 'student-4917-inquiry-computed-fields.png');
  });

  test('inquiry source settings keeps failed mutations open', async ({ page }) => {
    test.setTimeout(180_000);

    const listRequests: string[] = [];
    await page.route(
      '**/api/student-enrollment/*/settings/inquiry-preferences**',
      async (route) => {
        listRequests.push(route.request().url());
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalCount: 2,
            items: [
              {
                id: 'source-status-fail',
                preferenceName: 'E2E Status Failure Source',
                description: 'Route controlled source',
                displayOrder: 1,
                isActive: true,
                assignedStudentsCount: 1,
                canDelete: false,
              },
              {
                id: 'source-delete-fail',
                preferenceName: 'E2E Delete Failure Source',
                description: 'Delete should fail',
                displayOrder: 2,
                isActive: true,
                assignedStudentsCount: 0,
                canDelete: true,
              },
            ],
          }),
        });
      }
    );
    await page.route(
      '**/api/student-enrollment/settings/inquiry-preferences/source-status-fail/status',
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'https://httpstatuses.com/500',
            title: 'Request failed',
            status: 500,
            detail: 'Route-controlled status failure.',
          }),
        });
      }
    );
    await page.route(
      '**/api/student-enrollment/settings/inquiry-preferences/source-delete-fail',
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'https://httpstatuses.com/500',
            title: 'Request failed',
            status: 500,
            detail: 'Route-controlled delete failure.',
          }),
        });
      }
    );

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    await openStudentPageForEvidence(page, '/student/enrollment/setting/inquiryPrefrence');

    await expect(page.getByTestId('inquiry-preference')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('E2E Status Failure Source')).toBeVisible();
    await expect(page.getByText('E2E Delete Failure Source')).toBeVisible();
    expect(
      listRequests.some((url) =>
        /\/student-enrollment\/[^/]+\/settings\/inquiry-preferences/.test(url)
      )
    ).toBe(true);

    const statusRow = page.getByRole('row').filter({ hasText: 'E2E Status Failure Source' });
    await statusRow.locator('input[type="checkbox"]').click({ force: true });
    const statusDialog = page.getByRole('dialog', { name: /Deactivate Inquiry Source/i });
    await expect(statusDialog).toBeVisible();
    await statusDialog.getByRole('button', { name: /^Deactivate$/i }).click();
    await expect(statusDialog).toBeVisible();
    await expect(page.getByText(/deactivated successfully/i)).toHaveCount(0);

    await statusDialog.getByRole('button', { name: /^Cancel$/i }).click();
    const deleteRow = page.getByRole('row').filter({ hasText: 'E2E Delete Failure Source' });
    await deleteRow.getByTestId('table-action-delete').click();
    const deleteDialog = page.getByRole('dialog', { name: /^Delete$/i });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole('button', { name: /^Yes$/i }).click();
    await expect(deleteDialog).toBeVisible();
    await expect(page.getByText(/deleted successfully/i)).toHaveCount(0);
  });

  test('4923 registration general details persists class changes', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    test.skip(!placement.alternateStandardId, 'Need at least two standards in the same medium.');

    const registration = await createRegistration(page, placement, 'ClassBug');
    const existing = unwrapApiData(
      await (
        await studentApiRequest(
          page,
          `/student/enrollment/registrations/${registration.studentId}/general-details`
        )
      ).json()
    );
    const response = await studentApiRequest(
      page,
      `/student/enrollment/registrations/${registration.studentId}/general-details`,
      {
        method: 'PUT',
        body: {
          formNumber: existing.formNo,
          firstName: 'ClassUpdated',
          lastName: 'Playwright',
          dateOfBirth: yearsAgoIso(10),
          gender: 1,
          primaryContactNo: uniquePhone(),
          familyCast: 'General',
          city: 'Ahmedabad',
          state: state(),
          country: country(),
          academicMediumId: placement.academicMediumId,
          standardId: placement.alternateStandardId,
        } as any,
      }
    );
    await expectOk(response, 'update registration class');
    expect(unwrapApiData(await response.json()).standardId).toBe(placement.alternateStandardId);

    const refreshed = unwrapApiData(
      await (
        await studentApiRequest(
          page,
          `/student/enrollment/registrations/${registration.studentId}/general-details`
        )
      ).json()
    );
    expect(refreshed.standardId).toBe(placement.alternateStandardId);

    await openStudentPageForEvidence(page, '/student/enrollment/registration');
    await captureBugScreenshot(page, 'student-4923-registration-class-update.png');
  });

  test('4922 family details accepts Aadhaar and nested address payloads', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    const registration = await createRegistration(page, placement, 'FamilyBug');

    const family = await updateFamilyDetails(page, registration.studentId);

    expect(family.fatherDetails?.aadharNo).toBe('111122223333');
    expect(family.motherDetails?.organization).toBe('Mother Org');
    expect(family.guardianDetails?.yearOfPassing).toBe('2005');
    expect(family.guardianDetails?.officeAddress?.city).toBe('Ahmedabad');
    expect(family.guardianDetails?.localAddress?.address1).toContain('E2E Guardian Home');

    await openStudentPageForEvidence(page, '/student/enrollment/registration');
    await captureBugScreenshot(page, 'student-4922-family-details-payload.png');
  });

  test('4918 GR number save rejects duplicate batch and existing conflicts', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    const first = await createRegistration(page, placement, 'GrBugA');
    const second = await createRegistration(page, placement, 'GrBugB');
    const grBase = Number(`8${Date.now().toString().slice(-5)}`);

    const validResponse = await studentApiRequest(page, '/students/records/gr-numbers', {
      method: 'POST',
      body: [
        { studentId: first.studentId, grNo: grBase },
        { studentId: second.studentId, grNo: grBase + 1 },
      ] as any,
    });
    await expectOk(validResponse, 'save unique GR numbers');

    const duplicateBatchResponse = await studentApiRequest(page, '/students/records/gr-numbers', {
      method: 'POST',
      body: [
        { studentId: first.studentId, grNo: grBase + 2 },
        { studentId: second.studentId, grNo: grBase + 2 },
      ] as any,
    });
    expect(duplicateBatchResponse.ok(), 'Duplicate GR batch should be rejected.').toBe(false);
    const duplicateBatchText = await duplicateBatchResponse.text();
    expect(duplicateBatchText).toContain('ST:Student:010002');
    expect(duplicateBatchText).toContain(`GR Number ${grBase + 2} is already assigned`);

    const existingConflictResponse = await studentApiRequest(page, '/students/records/gr-numbers', {
      method: 'POST',
      body: [{ studentId: first.studentId, grNo: grBase + 1 }] as any,
    });
    expect(existingConflictResponse.ok(), 'Existing GR conflict should be rejected.').toBe(false);
    const existingConflictText = await existingConflictResponse.text();
    expect(existingConflictText).toContain('ST:Student:010002');
    expect(existingConflictText).toContain(`GR Number ${grBase + 1} is already assigned`);

    await openStudentPageForEvidence(page, '/student/management/bulk-data-update');
    await captureBugScreenshot(page, 'student-4918-duplicate-gr-validation.png');
  });

  test('4291 duplicate house creation is rejected with readable validation', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const academicMediumId = await resolveAcademicMediumId(page);
    const houseName = uniqueToken('HouseBug');

    const createResponse = await studentApiRequest(
      page,
      `/students/records/academic-mediums/${academicMediumId}/house-settings`,
      {
        method: 'POST',
        body: {
          name: houseName,
          color: '#0EA5E9',
        } as any,
      }
    );
    await expectOk(createResponse, 'create house');

    const duplicateResponse = await studentApiRequest(
      page,
      `/students/records/academic-mediums/${academicMediumId}/house-settings`,
      {
        method: 'POST',
        body: {
          name: ` ${houseName.toLowerCase()} `,
          color: '#0284C7',
        } as any,
      }
    );
    expect(duplicateResponse.ok(), 'Duplicate House should be rejected.').toBe(false);
    const duplicateProblem = await duplicateResponse.json();
    expect(duplicateProblem.errorCode).toBe('ST:Records:050004');
    expect(duplicateProblem.detail).toContain('already exists');

    await openStudentPageForEvidence(page, '/student/studentRecords/setting');
    await captureBugScreenshot(page, 'student-4291-duplicate-house-validation.png');
  });

  test('4920 roll number save rejects values above division student count', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    test.skip(!placement.divisionId, 'Need a seeded division for roll number validation.');

    const registration = await createRegistration(page, placement, 'RollMaxBug');
    await updateFamilyDetails(page, registration.studentId);
    await updateCommunicationDetails(page, registration.studentId);

    const moveResponse = await studentApiRequest(
      page,
      `/student-enrollment/entrance-exam/${registration.studentId}/move-to-admission`,
      { method: 'POST' }
    );
    await expectOk(moveResponse, 'move registration to admission for roll number validation');

    const approveResponse = await studentApiRequest(page, '/students/admissions/status', {
      method: 'POST',
      body: {
        items: [
          {
            studentId: registration.studentId,
            action: 1,
            remarks: 'Admission approved for roll number validation.',
          },
        ],
      } as any,
    });
    await expectOk(approveResponse, 'approve admission for roll number validation');
    const approval = await approveResponse.json();
    expect(approval.succeeded).toBe(1);
    expect(approval.failed).toBe(0);

    const projectionResponse = await studentApiRequest(
      page,
      `/students/records/${placement.divisionId}/roll-number-projections`
    );
    await expectOk(projectionResponse, 'load roll number projections');
    const projections = unwrapApiData(await projectionResponse.json());
    const totalStudents = Array.isArray(projections) ? projections.length : 0;
    expect(totalStudents).toBeGreaterThan(0);

    const outOfRangeRollNo = totalStudents + 1;
    const rejectedResponse = await studentApiRequest(
      page,
      `/students/records/${placement.divisionId}/roll-numbers`,
      {
        method: 'POST',
        body: [{ studentId: registration.studentId, rollNo: outOfRangeRollNo }] as any,
      }
    );
    expect(rejectedResponse.ok(), 'Out-of-range Roll No. should be rejected.').toBe(false);
    const problem = await rejectedResponse.json();
    expect(problem.errorCode).toBe('ST:Records:050006');
    expect(problem.detail).toContain(
      `Roll numbers cannot exceed total students (${totalStudents}).`
    );

    await openStudentPageForEvidence(page, '/student/management?tab=rollGeneration');
    await captureBugScreenshot(page, 'student-4920-roll-no-max-validation.png');
  });

  test('4950 duplicate GR validation returns a readable detail message', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    const first = await createRegistration(page, placement, 'GrReadableA');
    const second = await createRegistration(page, placement, 'GrReadableB');
    const grBase = Number(`7${Date.now().toString().slice(-5)}`);

    const validResponse = await studentApiRequest(page, '/students/records/gr-numbers', {
      method: 'POST',
      body: [
        { studentId: first.studentId, grNo: grBase },
        { studentId: second.studentId, grNo: grBase + 1 },
      ] as any,
    });
    await expectOk(validResponse, 'save unique GR numbers');

    const duplicateResponse = await studentApiRequest(page, '/students/records/gr-numbers', {
      method: 'POST',
      body: [{ studentId: first.studentId, grNo: grBase + 1 }] as any,
    });
    expect(duplicateResponse.ok(), 'Duplicate GR should be rejected.').toBe(false);
    const problem = await duplicateResponse.json();
    expect(problem.errorCode).toBe('ST:Student:010002');
    expect(problem.detail).toBe(`GR Number ${grBase + 1} is already assigned to another student.`);

    await openStudentPageForEvidence(page, '/student/management?tab=grGeneration');
    await captureBugScreenshot(page, 'student-4950-duplicate-gr-readable-error.png');
  });

  test('4919 admission approval with student email succeeds', async ({ page }) => {
    test.setTimeout(180_000);

    await login(page, process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com');
    const placement = await resolveAcademicPlacement(page);
    test.skip(!placement.divisionId, 'Need a seeded division to approve admission.');

    const registration = await createRegistration(page, placement, 'AdmissionBug', {
      email: `${uniqueToken('student-admission').toLowerCase()}@example.com`,
    });
    await updateFamilyDetails(page, registration.studentId);
    await updateCommunicationDetails(page, registration.studentId);

    const moveResponse = await studentApiRequest(
      page,
      `/student-enrollment/entrance-exam/${registration.studentId}/move-to-admission`,
      { method: 'POST' }
    );
    await expectOk(moveResponse, 'move registration to admission');

    const approveResponse = await studentApiRequest(page, '/students/admissions/status', {
      method: 'POST',
      body: {
        items: [
          {
            studentId: registration.studentId,
            action: 1,
            remarks: 'Admission approved after email account validation.',
          },
        ],
      } as any,
    });
    await expectOk(approveResponse, 'approve admission with student email');
    const approval = await approveResponse.json();
    expect(approval.succeeded).toBe(1);
    expect(approval.failed).toBe(0);
    expect(approval.results?.[0]?.success).toBe(true);
    expect(approval.results?.[0]?.message ?? '').not.toMatch(/unexpected error/i);

    const secondApproveResponse = await studentApiRequest(page, '/students/admissions/status', {
      method: 'POST',
      body: {
        items: [
          {
            studentId: registration.studentId,
            action: 1,
            remarks: 'Admission approval rechecked for idempotency.',
          },
        ],
      } as any,
    });
    await expectOk(secondApproveResponse, 'approve already-approved admission');
    const secondApproval = await secondApproveResponse.json();
    expect(secondApproval.succeeded).toBe(1);
    expect(secondApproval.failed).toBe(0);
    expect(secondApproval.results?.[0]?.success).toBe(true);
    expect(secondApproval.results?.[0]?.message ?? '').not.toMatch(/unexpected error/i);

    await openStudentPageForEvidence(page, '/student/enrollment/admission');
    await captureBugScreenshot(page, 'student-4919-admission-status-approval.png');
  });
});
