/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop */
import type { AddressInfo } from 'node:net';

import AxeBuilder from '@axe-core/playwright';
import { type Server, createServer } from 'node:http';
import { test, expect, type Page, type Locator } from '@playwright/test';

import {
  admissionCrmScaleTotal,
  buildAdmissionCrmScaleStaff,
  buildAdmissionCrmScaleLeadPage,
} from './fixtures/admission-crm-scale';

const studentCrmE2EEnabled = process.env.E2E_STUDENT_CRM === '1';
const tenantCode = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || 'Temp@123';
const principalEmail = () => process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com';
const restrictedCrmEmail = () => process.env.E2E_STUDENT_CRM_DENIED_EMAIL;
const restrictedCrmPassword = () => process.env.E2E_STUDENT_CRM_DENIED_PASSWORD || password();
const receptionistEmail = () =>
  process.env.E2E_STUDENT_CRM_RECEPTIONIST_EMAIL || 'admissions-reception@ddvs.com';
const counselorEmail = () =>
  process.env.E2E_STUDENT_CRM_COUNSELOR_EMAIL || 'admissions-counselor@ddvs.com';
const approverEmail = () =>
  process.env.E2E_STUDENT_CRM_APPROVER_EMAIL || 'admissions-approver@ddvs.com';
const enrollmentWorkspaceRoutes = [
  '/student/enrollment/pipeline',
  '/student/enrollment/exams',
  '/student/enrollment/registrations',
  '/student/enrollment/offers-seats',
  '/student/enrollment/activation',
  '/student/enrollment/operations',
  '/student/enrollment/analytics',
] as const;
const enrollmentSettingsRoutes = [
  '/student/enrollment/settings/journey',
  '/student/enrollment/settings/inquiry-capture',
  '/student/enrollment/settings/routing-scoring',
  '/student/enrollment/settings/entrance-exams',
  '/student/enrollment/settings/registration-documents',
  '/student/enrollment/settings/offers-seats',
  '/student/enrollment/settings/activation',
  '/student/enrollment/settings/governance',
  '/student/enrollment/settings/communications',
  '/student/enrollment/settings/automation',
] as const;
let otpWebhookServer: Server;
let otpWebhookUrl = '';
let capturedOtp = '';

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

async function login(page: Page, email = principalEmail(), passwordValue = password()) {
  await waitForBackend(page);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(tenantCode());
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(passwordValue);

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

async function publicApiRequest(page: Page, path: string, init: JsonRequestInit = {}) {
  const { body, ...requestInit } = init;

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(body === undefined ? {} : { data: body }),
    headers: {
      accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

type PlaywrightResponse = {
  ok(): boolean;
  status(): number;
  text(): Promise<string>;
};

async function expectOk(response: PlaywrightResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getApplicationConfiguration(page: Page) {
  const response = await crmApiRequest(page, '/abp/application-configuration');
  await expectOk(response, 'GET application configuration');
  return response.json();
}

async function resolveAcademicYearId(page: Page) {
  const response = await crmApiRequest(page, '/app/academic-year?Sorting=name');
  await expectOk(response, 'GET academic years');
  const payload = await response.json();
  const items = (payload?.items ?? []) as Array<{
    id?: string;
    startDate?: string;
    endDate?: string;
  }>;
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
  expect(academicYearId, 'Seeded academic year is required for admissions CRM E2E.').toBeTruthy();
  return academicYearId as string;
}

const workspaceUrl = (path: string, academicYearId: string) => {
  const url = new URL(path, 'http://student-enrollment.local');
  url.searchParams.set('cycle', academicYearId);
  return `${url.pathname}${url.search}`;
};

const uniqueToken = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const uniquePhone = () => `9${Date.now().toString().slice(-9)}`;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function createCrmLead(page: Page, academicYearId: string, phone: string, suffix: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/leads`,
    {
      method: 'POST',
      body: {
        channel: 1,
        firstName: uniqueToken(`Crm${suffix}`),
        parentGuardianName: 'Playwright Parent',
        primaryContactNo: phone,
        admissionIntent: 'Admission inquiry for Grade 1',
        desiredClassName: 'Grade 1',
        campaignName: 'Playwright CRM Smoke',
        notes: 'Created by admissions CRM E2E.',
      },
    }
  );
  await expectOk(response, 'create CRM lead');
  return response.json();
}

async function createPublishedRegistrationTemplate(
  page: Page,
  academicYearId: string,
  desiredClass: string,
  name: string
) {
  const createResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration/registration-templates`,
    {
      method: 'POST',
      body: {
        name,
        isFallback: false,
        applicability: { desiredClass },
        sections: [
          {
            key: 'student',
            title: 'Student details',
            displayOrder: 10,
            parentVisible: true,
            fields: [
              {
                key: 'studentFirstName',
                label: 'Student first name',
                fieldType: 0,
                systemField: 'firstName',
                required: true,
                parentEditable: false,
                displayOrder: 10,
                options: [],
              },
            ],
          },
        ],
        linkExpiryDays: 14,
        allowPartialSave: true,
        feeRequired: false,
        feeAmount: 0,
      },
    }
  );
  await expectOk(createResponse, 'create registration template for UI issuance');
  const template = await createResponse.json();
  await expectOk(
    await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/configuration/registration-templates/${template.id}/publish`,
      { method: 'POST' }
    ),
    'publish registration template for UI issuance'
  );
  return template;
}

async function getAvailableEntranceExamSlot(page: Page, academicYearId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/catalog/exam-slots?includeInactive=false&maxResultCount=100`
  );
  await expectOk(response, 'list CRM entrance exam slots');
  const payload = await response.json();
  const slot = payload?.items?.find(
    (item: { isActive?: boolean; remainingCapacity?: number }) =>
      item.isActive && (item.remainingCapacity ?? 0) > 0
  );
  expect(slot, 'A seeded CRM exam slot with remaining capacity is required.').toBeTruthy();
  return slot;
}

async function getCrmCycleConfiguration(page: Page, academicYearId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`
  );
  await expectOk(response, 'get CRM cycle configuration');
  return response.json();
}

async function updateCrmCycleRegistrationGate(
  page: Page,
  academicYearId: string,
  currentConfiguration: Record<string, unknown>,
  registrationFormRequiredBeforeExam: boolean
) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`,
    {
      method: 'PUT',
      body: {
        ...currentConfiguration,
        registrationFormRequiredBeforeExam,
      },
    }
  );
  await expectOk(response, 'update CRM cycle registration gate');
  return response.json();
}

async function getCrmLead(page: Page, leadId: string) {
  const response = await crmApiRequest(page, `/student-enrollment/admissions-crm/leads/${leadId}`);
  await expectOk(response, 'get CRM lead');
  return response.json();
}

async function getCrmTimeline(page: Page, leadId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/leads/${leadId}/timeline?maxResultCount=50`
  );
  await expectOk(response, 'get CRM lead timeline');
  return response.json();
}

async function getCrmExamRecord(page: Page, academicYearId: string, examRecordId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/exams?maxResultCount=200`
  );
  await expectOk(response, 'list CRM entrance exams');
  const payload = await response.json();
  const exam = payload?.items?.find((item: { id?: string }) => item.id === examRecordId);
  expect(
    exam,
    `CRM exam record ${examRecordId} should be returned in the workspace list.`
  ).toBeTruthy();
  return exam;
}

async function openExamRowInWorkspace(
  page: Page,
  applicantName: string,
  slotName: string,
  academicYearId: string
): Promise<Locator> {
  const response = await page.goto(workspaceUrl('/student/enrollment/exams', academicYearId), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  expect(response?.status(), 'GET /student/enrollment/exams').toBeLessThan(400);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Entrance Exams' })).toBeVisible({
    timeout: 30_000,
  });

  const filteredExamsResponse = page.waitForResponse((candidate) => {
    if (candidate.request().method() !== 'GET') return false;
    const url = new URL(candidate.url());
    return (
      /\/student-enrollment\/admissions-crm\/[^/]+\/exams$/.test(url.pathname) &&
      url.searchParams.get('filterText') === applicantName
    );
  });
  await page.getByRole('textbox', { name: 'Search entrance exams' }).fill(applicantName);
  await expectOk(await filteredExamsResponse, 'filter CRM entrance exams');
  await expect(page.getByText(/1[–-]1 of 1/)).toBeVisible({ timeout: 15_000 });

  const examRow = page.getByRole('row', {
    name: new RegExp(`${escapeRegExp(applicantName)}.*${escapeRegExp(slotName)}`, 'i'),
  });
  await expect(examRow).toBeVisible({ timeout: 30_000 });
  return examRow;
}

async function openLeadCardInWorkspace(
  page: Page,
  leadName: string,
  academicYearId: string
): Promise<Locator> {
  const response = await page.goto(
    workspaceUrl('/student/enrollment/pipeline?view=board', academicYearId),
    {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    }
  );
  expect(response?.status(), 'GET /student/enrollment/pipeline').toBeLessThan(400);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /Admissions (CRM|Pipeline)/i })).toBeVisible({
    timeout: 30_000,
  });

  const leadCard = page.locator('.MuiCard-root').filter({ hasText: leadName }).first();
  await expect(leadCard).toBeVisible({ timeout: 30_000 });
  return leadCard;
}

async function createPublicInquiryTemplate(page: Page, academicYearId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-templates`,
    {
      method: 'POST',
      body: {
        templateName: `Playwright public inquiry ${uniqueToken('')}`,
        description: 'Admissions CRM public form E2E template.',
        channel: 3,
        isPublic: true,
        consentText: 'I consent to receive admission communication from the school.',
        privacyNoticeUrl: 'https://school.example/privacy',
        fields: [
          {
            key: 'studentFirstName',
            label: 'Student first name',
            fieldType: 0,
            systemField: 'FirstName',
            required: true,
            displayOrder: 10,
          },
          {
            key: 'parentPhone',
            label: 'Parent phone',
            fieldType: 5,
            systemField: 'PrimaryContactNo',
            required: true,
            displayOrder: 20,
          },
          {
            key: 'parentEmail',
            label: 'Parent email',
            fieldType: 4,
            systemField: 'Email',
            required: false,
            displayOrder: 30,
          },
          {
            key: 'admissionIntent',
            label: 'Admission intent',
            fieldType: 1,
            systemField: 'AdmissionIntent',
            required: true,
            displayOrder: 40,
          },
          {
            key: 'desiredClass',
            label: 'Desired class',
            fieldType: 0,
            systemField: 'DesiredClassName',
            required: true,
            displayOrder: 50,
          },
        ],
      },
    }
  );
  await expectOk(response, 'create public CRM form template');
  return response.json();
}

test.describe('Student admissions CRM E2E', () => {
  test.skip(!studentCrmE2EEnabled, 'Set E2E_STUDENT_CRM=1 against a seeded local backend.');

  test.beforeAll(async () => {
    otpWebhookServer = createServer((request, response) => {
      let rawBody = '';
      request.on('data', (chunk) => {
        rawBody += chunk.toString();
      });
      request.on('end', () => {
        try {
          const payload = JSON.parse(rawBody) as { body?: string; message?: { body?: string } };
          const message = payload.body || payload.message?.body || '';
          capturedOtp = message.match(/\b\d{6}\b/)?.[0] || capturedOtp;
        } catch {
          capturedOtp = '';
        }
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ messageId: uniqueToken('otp-') }));
      });
    });
    await new Promise<void>((resolve, reject) => {
      otpWebhookServer.once('error', reject);
      otpWebhookServer.listen(0, '127.0.0.1', () => resolve());
    });
    const address = otpWebhookServer.address() as AddressInfo;
    otpWebhookUrl = `http://127.0.0.1:${address.port}/admissions-otp`;
  });

  test.afterAll(async () => {
    await new Promise<void>((resolve) => otpWebhookServer.close(() => resolve()));
  });

  test('anonymous users cannot access protected CRM lead APIs', async ({ page }) => {
    const response = await page.request.get(
      `${apiBaseUrl()}/api/student-enrollment/admissions-crm/00000000-0000-0000-0000-000000000000/leads`,
      { headers: { __tenant: tenantCode() }, maxRedirects: 0 }
    );

    expect([401, 403, 302], `Protected CRM API returned ${response.status()}.`).toContain(
      response.status()
    );
    if (response.status() === 302) {
      expect(response.headers().location ?? '').toContain('/Account/Login');
    }
  });

  test('restricted users cannot operate the protected CRM workspace', async ({ page }) => {
    test.skip(
      !restrictedCrmEmail(),
      'Set E2E_STUDENT_CRM_DENIED_EMAIL for CRM role-denial coverage.'
    );

    await login(page, restrictedCrmEmail()!, restrictedCrmPassword());

    const apiResponse = await crmApiRequest(
      page,
      '/student-enrollment/admissions-crm/00000000-0000-0000-0000-000000000000/leads'
    );
    expect([401, 403], `Restricted CRM API returned ${apiResponse.status()}.`).toContain(
      apiResponse.status()
    );

    await page.goto('/student/enrollment/pipeline', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByRole('button', { name: /Quick Inquiry/i })).not.toBeVisible({
      timeout: 10_000,
    });
  });

  // These generated tests must be registered synchronously at declaration time.
  // eslint-disable-next-line no-restricted-syntax
  for (const persona of [
    {
      label: 'receptionist',
      email: receptionistEmail,
      granted: ['Add', 'AssignOwner', 'IssueRegistrationForm'],
      denied: ['ScheduleExam', 'ManageOffers', 'ApproveActivation'],
    },
    {
      label: 'counselor',
      email: counselorEmail,
      granted: ['ScheduleExam', 'ChangeExamResult', 'ReviewDocuments'],
      denied: ['OverrideExamResult', 'ManageOffers', 'ApproveActivation'],
    },
    {
      label: 'approver',
      email: approverEmail,
      granted: ['ManageOffers', 'ApproveOffers', 'ApproveActivation', 'OverrideExamResult'],
      denied: ['Add', 'ManageConfiguration'],
    },
  ]) {
    test(`${persona.label} receives the intended CRM permission boundary`, async ({ page }) => {
      await login(page, persona.email(), password());
      const configuration = await getApplicationConfiguration(page);
      const grantedPolicies = configuration?.auth?.grantedPolicies ?? {};
      const permission = (name: string) => `Students.Enrollment.AdmissionsCrm.${name}`;

      persona.granted.forEach((name) => expect(grantedPolicies[permission(name)]).toBe(true));
      persona.denied.forEach((name) => expect(grantedPolicies[permission(name)]).not.toBe(true));
    });
  }

  test('Enrollment workspaces have no serious or critical automated accessibility violations', async ({
    page,
  }) => {
    test.setTimeout(480_000);
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    // The same authenticated page is intentionally validated one route at a time.
    // eslint-disable-next-line no-restricted-syntax
    for (const route of [...enrollmentWorkspaceRoutes, ...enrollmentSettingsRoutes]) {
      const response = await page.goto(workspaceUrl(route, academicYearId), {
        waitUntil: 'networkidle',
        timeout: 60_000,
      });
      expect(response?.status(), route).toBeLessThan(400);
      await expect(page.getByRole('heading', { name: 'Sorry, page not found!' })).toHaveCount(0);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const releaseBlockingViolations = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact || '')
      );
      expect(releaseBlockingViolations, route).toEqual([]);
    }
  });

  test('Enrollment workspaces remain usable at release viewports', async ({ page }) => {
    test.setTimeout(600_000);
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    // Viewport changes and navigations remain serial on the same authenticated page.
    // eslint-disable-next-line no-restricted-syntax
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      // eslint-disable-next-line no-restricted-syntax
      for (const route of enrollmentWorkspaceRoutes) {
        await page.goto(workspaceUrl(route, academicYearId), {
          waitUntil: 'networkidle',
          timeout: 60_000,
        });
        await expect(page.locator('#student-enrollment-content')).toBeVisible();

        const widths = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(
          Math.max(widths.document, widths.body),
          `${route} at ${viewport.width}x${viewport.height} document overflow`
        ).toBeLessThanOrEqual(widths.viewport + 1);
      }
    }
  });

  test('Enrollment remains bounded with a deterministic 25,000-lead fixture', async ({ page }) => {
    test.setTimeout(180_000);
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const leadRequests: URL[] = [];
    const staffRequests: URL[] = [];

    await page.route(
      /\/api\/student-enrollment\/admissions-crm\/[^/]+\/leads(?:\?.*)?$/,
      async (route) => {
        const url = new URL(route.request().url());
        const maxResultCount = Number(url.searchParams.get('maxResultCount') || 50);
        const skipCount = Number(url.searchParams.get('skipCount') || 0);
        const stage = Number(url.searchParams.get('stage') || 0);
        leadRequests.push(url);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            buildAdmissionCrmScaleLeadPage({
              academicYearId,
              skipCount,
              maxResultCount,
              stage,
            })
          ),
        });
      }
    );
    await page.route(
      /\/api\/student-enrollment\/admissions-crm\/workspace\/staff(?:\?.*)?$/,
      async (route) => {
        const url = new URL(route.request().url());
        const maximum = Number(url.searchParams.get('maxResultCount') || 25);
        staffRequests.push(url);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildAdmissionCrmScaleStaff(maximum)),
        });
      }
    );

    await page.goto(`/student/enrollment/pipeline?cycle=${academicYearId}&view=list`, {
      waitUntil: 'networkidle',
      timeout: 60_000,
    });
    await expect(page.getByText(new RegExp(`of ${admissionCrmScaleTotal}`, 'i'))).toBeVisible();
    await expect(page.getByTestId('student-enrollment-pipeline-row')).toHaveCount(50);

    await page.getByRole('button', { name: 'Board view' }).click();
    await expect.poll(() => leadRequests.some((url) => url.searchParams.has('stage'))).toBe(true);

    expect(leadRequests.length).toBeGreaterThan(1);
    leadRequests.forEach((url) => {
      const maximum = Number(url.searchParams.get('maxResultCount'));
      expect(maximum).toBeLessThanOrEqual(url.searchParams.has('stage') ? 25 : 50);
    });
    expect(staffRequests.length).toBeGreaterThan(0);
    staffRequests.forEach((url) => {
      expect(Number(url.searchParams.get('maxResultCount'))).toBeLessThanOrEqual(25);
    });
  });

  test('workspace URLs preserve operational state without exposing applicant search text', async ({
    page,
  }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    await page.goto(
      `/student/enrollment/pipeline?cycle=${academicYearId}&view=list&stage=0&page=2`,
      { waitUntil: 'networkidle', timeout: 60_000 }
    );
    await page.getByLabel('Search applicants').fill('Parent phone 9999999999');
    await expect(page).toHaveURL(new RegExp(`cycle=${academicYearId}`));
    expect(page.url()).not.toContain('Parent');
    expect(page.url()).not.toContain('9999999999');

    await page.locator('a[href^="/student/enrollment/exams"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/exams/?\\?cycle=${academicYearId}`)
    );

    await page.goBack({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/view=list/);
    await expect(page).toHaveURL(/stage=0/);
    await expect(page).toHaveURL(/page=2/);

    await page.goto(`/student/enrollment/settings?cycle=${academicYearId}`, {
      waitUntil: 'networkidle',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/?\\?cycle=${academicYearId}`)
    );

    await page.goto('/student/enrollment/pipeline?stage=999&page=-2', {
      waitUntil: 'networkidle',
      timeout: 60_000,
    });
    await expect(page).not.toHaveURL(/stage=999/);
    await expect(page).not.toHaveURL(/page=-2/);
  });

  test('Enrollment settings use domain navigation and URL-backed task panels', async ({ page }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    await page.goto(`/student/enrollment/settings?cycle=${academicYearId}`, {
      waitUntil: 'networkidle',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/?\\?cycle=${academicYearId}`)
    );
    await expect(page.getByRole('heading', { name: 'Enrollment Setup Center' })).toBeVisible();
    await page.locator('a[href^="/student/enrollment/settings/journey"]').first().click();
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/journey/?\\?cycle=${academicYearId}`)
    );
    await expect(page.getByRole('heading', { name: 'Admission Journey' })).toBeVisible();
    await expect(page.getByText('Enrollment settings categories')).toHaveCount(0);

    const cycleName = page.getByRole('textbox', { name: 'Cycle name' });
    await expect(cycleName).not.toHaveValue('');
    const originalCycleName = await cycleName.inputValue();
    await cycleName.fill(`${originalCycleName} unsaved`);
    await page.getByRole('tab', { name: /Applicant Stages/ }).click();
    await expect(page.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
    await page.getByRole('button', { name: 'Discard & Continue' }).click();
    await expect(page).toHaveURL(/panel=pipeline/);
    await page.getByRole('tab', { name: /Admission Cycle/ }).click();
    await expect(page.getByRole('textbox', { name: 'Cycle name' })).toHaveValue(originalCycleName);

    const inquiryCaptureLink = page.getByRole('link', { name: 'Inquiry Forms & Sources' });
    await expect(inquiryCaptureLink).toHaveAttribute('href', new RegExp(`cycle=${academicYearId}`));
    await inquiryCaptureLink.click();
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/inquiry-capture/?\\?cycle=${academicYearId}`)
    );

    await page.getByRole('link', { name: /^Inquiry Forms Build and/ }).click();
    await expect(page).toHaveURL(/panel=forms/);
    await expect(page.getByRole('heading', { name: 'Form Templates' })).toBeVisible();

    await page.getByRole('link', { name: 'Exam & Eligibility' }).last().click();
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/entrance-exams/?\\?cycle=${academicYearId}`)
    );
    await expect(page.getByRole('table', { name: 'customizable table' })).toBeVisible();
    await expect(page.getByPlaceholder('Search...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Columns' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();

    await page.getByRole('button', { name: 'Quick setup' }).click();
    const quickSetupDialog = page.getByRole('dialog', { name: 'Quick admission setup' });
    await expect(quickSetupDialog).toBeVisible();
    await expect(quickSetupDialog.getByLabel('Assessment process')).toHaveText(
      'Written entrance exam'
    );
    await expect(
      quickSetupDialog.getByRole('switch', { name: 'Generate hall tickets for this exam' })
    ).not.toBeChecked();
    await quickSetupDialog.getByRole('button', { name: 'Cancel' }).click();

    await page.getByRole('button', { name: 'Advanced setup' }).click();
    await expect(page.getByRole('dialog', { name: 'New Admissions Playbook' })).toBeVisible();
    await expect(page.getByText('General', { exact: true })).toBeVisible();
    await expect(page.getByText('Slots & Rules', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Playbook name' })).toBeVisible();
  });

  test('Enrollment settings panels request only their owned configuration data', async ({
    page,
  }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const requestedPaths: string[] = [];
    page.on('request', (request) => {
      const { pathname } = new URL(request.url());
      if (pathname.includes('/student-enrollment/admissions-crm/')) requestedPaths.push(pathname);
    });

    await page.goto(
      `/student/enrollment/settings/inquiry-capture?cycle=${academicYearId}&panel=forms`,
      { waitUntil: 'networkidle', timeout: 60_000 }
    );
    await expect(page.getByRole('heading', { name: 'Form Templates' })).toBeVisible();

    expect(requestedPaths.some((path) => path.endsWith('/configuration/form-templates'))).toBe(
      true
    );
    expect(requestedPaths.some((path) => path.endsWith('/configuration/cycle'))).toBe(false);
    expect(requestedPaths.some((path) => path.endsWith('/configuration/pipeline-stages'))).toBe(
      false
    );
    expect(requestedPaths.some((path) => path.endsWith('/configuration/message-templates'))).toBe(
      false
    );
    expect(requestedPaths.some((path) => path.endsWith('/catalog/inquiry-sources'))).toBe(false);
    expect(requestedPaths.some((path) => path.endsWith('/workspace/staff'))).toBe(false);
  });

  test('principal can create quick inquiry, review duplicate warning, and open CRM workspace', async ({
    page,
  }) => {
    test.setTimeout(150_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const phone = uniquePhone();
    const firstLead = await createCrmLead(page, academicYearId, phone, 'Lead');

    expect(firstLead?.id, 'Created CRM lead should return an id.').toBeTruthy();
    expect(firstLead?.stage, 'New quick inquiry should start as New Inquiry.').toBe(0);
    expect(
      firstLead?.likelyDuplicateCount,
      'First CRM lead should not have duplicate warnings.'
    ).toBe(0);

    const duplicatePreviewResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/leads/duplicate-preview`,
      {
        method: 'POST',
        body: {
          firstName: firstLead.firstName,
          primaryContactNo: phone,
          admissionIntent: 'Admission inquiry for Grade 1',
        },
      }
    );
    await expectOk(duplicatePreviewResponse, 'preview CRM duplicate');
    const duplicatePreview = await duplicatePreviewResponse.json();
    expect(
      duplicatePreview?.length,
      'Duplicate preview should find the existing lead.'
    ).toBeGreaterThan(0);

    const duplicateCreateResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/leads`,
      {
        method: 'POST',
        body: {
          channel: 1,
          firstName: firstLead.firstName,
          parentGuardianName: 'Playwright Parent',
          primaryContactNo: phone,
          admissionIntent: 'Admission inquiry for Grade 1',
          desiredClassName: 'Grade 1',
          duplicateContinueReason: 'Parent called again during Playwright smoke test.',
        },
      }
    );
    await expectOk(duplicateCreateResponse, 'create CRM duplicate with continue reason');
    const duplicateLead = await duplicateCreateResponse.json();
    expect(duplicateLead?.likelyDuplicateCount).toBeGreaterThan(0);
    expect(duplicateLead?.duplicateContinueReason).toContain('Parent called again');

    const response = await page.goto(workspaceUrl('/student/enrollment/pipeline', academicYearId), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(response?.status(), 'GET /student/enrollment/pipeline').toBeLessThan(400);
    await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(
      /404|This page could not be found|Application error|Unhandled Runtime Error/i,
      { timeout: 5_000 }
    );
    await expect(page.getByRole('heading', { name: /Admissions (CRM|Pipeline)/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('button', { name: /Quick Inquiry/i })).toBeVisible();
  });

  test('public form captures consent and creates status token', async ({ page }) => {
    test.setTimeout(150_000);

    await login(page);
    const configuration = await getApplicationConfiguration(page);
    const tenantId = configuration?.currentTenant?.id;
    expect(tenantId, 'Current tenant id is required for public admissions CRM E2E.').toBeTruthy();

    const academicYearId = await resolveAcademicYearId(page);
    const template = await createPublicInquiryTemplate(page, academicYearId);

    const inquiryPage = await page.context().newPage();
    try {
      await inquiryPage.setViewportSize({ width: 390, height: 844 });
      await inquiryPage.goto(`/student/admissions/inquiry/${tenantId}/${template.id}`, {
        waitUntil: 'networkidle',
        timeout: 60_000,
      });
      await expect(inquiryPage.getByRole('heading', { name: template.templateName })).toBeVisible();
      const accessibility = await new AxeBuilder({ page: inquiryPage })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(
        accessibility.violations.filter((violation) =>
          ['serious', 'critical'].includes(violation.impact || '')
        ),
        'public inquiry accessibility'
      ).toEqual([]);
      const widths = await inquiryPage.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(Math.max(widths.document, widths.body)).toBeLessThanOrEqual(widths.viewport + 1);
    } finally {
      await inquiryPage.close();
    }

    const formResponse = await publicApiRequest(
      page,
      `/public/student-enrollment/admissions-crm/${tenantId}/forms/${template.id}`
    );
    await expectOk(formResponse, 'read public CRM form');
    const form = await formResponse.json();
    expect(form?.consentVersion, 'Public form should expose a consent version.').toBeTruthy();

    const submitResponse = await publicApiRequest(
      page,
      `/public/student-enrollment/admissions-crm/${tenantId}/forms/${template.id}/submit`,
      {
        method: 'POST',
        body: {
          consentVersion: form.consentVersion,
          consentAccepted: true,
          communicationPreferences: ['SMS'],
          fieldValues: {
            studentFirstName: uniqueToken('PublicCrm'),
            parentPhone: uniquePhone(),
            parentEmail: `${uniqueToken('parent').toLowerCase()}@example.com`,
            admissionIntent: 'Admission inquiry for Grade 2',
            desiredClass: 'Grade 2',
          },
        },
      }
    );
    await expectOk(submitResponse, 'submit public CRM form');
    const submit = await submitResponse.json();
    expect(submit?.leadId, 'Public submission should create a CRM lead.').toBeTruthy();
    expect(submit?.statusToken, 'Public submission should create a status token.').toBeTruthy();
    expect(submit?.statusPath, 'Public submission should return a status path.').toContain(
      submit.statusToken
    );

    const challengeResponse = await publicApiRequest(
      page,
      `/public/student-enrollment/admissions-crm/${tenantId}/status/${submit.statusToken}/otp`,
      { method: 'POST' }
    );
    await expectOk(challengeResponse, 'issue public status OTP');
    const challenge = await challengeResponse.json();
    expect(challenge?.maskedDestination, 'OTP challenge should mask the destination.').toBeTruthy();
    expect(challenge?.deliveryStatus, 'OTP challenge should return delivery status.').toBeTruthy();
  });

  test('principal can schedule exam, record result, and review eligibility handoff', async ({
    page,
  }) => {
    test.setTimeout(150_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const lead = await createCrmLead(page, academicYearId, uniquePhone(), 'Exam');
    const slot = await getAvailableEntranceExamSlot(page, academicYearId);

    const scheduleResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/leads/${lead.id}/exam/schedule`,
      {
        method: 'POST',
        body: { entranceExamSlotId: slot.id },
      }
    );
    await expectOk(scheduleResponse, 'schedule CRM entrance exam');
    const scheduled = await scheduleResponse.json();
    expect(scheduled?.leadId).toBe(lead.id);
    expect(scheduled?.entranceExamSlotId).toBe(slot.id);
    expect(scheduled?.attendanceStatus).toBe(0);

    const slotName = scheduled.slotNameSnapshot || slot.slotName;
    const examRow = await openExamRowInWorkspace(page, lead.firstName, slotName, academicYearId);
    await examRow.getByRole('button', { name: /Manage/i }).click();
    const examDialog = page.getByRole('dialog', { name: /Manage Entrance Exam/i });
    await expect(examDialog).toBeVisible({ timeout: 15_000 });

    await examDialog.getByLabel('Attendance').click();
    await page.getByRole('option', { name: 'Present' }).click();
    await examDialog.getByRole('button', { name: /Save Attendance/i }).click();
    await expect
      .poll(
        async () => (await getCrmExamRecord(page, academicYearId, scheduled.id)).attendanceStatus,
        { timeout: 30_000, message: 'UI attendance save should persist.' }
      )
      .toBe(1);

    await examDialog.getByLabel('Total marks').fill('100');
    await examDialog.getByLabel('Passing marks').fill('40');
    await examDialog.getByLabel('Obtained marks').fill('82');
    await examDialog.getByLabel('Merit rank').fill('1');
    const resultResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes(`/admissions-crm/exams/${scheduled.id}/result`)
    );
    await examDialog.getByRole('button', { name: /Save Result/i }).click();
    await expectOk(await resultResponsePromise, 'save CRM exam result from the workspace');
    await expect
      .poll(
        async () => {
          const exam = await getCrmExamRecord(page, academicYearId, scheduled.id);
          return {
            examStatus: exam.examStatus,
            eligibilityDecision: exam.eligibilityDecision,
            percentage: exam.percentage,
          };
        },
        { timeout: 30_000, message: 'UI result save should persist pass result.' }
      )
      .toEqual({ examStatus: 1, eligibilityDecision: 1, percentage: 82 });

    await examDialog.getByRole('combobox', { name: 'Decision' }).click();
    await page.getByRole('option', { name: 'Eligible' }).click();
    await examDialog
      .getByLabel('Decision reason')
      .fill('Eligible from Playwright CRM UI smoke test.');
    await examDialog.getByRole('button', { name: /Save Eligibility/i }).click();
    await expect
      .poll(
        async () =>
          (await getCrmExamRecord(page, academicYearId, scheduled.id)).eligibilityDecision,
        { timeout: 30_000, message: 'UI eligibility save should persist.' }
      )
      .toBe(1);

    await examDialog.getByRole('button', { name: 'Close' }).click({ force: true });

    const persistedExamRow = await openExamRowInWorkspace(
      page,
      lead.firstName,
      slotName,
      academicYearId
    );
    await expect(persistedExamRow).toContainText('82/100');
    await persistedExamRow.getByRole('button', { name: 'More actions' }).click();
    await page.getByRole('menuitem', { name: 'Eligibility Handoff' }).click();
    const handoffDialog = page.getByRole('dialog', { name: /Eligibility Handoff/i });
    await expect(handoffDialog).toBeVisible({ timeout: 15_000 });
    await expect(handoffDialog).toContainText('Eligible for admission handoff');
    await expect(handoffDialog).toContainText('82/100');
    await handoffDialog.getByRole('button', { name: 'Close' }).click();

    const eligibleHandoffResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/exams/${scheduled.id}/eligibility-handoff`
    );
    await expectOk(eligibleHandoffResponse, 'read eligible CRM handoff');
    const eligibleHandoff = await eligibleHandoffResponse.json();
    expect(eligibleHandoff?.canStartAdmission).toBe(true);
    expect(eligibleHandoff?.requiresManualReview).toBe(false);
    expect(eligibleHandoff?.leadId).toBe(lead.id);

    const decisionResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/exams/${scheduled.id}/eligibility`,
      {
        method: 'POST',
        body: {
          decision: 2,
          reason: 'Eligible but waitlisted during Playwright CRM smoke test.',
          meritRank: 1,
        },
      }
    );
    await expectOk(decisionResponse, 'waitlist CRM exam decision');
    const waitlisted = await decisionResponse.json();
    expect(waitlisted?.eligibilityDecision).toBe(2);
    expect(waitlisted?.eligibilityDecisionReason).toContain('waitlisted');

    const waitlistHandoffResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/exams/${scheduled.id}/eligibility-handoff`
    );
    await expectOk(waitlistHandoffResponse, 'read waitlisted CRM handoff');
    const waitlistHandoff = await waitlistHandoffResponse.json();
    expect(waitlistHandoff?.canStartAdmission).toBe(false);
    expect(waitlistHandoff?.requiresManualReview).toBe(true);
    expect(waitlistHandoff?.eligibilityDecision).toBe(2);
  });

  test('principal can issue registration form before a required exam schedule', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const originalCycle = await getCrmCycleConfiguration(page, academicYearId);
    await updateCrmCycleRegistrationGate(page, academicYearId, originalCycle, true);
    let registrationTemplate: { id: string } | undefined;

    try {
      const lead = await createCrmLead(page, academicYearId, uniquePhone(), 'FormGate');
      const registrationTemplateName = uniqueToken('Playwright exam gate ');
      registrationTemplate = await createPublishedRegistrationTemplate(
        page,
        academicYearId,
        'Grade 1',
        registrationTemplateName
      );
      const slot = await getAvailableEntranceExamSlot(page, academicYearId);

      const blockedSchedule = await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/leads/${lead.id}/exam/schedule`,
        {
          method: 'POST',
          body: { entranceExamSlotId: slot.id },
        }
      );
      expect(blockedSchedule.ok(), 'Exam schedule should be blocked before form issue.').toBe(
        false
      );
      expect(await blockedSchedule.text()).toContain(
        'AdmissionCrm:RegistrationFormRequiredBeforeExam'
      );

      const leadCard = await openLeadCardInWorkspace(page, lead.firstName, academicYearId);
      await expect(leadCard.getByText('Registration not issued')).toBeVisible();
      await leadCard.getByRole('button', { name: 'Registration' }).click();
      await expect(page.getByText('Registration has not been issued')).toBeVisible();
      await page.getByRole('button', { name: 'Issue registration' }).click();
      await page.getByLabel('Registration template').click();
      await page.getByRole('option', { name: `${registrationTemplateName} - v1` }).click();
      await page.getByRole('button', { name: 'Issue', exact: true }).click();

      await expect
        .poll(async () => (await getCrmLead(page, lead.id)).registrationFormNumber, {
          timeout: 30_000,
          message: 'Registration form issue should persist.',
        })
        .not.toBeFalsy();
      const issuedLead = await getCrmLead(page, lead.id);
      expect(issuedLead.registrationFormNumber).toBeTruthy();
      const issuedFormNumber = String(issuedLead.registrationFormNumber);
      await expect(leadCard.getByText(new RegExp(escapeRegExp(issuedFormNumber)))).toBeVisible();

      const timeline = await getCrmTimeline(page, lead.id);
      expect(
        timeline?.items?.some(
          (item: { eventType?: number; details?: string }) =>
            item.eventType === 20 && item.details?.includes(issuedFormNumber)
        ),
        'Registration form issue should be recorded in the CRM timeline.'
      ).toBe(true);

      const scheduleResponse = await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/leads/${lead.id}/exam/schedule`,
        {
          method: 'POST',
          body: { entranceExamSlotId: slot.id },
        }
      );
      await expectOk(scheduleResponse, 'schedule CRM entrance exam after form issue');
      const scheduled = await scheduleResponse.json();
      expect(scheduled?.leadId).toBe(lead.id);
      expect(scheduled?.entranceExamSlotId).toBe(slot.id);
    } finally {
      if (registrationTemplate?.id) {
        await crmApiRequest(
          page,
          `/student-enrollment/admissions-crm/configuration/registration-templates/${registrationTemplate.id}/retire`,
          { method: 'POST' }
        );
      }
      await updateCrmCycleRegistrationGate(
        page,
        academicYearId,
        originalCycle,
        Boolean(originalCycle.registrationFormRequiredBeforeExam)
      );
    }
  });

  test('principal and parent complete registration, document correction, readiness, and handoff', async ({
    page,
  }) => {
    test.setTimeout(300_000);

    await login(page);
    const applicationConfiguration = await getApplicationConfiguration(page);
    const tenantId = applicationConfiguration?.currentTenant?.id as string;
    expect(tenantId).toBeTruthy();
    const academicYearId = await resolveAcademicYearId(page);
    const unique = uniqueToken('journey-');
    const campus = `Playwright campus ${unique}`;
    const phone = uniquePhone();

    const leadResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/leads`,
      {
        method: 'POST',
        body: {
          channel: 1,
          firstName: `Journey${unique}`,
          parentGuardianName: 'Playwright Parent',
          primaryContactNo: phone,
          admissionIntent: 'Admission inquiry for Grade 1',
          desiredClassName: 'Grade 1',
          campusBranchName: campus,
        },
      }
    );
    await expectOk(leadResponse, 'create registration journey lead');
    const lead = await leadResponse.json();

    const registrationTemplateResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/configuration/registration-templates`,
      {
        method: 'POST',
        body: {
          name: `Playwright registration ${unique}`,
          isFallback: false,
          applicability: { campus },
          sections: [
            {
              key: 'family',
              title: 'Family and declaration',
              displayOrder: 10,
              fields: [
                {
                  key: 'studentFirstName',
                  label: 'Student first name',
                  fieldType: 0,
                  systemField: 'firstName',
                  required: true,
                  parentEditable: false,
                  displayOrder: 10,
                },
                {
                  key: 'parentOccupation',
                  label: 'Parent occupation',
                  fieldType: 0,
                  required: true,
                  parentEditable: true,
                  minimumLength: 2,
                  displayOrder: 20,
                },
                {
                  key: 'declarationAccepted',
                  label: 'Declaration accepted',
                  fieldType: 8,
                  required: true,
                  parentEditable: true,
                  displayOrder: 30,
                },
              ],
            },
          ],
          linkExpiryDays: 14,
          allowPartialSave: true,
          feeRequired: false,
          feeAmount: 0,
        },
      }
    );
    await expectOk(registrationTemplateResponse, 'create registration template');
    const registrationTemplate = await registrationTemplateResponse.json();
    await expectOk(
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/configuration/registration-templates/${registrationTemplate.id}/publish`,
        { method: 'POST' }
      ),
      'publish registration template'
    );

    const checklistTemplateResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/configuration/document-checklists`,
      {
        method: 'POST',
        body: {
          name: `Playwright documents ${unique}`,
          isFallback: false,
          applicability: { campus },
          readinessApprovalCount: 1,
          requirements: [
            {
              key: 'birth-certificate',
              name: 'Birth certificate',
              requirementLevel: 0,
              blocksAdmissionReadiness: true,
              requiresOriginal: true,
              validityDateRequired: false,
              maximumSizeMb: 2,
              acceptedExtensions: ['pdf'],
              displayOrder: 10,
            },
          ],
        },
      }
    );
    await expectOk(checklistTemplateResponse, 'create document checklist template');
    const checklistTemplate = await checklistTemplateResponse.json();
    await expectOk(
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/configuration/document-checklists/${checklistTemplate.id}/publish`,
        { method: 'POST' }
      ),
      'publish document checklist template'
    );

    const issueResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/leads/${lead.id}/registrations/issue`,
      {
        method: 'POST',
        body: {
          registrationTemplateId: registrationTemplate.id,
          manualFormNumber: `PW-${unique.toUpperCase()}`,
          waiveFee: false,
        },
      }
    );
    await expectOk(issueResponse, 'issue CRM registration');
    const registration = await issueResponse.json();
    const assignedChecklistResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/registrations/${registration.id}/document-checklist`
    );
    await expectOk(assignedChecklistResponse, 'read automatically assigned document checklist');
    const assignedChecklist = await assignedChecklistResponse.json();
    expect(assignedChecklist.checklistTemplateId).toBe(checklistTemplate.id);

    const providersResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/communication/providers`
    );
    await expectOk(providersResponse, 'read communication providers');
    const providers = await providersResponse.json();
    const originalSmsProvider = providers?.items?.find(
      (item: { channel?: number }) => item.channel === 1
    );
    await expectOk(
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/${academicYearId}/communication/providers/1`,
        {
          method: 'PUT',
          body: {
            isEnabled: true,
            providerName: 'Playwright OTP webhook',
            senderId: 'e2e',
            settings: {
              adapter: 'webhook',
              payloadMode: 'default',
              headers: {},
              parameters: {},
              callbackMappings: {},
            },
            webhookUrl: otpWebhookUrl,
          },
        }
      ),
      'configure local OTP webhook'
    );

    const parentPage = await page.context().newPage();
    try {
      capturedOtp = '';
      await parentPage.goto(registration.applicantStatusPath, { waitUntil: 'domcontentloaded' });
      await parentPage.getByRole('button', { name: 'Send OTP' }).click();
      await expect.poll(() => capturedOtp, { timeout: 30_000 }).toMatch(/^\d{6}$/);
      await parentPage.getByLabel('OTP code').fill(capturedOtp);
      const verifyResponsePromise = parentPage.waitForResponse(
        (response) =>
          response.url().includes('/status/') &&
          response.url().endsWith('/verify') &&
          response.request().method() === 'POST'
      );
      await parentPage.getByRole('button', { name: 'Verify' }).click();
      const verifiedStatusResponse = await verifyResponsePromise;
      expect(verifiedStatusResponse.ok()).toBe(true);
      const verifiedStatus = await verifiedStatusResponse.json();
      const accessSessionToken = verifiedStatus.accessSessionToken as string;
      expect(accessSessionToken).toBeTruthy();

      await expect(parentPage.getByText('Registration Form')).toBeVisible();
      await parentPage.setViewportSize({ width: 390, height: 844 });
      const parentAccessibility = await new AxeBuilder({ page: parentPage })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(
        parentAccessibility.violations.filter((violation) =>
          ['serious', 'critical'].includes(violation.impact || '')
        ),
        'public status accessibility'
      ).toEqual([]);
      const parentWidths = await parentPage.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(Math.max(parentWidths.document, parentWidths.body)).toBeLessThanOrEqual(
        parentWidths.viewport + 1
      );
      await parentPage.getByLabel('Parent occupation').fill('Engineer');
      await parentPage.getByRole('button', { name: 'Save Progress' }).click();
      await expect(parentPage.getByText('Progress saved.')).toBeVisible({ timeout: 15_000 });
      await parentPage.getByLabel('Declaration accepted').check();
      await parentPage.getByRole('button', { name: 'Submit Registration' }).click();
      await expect(
        parentPage.getByText('Registration has been submitted and is under review.')
      ).toBeVisible({ timeout: 20_000 });

      const fileInput = parentPage.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: 'birth.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('first unreadable version'),
      });
      await parentPage.getByRole('button', { name: 'Upload' }).click();
      await expect(parentPage.getByText('Uploaded', { exact: true })).toBeVisible({
        timeout: 20_000,
      });

      const leadCard = await openLeadCardInWorkspace(page, lead.firstName, academicYearId);
      await leadCard.getByRole('button', { name: 'Manage' }).click();
      const operationsDialog = page.getByRole('dialog', { name: 'Applicant Workspace' });
      await operationsDialog.getByRole('tab', { name: 'Registration' }).click();
      await expect(operationsDialog).toContainText(registration.formNumber);
      await operationsDialog.getByRole('button', { name: 'Verify Registration' }).click();
      await expect(operationsDialog.getByText('Verified', { exact: true })).toBeVisible({
        timeout: 20_000,
      });
      const documentReason = operationsDialog.getByLabel('Decision or waiver reason');
      await documentReason.fill('The first scan is unreadable.');
      await operationsDialog.getByRole('button', { name: 'Reject' }).click();
      await expect(operationsDialog.getByText('Rejected', { exact: true })).toBeVisible({
        timeout: 20_000,
      });

      const replacementResponse = await parentPage.request.post(
        `${apiBaseUrl()}/api/public/student-enrollment/admissions-crm/${tenantId}/status/${registration.applicantStatusPath.split('/').pop()}/registration/documents`,
        {
          multipart: {
            AccessSessionToken: accessSessionToken,
            RequirementKey: 'birth-certificate',
            File: {
              name: 'birth.pdf',
              mimeType: 'application/pdf',
              buffer: Buffer.from('clear replacement version'),
            },
          },
        }
      );
      await expectOk(replacementResponse, 'upload replacement document');

      await operationsDialog
        .getByRole('button', { name: 'Close applicant workspace' })
        .click({ force: true });
      await page.reload({ waitUntil: 'domcontentloaded' });
      const refreshedLeadCard = await openLeadCardInWorkspace(page, lead.firstName, academicYearId);
      await refreshedLeadCard.getByRole('button', { name: 'Manage' }).click();
      const refreshedDialog = page.getByRole('dialog', { name: 'Applicant Workspace' });
      await refreshedDialog.getByRole('tab', { name: 'Registration' }).click();
      await refreshedDialog.getByRole('button', { name: 'Verify', exact: true }).click();
      await expect(refreshedDialog.getByRole('button', { name: 'Original Seen' })).toBeVisible({
        timeout: 20_000,
      });
      await refreshedDialog.getByRole('button', { name: 'Original Seen' }).click();
      await refreshedDialog.getByRole('button', { name: 'Confirm Readiness' }).click();
      await expect(refreshedDialog.getByText('Readiness confirmed')).toBeVisible({
        timeout: 20_000,
      });

      const handoffResponse = await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/registrations/${registration.id}/admission-handoff`
      );
      await expectOk(handoffResponse, 'read admission handoff package');
      const handoff = await handoffResponse.json();
      expect(handoff.registrationStatus).toBe(11);
      expect(handoff.documents?.[0]?.status).toBe(6);
    } finally {
      await parentPage.close();
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/${academicYearId}/communication/providers/1`,
        {
          method: 'PUT',
          body: originalSmsProvider
            ? {
                isEnabled: originalSmsProvider.isEnabled,
                providerName: originalSmsProvider.providerName,
                senderId: originalSmsProvider.senderId,
                settings: originalSmsProvider.settings,
                webhookUrl: originalSmsProvider.webhookUrl,
                lastValidatedAt: originalSmsProvider.lastValidatedAt,
              }
            : { isEnabled: false },
        }
      );
    }
  });
});
