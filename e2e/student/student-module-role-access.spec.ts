/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import * as fs from 'node:fs';
import * as nodePath from 'node:path';
import { test, expect, type Page, type APIResponse } from '@playwright/test';

const studentE2EEnabled = process.env.E2E_STUDENT_MODULE === '1';
const tenant = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || 'Temp@123';

type StudentRequestInit = Omit<
  NonNullable<Parameters<Page['request']['fetch']>[1]>,
  'data'
> & {
  body?: unknown;
};

const roleUsers = [
  { label: 'Admin', email: process.env.E2E_ADMIN_EMAIL || 'admin-ddvs@ddvs.com' },
  { label: 'Principal', email: process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com' },
  { label: 'Teacher', email: process.env.E2E_TEACHER_EMAIL || 'teacher-gseb@ddvs.com' },
  { label: 'Clerk', email: process.env.E2E_CLERK_EMAIL || 'clerk-office@ddvs.com' },
  { label: 'Finance Officer', email: process.env.E2E_FINANCE_EMAIL || 'finance-officer@ddvs.com' },
];

const studentApiSmokePaths = (academicMediumId: string) => [
  `/students/records/profiles/search?searchTerm=a&maxResultCount=5`,
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
  '/student/enrollment/entrance-exams',
  '/student/enrollment/registration',
  '/student/enrollment/activation',
  '/student/enrollment/activation',
  '/student/enrollment/my-work',
  '/student/enrollment/reports',
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
  init: StudentRequestInit = {}
): Promise<APIResponse> {
  const token = await getAccessToken(page);
  const { body, signal, ...requestInit } = init;

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(signal ? { signal } : {}),
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

});
