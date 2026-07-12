/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type APIResponse, type Page } from '@playwright/test';

const studentCrmPreflightEnabled = process.env.E2E_STUDENT_CRM_PREFLIGHT === '1';
const tenantCode = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || 'Temp@123';
const principalEmail = () => process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com';

type JsonRequestInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

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
        headers: { __tenant: tenantCode() },
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

async function login(page: Page) {
  await waitForBackend(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(tenantCode());
  await page.getByLabel('Email / Username').fill(principalEmail());
  await page.getByLabel('Password').fill(password());

  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toBeEnabled({ timeout: 30_000 });
  await signInButton.click();

  await expect.poll(() => hasAccessToken(page), { timeout: 60_000 }).toBe(true);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
  await page.evaluate(() => localStorage.setItem('onboarding_completed', 'true'));
}

async function crmApiRequest(page: Page, path: string, init: JsonRequestInit = {}) {
  const token = await getAccessToken(page);
  const { body, ...requestInit } = init;

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(body === undefined ? {} : { data: body }),
    headers: {
      accept: 'application/json',
      __tenant: tenantCode(),
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

async function resolveAcademicYearId(page: Page) {
  const response = await crmApiRequest(page, '/app/academic-year?Sorting=name');
  await expectOk(response, 'GET academic years');
  const payload = await response.json();
  const items = (payload?.items ?? []) as Array<{ id?: string; startDate?: string; endDate?: string }>;
  const now = Date.now();
  const currentYear = items.find((item) => {
    const start = item.startDate ? Date.parse(item.startDate) : Number.NaN;
    const end = item.endDate ? Date.parse(item.endDate) : Number.NaN;
    return Number.isFinite(start) && Number.isFinite(end) && start <= now && now <= end;
  });
  const latestStartedYear = [...items]
    .filter((item) => {
      const start = item.startDate ? Date.parse(item.startDate) : Number.NaN;
      return Number.isFinite(start) && start <= now;
    })
    .sort((a, b) => Date.parse(b.startDate ?? '') - Date.parse(a.startDate ?? ''))[0];
  const academicYearId = (currentYear ?? latestStartedYear ?? items[0])?.id;
  expect(academicYearId, 'Seeded academic year is required for admissions CRM preflight.').toBeTruthy();
  return academicYearId as string;
}

test.describe('Student admissions CRM read-only preflight', () => {
  test.skip(
    !studentCrmPreflightEnabled,
    'Set E2E_STUDENT_CRM_PREFLIGHT=1 through the guarded CRM runner.'
  );

  test('principal can read required CRM setup without creating test data', async ({ page }) => {
    await login(page);

    const applicationConfigurationResponse = await crmApiRequest(
      page,
      '/abp/application-configuration'
    );
    await expectOk(applicationConfigurationResponse, 'GET authenticated application configuration');

    const academicYearId = await resolveAcademicYearId(page);

    const readChecks: Array<[string, string]> = [
      [
        'GET CRM cycle configuration',
        `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`,
      ],
      [
        'GET CRM pipeline stages',
        `/student-enrollment/admissions-crm/${academicYearId}/configuration/pipeline-stages`,
      ],
      [
        'GET CRM leads list',
        `/student-enrollment/admissions-crm/${academicYearId}/leads?maxResultCount=1`,
      ],
      [
        'GET CRM analytics summary',
        `/student-enrollment/admissions-crm/${academicYearId}/analytics/summary`,
      ],
    ];

    for (const [label, path] of readChecks) {
      await expectOk(await crmApiRequest(page, path), label);
    }

    const response = await page.goto('/student/enrollment/pipeline', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(response?.status(), 'GET /student/enrollment/pipeline').toBeLessThan(400);
    await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /Admissions (CRM|Pipeline)/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
