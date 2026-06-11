/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
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
  '/student/enrollment/dashboard',
  '/student/enrollment/entrance-exam/dashboard',
  '/student/enrollment/inquiry',
  '/student/enrollment/registration',
  '/student/enrollment/admission',
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
});
