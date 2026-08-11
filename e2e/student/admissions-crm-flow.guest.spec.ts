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
const studentCrmMutationEnabled = process.env.E2E_STUDENT_CRM_ALLOW_MUTATION === '1';
const tenantCode = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || 'Temp@123';
const principalEmail = () => process.env.E2E_PRINCIPAL_EMAIL || 'principal-gseb@ddvs.com';
const enrollmentOperatorEmail = () =>
  process.env.E2E_STUDENT_CRM_OPERATOR_EMAIL || 'admin-ddvs@ddvs.com';
const restrictedCrmEmail = () => process.env.E2E_STUDENT_CRM_DENIED_EMAIL;
const restrictedCrmPassword = () => process.env.E2E_STUDENT_CRM_DENIED_PASSWORD || password();
const receptionistEmail = () =>
  process.env.E2E_STUDENT_CRM_RECEPTIONIST_EMAIL || 'admissions-reception@ddvs.com';
const counselorEmail = () =>
  process.env.E2E_STUDENT_CRM_COUNSELOR_EMAIL || 'admissions-counselor@ddvs.com';
const approverEmail = () =>
  process.env.E2E_STUDENT_CRM_APPROVER_EMAIL || 'admissions-approver@ddvs.com';
const secondTenantCode = () => process.env.E2E_STUDENT_CRM_SECOND_TENANT;
const secondTenantAdminEmail = () => process.env.E2E_STUDENT_CRM_SECOND_TENANT_ADMIN_EMAIL;
const secondTenantPassword = () => process.env.E2E_STUDENT_CRM_SECOND_TENANT_PASSWORD || password();
const principalScopeBoard = () =>
  process.env.E2E_PRINCIPAL_SCOPE_BOARD ||
  (principalEmail().toLowerCase().includes('gseb') ? 'GSEB' : undefined);
const principalDeniedScopeBoard = () => process.env.E2E_PRINCIPAL_DENIED_SCOPE_BOARD || 'CBSE';
const enrollmentWorkspaceRoutes = [
  '/student/enrollment/pipeline',
  '/student/enrollment/entrance-exams',
  '/student/enrollment/registration',
  '/student/enrollment/activation',
  '/student/enrollment/activation',
  '/student/enrollment/my-work',
  '/student/enrollment/reports',
] as const;
const enrollmentSettingsRoutes = [
  '/student/enrollment/settings/journey',
  '/student/enrollment/settings/inquiry-capture',
  '/student/enrollment/settings/routing-scoring',
  '/student/enrollment/settings/entrance-exam',
  '/student/enrollment/settings/registration',
  '/student/enrollment/settings/activation',
  '/student/enrollment/settings/activation',
  '/student/enrollment/settings/governance',
  '/student/enrollment/settings/communication',
  '/student/enrollment/settings/automation',
] as const;
let otpWebhookServer: Server | undefined;
let otpWebhookUrl = '';
let capturedOtp = '';

const canCaptureOtpForConfiguredApi = () => {
  if (process.env.E2E_OTP_WEBHOOK_URL?.trim()) return true;
  try {
    const hostname = new URL(apiBaseUrl()).hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
};
let e2eInquirySourceId = '';
let e2eInquiryTypeId = '';
let e2eTargetStandardId = '';
let e2eTargetStandard: {
  boardName: string;
  mediumName: string;
  standardName: string;
} | null = null;

type JsonRequestInit = Omit<NonNullable<Parameters<Page['request']['fetch']>[1]>, 'data'> & {
  body?: unknown;
};

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }

  return url.replace(/\/$/, '');
};

async function waitForBackend(page: Page, tenantValue = tenantCode()) {
  const healthUrl = `${apiBaseUrl()}/api/abp/application-configuration`;
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < 60_000) {
    try {
      const response = await page.request.get(healthUrl, {
        headers: { __tenant: tenantValue },
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

async function login(
  page: Page,
  email = enrollmentOperatorEmail(),
  passwordValue = password(),
  tenantValue = tenantCode()
) {
  await page.addInitScript(() => {
    localStorage.setItem('onboarding_completed', 'true');
  });
  await waitForBackend(page, tenantValue);
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.getByLabel('School Code')).toBeVisible({ timeout: 60_000 });
  await page.getByLabel('School Code').fill(tenantValue);
  await page.getByLabel('Email / Username').fill(email);
  await page.getByLabel('Password').fill(passwordValue);

  const signInButton = page.getByRole('button', { name: /Sign In/i });
  await expect(signInButton).toBeEnabled({ timeout: 30_000 });
  await signInButton.click();

  await expect.poll(() => hasAccessToken(page), { timeout: 60_000 }).toBe(true);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 30_000 });
}

const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

async function ensureAdmissionYearPublished(page: Page, academicYearId: string) {
  const versionsResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/setup/admission-years/${academicYearId}/versions`
  );
  await expectOk(versionsResponse, 'list admission year setup versions');
  const versions = (await versionsResponse.json()) as Array<Record<string, unknown>>;
  const published = versions.find((version) => Number(version.status) === 1);
  if (published) {
    e2eTargetStandardId = ((published.targetStandardIds as string[] | undefined) || [])[0] || '';
    expect(
      e2eTargetStandardId,
      'Published admission year requires a target standard.'
    ).toBeTruthy();
    return;
  }

  let draft = versions.find((version) => Number(version.status) === 0);
  if (!draft) {
    const draftResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/setup/admission-years/${academicYearId}/draft`,
      { method: 'POST' }
    );
    await expectOk(draftResponse, 'create admission year setup draft');
    draft = (await draftResponse.json()) as Record<string, unknown>;
  }

  let targetStandardIds = (draft.targetStandardIds as string[] | undefined) || [];
  if (targetStandardIds.length === 0) {
    const standardsResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/setup/admission-years/${academicYearId}/standard-options`
    );
    await expectOk(standardsResponse, 'list admission year standard options');
    const standards = (await standardsResponse.json()) as Array<{ standardId: string }>;
    targetStandardIds = standards.slice(0, 3).map((standard) => standard.standardId);
  }
  expect(
    targetStandardIds,
    'Admission year requires at least one target standard.'
  ).not.toHaveLength(0);

  const today = new Date();
  const addDays = (days: number) => {
    const value = new Date(today);
    value.setUTCDate(value.getUTCDate() + days);
    return toIsoDate(value);
  };
  const updateResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/setup/admission-years/drafts/${draft.id}`,
    {
      method: 'PUT',
      body: {
        concurrencyStamp: draft.concurrencyStamp,
        inquiryOpenDate: addDays(-1),
        inquiryCloseDate: addDays(90),
        registrationCloseDate: addDays(120),
        activationTargetDate: addDays(150),
        entranceExamRequired: Boolean(draft.entranceExamRequired),
        financeVerificationRequired: Boolean(draft.financeVerificationRequired),
        placementTiming: Number(draft.placementTiming || 0),
        defaultOwnerUserId: draft.defaultOwnerUserId || null,
        targetStandardIds,
        routeTypes:
          Array.isArray(draft.routeTypes) && draft.routeTypes.length > 0 ? draft.routeTypes : [0],
        stepOwners: draft.stepOwners || {},
      },
    }
  );
  await expectOk(updateResponse, 'update admission year setup draft for E2E');
  const updatedDraft = (await updateResponse.json()) as Record<string, unknown>;

  const publishResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/setup/admission-years/${updatedDraft.id}/publish`,
    {
      method: 'POST',
      body: { concurrencyStamp: updatedDraft.concurrencyStamp },
    }
  );
  await expectOk(publishResponse, 'publish admission year setup for E2E');
  const publishedSetup = (await publishResponse.json()) as Record<string, unknown>;
  e2eTargetStandardId =
    ((publishedSetup.targetStandardIds as string[] | undefined) || [])[0] || targetStandardIds[0];
  expect(e2eTargetStandardId, 'Published admission year requires a target standard.').toBeTruthy();
}

async function ensureEnrollmentCatalogDefaults(page: Page, academicYearId: string) {
  const sourceListResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-sources?includeInactive=true`
  );
  await expectOk(sourceListResponse, 'list inquiry sources for E2E');
  const sourceList = await sourceListResponse.json();
  let source = sourceList?.items?.find((item: { code?: string }) => item.code === 'E2E-WEB');
  if (!source) {
    const createSourceResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-sources`,
      {
        method: 'POST',
        body: {
          code: 'E2E-WEB',
          displayName: 'E2E Web Inquiry',
          description: 'Stable source used by the student enrollment Playwright suite.',
          allowedChannels: [1],
          displayOrder: 900,
          isRoutingEligible: true,
        },
      }
    );
    await expectOk(createSourceResponse, 'create inquiry source for E2E');
    source = await createSourceResponse.json();
  } else if (!source.isActive) {
    const activateSourceResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/catalog/inquiry-sources/${source.id}/status`,
      { method: 'PATCH', body: { isActive: true, reason: 'Required by enrollment E2E.' } }
    );
    await expectOk(activateSourceResponse, 'activate inquiry source for E2E');
    source = await activateSourceResponse.json();
  }

  if (!source.allowedChannels?.includes(3)) {
    const updateSourceResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/catalog/inquiry-sources/${source.id}`,
      {
        method: 'PUT',
        body: {
          code: source.code,
          displayName: source.displayName,
          description: source.description || null,
          allowedChannels: [...new Set([...(source.allowedChannels || []), 3])],
          displayOrder: source.displayOrder,
          isRoutingEligible: source.isRoutingEligible,
        },
      }
    );
    await expectOk(updateSourceResponse, 'enable the E2E inquiry source for public forms');
    source = await updateSourceResponse.json();
  }

  const typeListResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-types?includeInactive=true`
  );
  await expectOk(typeListResponse, 'list inquiry types for E2E');
  const typeList = await typeListResponse.json();
  let inquiryType = typeList?.items?.find(
    (item: { code?: string }) => item.code === 'E2E-ADMISSION'
  );
  if (!inquiryType) {
    const createTypeResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-types`,
      {
        method: 'POST',
        body: {
          code: 'E2E-ADMISSION',
          displayName: 'E2E Admission Inquiry',
          description: 'Stable inquiry type used by the student enrollment Playwright suite.',
          displayOrder: 900,
        },
      }
    );
    await expectOk(createTypeResponse, 'create inquiry type for E2E');
    inquiryType = await createTypeResponse.json();
  } else if (!inquiryType.isActive) {
    const activateTypeResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/catalog/inquiry-types/${inquiryType.id}/status`,
      { method: 'PATCH', body: { isActive: true, reason: 'Required by enrollment E2E.' } }
    );
    await expectOk(activateTypeResponse, 'activate inquiry type for E2E');
    inquiryType = await activateTypeResponse.json();
  }

  e2eInquirySourceId = source.id;
  e2eInquiryTypeId = inquiryType.id;
  expect(e2eInquirySourceId, 'E2E inquiry source id is required.').toBeTruthy();
  expect(e2eInquiryTypeId, 'E2E inquiry type id is required.').toBeTruthy();
}

async function resolveEnrollmentTargetStandard(page: Page, academicYearId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/operational-standard-options`
  );
  await expectOk(response, 'resolve the published admission target standard for E2E');
  const options = (await response.json()) as Array<{
    boardName?: string;
    mediumName?: string;
    standardId?: string;
    standardName?: string;
  }>;
  const option = options.find((item) => item.standardId === e2eTargetStandardId);
  expect(
    option,
    'The published target standard must be available to enrollment operations.'
  ).toBeTruthy();
  expect(option?.boardName).toBeTruthy();
  expect(option?.mediumName).toBeTruthy();
  expect(option?.standardName).toBeTruthy();
  e2eTargetStandard = {
    boardName: String(option?.boardName),
    mediumName: String(option?.mediumName),
    standardName: String(option?.standardName),
  };
}

async function crmApiRequest(page: Page, path: string, init: JsonRequestInit = {}) {
  const token = await getAccessToken(page);
  const { body, signal, ...requestInit } = init;

  try {
    return await page.request.fetch(`${apiBaseUrl()}/api${path}`, {
      ...requestInit,
      timeout: requestInit.timeout ?? 60_000,
      ...(body === undefined ? {} : { data: body }),
      headers: {
        accept: 'application/json',
        __tenant: tenantCode(),
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch (error) {
    const summary =
      error instanceof Error ? error.message.split('Call log:')[0].trim() : String(error);
    throw new Error(
      `CRM API ${String(requestInit.method || 'GET').toUpperCase()} ${path} failed: ${summary}`
    );
  }
}

async function publicApiRequest(page: Page, path: string, init: JsonRequestInit = {}) {
  const { body, signal, ...requestInit } = init;

  try {
    return await page.request.fetch(`${apiBaseUrl()}/api${path}`, {
      ...requestInit,
      timeout: requestInit.timeout ?? 60_000,
      ...(body === undefined ? {} : { data: body }),
      headers: {
        accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch (error) {
    const summary =
      error instanceof Error ? error.message.split('Call log:')[0].trim() : String(error);
    throw new Error(
      `Public CRM API ${String(requestInit.method || 'GET').toUpperCase()} ${path} failed: ${summary}`
    );
  }
}

async function browserSessionApiGet(page: Page, path: string, requestTenant = tenantCode()) {
  const requestUrl = path.startsWith('http') ? path : `${apiBaseUrl()}/api${path}`;
  return page.evaluate(
    async ({ url, tenant }) => {
      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();
      if (!session?.accessToken) throw new Error('Authenticated session token is unavailable.');

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 60_000);
      try {
        const response = await fetch(url, {
          headers: {
            accept: 'application/json',
            __tenant: tenant,
            Authorization: `Bearer ${session.accessToken}`,
          },
          signal: controller.signal,
        });
        return { status: response.status, body: await response.text() };
      } finally {
        window.clearTimeout(timeout);
      }
    },
    { url: requestUrl, tenant: requestTenant }
  );
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

const pdfFixture = (body: string) =>
  Buffer.from(`%PDF-1.4\n% Student Enrollment E2E\n1 0 obj <<>> endobj\n${body}\n%%EOF`);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function createCrmLead(page: Page, academicYearId: string, phone: string, suffix: string) {
  expect(
    e2eTargetStandard,
    'The E2E target standard must be resolved before lead creation.'
  ).toBeTruthy();
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/leads`,
    {
      method: 'POST',
      body: {
        inquirySourceId: e2eInquirySourceId,
        inquiryTypeId: e2eInquiryTypeId,
        targetStandardId: e2eTargetStandardId,
        channel: 1,
        firstName: uniqueToken(`Crm${suffix}`),
        parentGuardianName: 'Playwright Parent',
        primaryContactNo: phone,
        admissionIntent: `Admission inquiry for ${e2eTargetStandard?.standardName}`,
        desiredClassName: e2eTargetStandard?.standardName,
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
  const proposedConfiguration: Record<string, unknown> & {
    registrationFormRequiredBeforeExam: boolean;
    impactPreviewFingerprint?: unknown;
  } = {
    ...currentConfiguration,
    registrationFormRequiredBeforeExam,
  };
  delete proposedConfiguration.impactPreviewFingerprint;

  const impactPreviewResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration-safety/impact-preview`,
    {
      method: 'POST',
      body: { proposedCycleConfiguration: proposedConfiguration },
    }
  );
  await expectOk(impactPreviewResponse, 'preview CRM cycle registration gate impact');
  const impactPreview = await impactPreviewResponse.json();
  expect(
    impactPreview?.fingerprint,
    'Cycle registration gate impact preview should return a fingerprint.'
  ).toBeTruthy();

  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`,
    {
      method: 'PUT',
      body: {
        ...proposedConfiguration,
        impactPreviewFingerprint: impactPreview.fingerprint,
      },
    }
  );
  await expectOk(response, 'update CRM cycle registration gate');
  return response.json();
}

async function ensurePublicInquiryChannelDefault(page: Page, academicYearId: string) {
  const currentConfiguration = (await getCrmCycleConfiguration(page, academicYearId)) as Record<
    string,
    unknown
  > & {
    channelSettings?: Array<Record<string, unknown> & { channel?: number }>;
  };
  const channelSettings = currentConfiguration.channelSettings || [];
  const publicChannel = channelSettings.find((setting) => setting.channel === 3);
  if (
    publicChannel?.isEnabled === true &&
    publicChannel.defaultInquirySourceId === e2eInquirySourceId
  ) {
    return;
  }

  const nextPublicChannel = {
    channel: 3,
    isEnabled: true,
    defaultInquirySourceId: e2eInquirySourceId,
    defaultFormTemplateId: publicChannel?.defaultFormTemplateId || null,
    defaultOwnerUserId: publicChannel?.defaultOwnerUserId || null,
    defaultAcknowledgementTemplateId: publicChannel?.defaultAcknowledgementTemplateId || null,
    displayOrder: publicChannel?.displayOrder || 30,
  };
  const proposedConfiguration: Record<string, unknown> & {
    impactPreviewFingerprint?: unknown;
  } = {
    ...currentConfiguration,
    channelSettings: publicChannel
      ? channelSettings.map((setting) =>
          setting.channel === 3 ? { ...setting, ...nextPublicChannel } : setting
        )
      : [...channelSettings, nextPublicChannel],
  };
  delete proposedConfiguration.impactPreviewFingerprint;

  const previewResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration-safety/impact-preview`,
    {
      method: 'POST',
      body: { proposedCycleConfiguration: proposedConfiguration },
    }
  );
  await expectOk(previewResponse, 'preview public inquiry channel configuration impact');
  const preview = await previewResponse.json();
  expect(
    preview?.fingerprint,
    'Public channel update requires an impact fingerprint.'
  ).toBeTruthy();

  await expectOk(
    await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`,
      {
        method: 'PUT',
        body: {
          ...proposedConfiguration,
          impactPreviewFingerprint: preview.fingerprint,
        },
      }
    ),
    'configure the public inquiry channel default source'
  );
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

async function getRegistrationOwnerUserId(page: Page, academicYearId: string) {
  const response = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/workspace/staff?academicYearId=${encodeURIComponent(
      academicYearId
    )}&ownerOnly=true&maxResultCount=20`
  );
  await expectOk(response, 'list eligible registration owners');
  const staff = await response.json();
  const owner = staff?.find((item: { id?: string; isOwnerEligible?: boolean }) =>
    Boolean(item.id && item.isOwnerEligible)
  );
  expect(owner, 'At least one configured owner is required to prepare registration.').toBeTruthy();
  return owner.id as string;
}

async function prepareLeadForRegistration(page: Page, academicYearId: string, leadId: string) {
  const ownerUserId = await getRegistrationOwnerUserId(page, academicYearId);
  const ownerResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/leads/${leadId}/owner`,
    {
      method: 'POST',
      body: { ownerUserId },
    }
  );
  await expectOk(ownerResponse, 'assign registration lead owner');
  const ownedLead = await ownerResponse.json();
  expect(ownedLead?.ownerUserId).toBe(ownerUserId);

  const followUpTitle = uniqueToken('Registration follow-up ');
  const taskResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/leads/${leadId}/tasks`,
    {
      method: 'POST',
      body: {
        title: followUpTitle,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
        assignedUserId: ownerUserId,
        notes: 'Confirm registration readiness with the parent or guardian.',
      },
    }
  );
  await expectOk(taskResponse, 'schedule registration follow-up');
  const followUpTask = await taskResponse.json();
  expect(followUpTask?.leadId).toBe(leadId);
  expect(followUpTask?.assignedUserId).toBe(ownerUserId);
  expect(followUpTask?.title).toBe(followUpTitle);

  const stageResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/leads/${leadId}/stage`,
    {
      method: 'POST',
      body: {
        stage: 1,
        reason: 'Initial follow-up completed before registration.',
        overrideWorkflowGuards: false,
      },
    }
  );
  await expectOk(stageResponse, 'move registration lead to follow-up');
  const preparedLead = await stageResponse.json();
  expect(preparedLead?.stage).toBe(1);
  expect(preparedLead?.ownerUserId).toBe(ownerUserId);
}

async function prepareEligibleExamResultForRegistration(
  page: Page,
  academicYearId: string,
  leadId: string
) {
  const slot = await getAvailableEntranceExamSlot(page, academicYearId);
  const scheduleResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/leads/${leadId}/exam/schedule`,
    {
      method: 'POST',
      body: { entranceExamSlotId: slot.id },
    }
  );
  await expectOk(scheduleResponse, 'schedule required registration entrance exam');
  const scheduled = await scheduleResponse.json();

  await expectOk(
    await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/exams/${scheduled.id}/attendance`,
      {
        method: 'POST',
        body: { attendanceStatus: 1 },
      }
    ),
    'mark required registration entrance exam present'
  );

  const resultResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/exams/${scheduled.id}/result`,
    {
      method: 'POST',
      body: {
        totalMarks: 100,
        passingMarks: 40,
        obtainedMarks: 85,
        meritRank: 1,
      },
    }
  );
  await expectOk(resultResponse, 'record eligible registration entrance exam result');
  const result = await resultResponse.json();
  expect(result?.eligibilityDecision).toBe(1);
  expect(result?.percentage).toBe(85);

  const handoffResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/exams/${scheduled.id}/eligibility-handoff`
  );
  await expectOk(handoffResponse, 'verify eligible registration entrance exam handoff');
  const handoff = await handoffResponse.json();
  expect(handoff?.leadId).toBe(leadId);
  expect(handoff?.canStartAdmission).toBe(true);
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
  await page.goto('about:blank');
  const initialExamsResponse = page.waitForResponse(
    (candidate) => {
      if (candidate.request().method() !== 'GET') return false;
      const url = new URL(candidate.url());
      return url.pathname.endsWith(`/student-enrollment/admissions-crm/${academicYearId}/exams`);
    },
    { timeout: 60_000 }
  );
  const response = await page.goto(workspaceUrl('/student/enrollment/entrance-exams', academicYearId), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  expect(response?.status(), 'GET /student/enrollment/entrance-exams').toBeLessThan(400);
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Assessments' })).toBeVisible({
    timeout: 30_000,
  });
  const initialResponse = await initialExamsResponse;
  await expectOk(initialResponse, 'load CRM entrance exams');

  const search = page.getByRole('textbox', { name: 'Search assessments' });
  await expect(search).toBeEditable();
  const initialFilter = new URL(initialResponse.url()).searchParams.get('filterText');
  if (initialFilter === applicantName) {
    await expect(search).toHaveValue(applicantName);
  } else {
    const filteredExamsResponse = page.waitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'GET') return false;
        const url = new URL(candidate.url());
        return (
          url.pathname.endsWith(`/student-enrollment/admissions-crm/${academicYearId}/exams`) &&
          url.searchParams.get('filterText') === applicantName
        );
      },
      { timeout: 60_000 }
    );
    await search.fill(applicantName);
    await expect(search).toHaveValue(applicantName);
    await expectOk(await filteredExamsResponse, 'filter CRM entrance exams');
  }
  await expect(page.getByText(/1[–-]1 of 1/)).toBeVisible({ timeout: 15_000 });

  const examRow = page
    .locator('[data-testid="student-enrollment-exam-row"]')
    .filter({ hasText: applicantName })
    .filter({ hasText: slotName });
  await expect(examRow).toBeVisible({ timeout: 30_000 });
  return examRow;
}

async function openLeadCardInWorkspace(
  page: Page,
  leadName: string,
  academicYearId: string,
  stageGroup: 'active' | 'decision' | 'closed' = 'active'
): Promise<Locator> {
  const response = await page.goto(
    workspaceUrl(`/student/enrollment/pipeline?view=board&group=${stageGroup}`, academicYearId),
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
  const existingResponse = await crmApiRequest(
    page,
    `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-templates?filterText=${encodeURIComponent(
      'Playwright public inquiry'
    )}&isActive=true&maxResultCount=100`
  );
  await expectOk(existingResponse, 'list prior public CRM E2E templates');
  const existing = await existingResponse.json();
  await Promise.all(
    (existing?.items || [])
      .filter((template: { templateName?: string }) =>
        String(template.templateName || '').startsWith('Playwright public inquiry')
      )
      .map(async (template: { id: string }) =>
        expectOk(
          await crmApiRequest(
            page,
            `/student-enrollment/admissions-crm/configuration/form-templates/${template.id}/status`,
            { method: 'PATCH', body: { isActive: false } }
          ),
          'deactivate a prior public CRM E2E template'
        )
      )
  );

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
            key: 'parentName',
            label: 'Parent or guardian name',
            fieldType: 0,
            systemField: 'ParentGuardianName',
            required: true,
            displayOrder: 25,
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
            key: 'targetStandardId',
            label: 'Target class',
            fieldType: 6,
            systemField: 'TargetStandardId',
            required: true,
            displayOrder: 50,
            options: [e2eTargetStandardId],
            optionLabels: [String(e2eTargetStandard?.standardName)],
          },
          {
            key: 'desiredClass',
            label: 'Desired class',
            fieldType: 0,
            systemField: 'DesiredClassName',
            required: true,
            displayOrder: 60,
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

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300_000);
    const server = createServer((request, response) => {
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
    otpWebhookServer = server;
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address() as AddressInfo;
    otpWebhookUrl =
      process.env.E2E_OTP_WEBHOOK_URL?.trim() || `http://127.0.0.1:${address.port}/admissions-otp`;

    if (studentCrmMutationEnabled) {
      const context = await browser.newContext({ baseURL: process.env.E2E_BASE_URL });
      const page = await context.newPage();
      try {
        await login(page);
        const academicYearId = await resolveAcademicYearId(page);
        await ensureAdmissionYearPublished(page, academicYearId);
        await resolveEnrollmentTargetStandard(page, academicYearId);
        await ensureEnrollmentCatalogDefaults(page, academicYearId);
        await ensurePublicInquiryChannelDefault(page, academicYearId);
      } finally {
        await context.close();
      }
    }
  });

  test.afterAll(async () => {
    if (!otpWebhookServer) return;
    const server = otpWebhookServer;
    await new Promise<void>((resolve) => server.close(() => resolve()));
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

  test('a conflicting tenant header cannot change the authenticated tenant context', async ({
    page,
  }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const requestPath = `/student-enrollment/admissions-crm/${academicYearId}/leads?maxResultCount=1`;
    const baseline = await browserSessionApiGet(page, requestPath);
    expect(baseline.status, `Baseline tenant request failed: ${baseline.body}`).toBe(200);
    const forged = await browserSessionApiGet(page, requestPath, 'SSVM');

    if ([400, 401, 403, 404].includes(forged.status)) return;

    expect(
      forged.status,
      `Forged tenant header unexpectedly changed the authenticated context: ${forged.body}`
    ).toBe(200);
    expect(JSON.parse(forged.body)).toEqual(JSON.parse(baseline.body));
  });

  test('a second-tenant token cannot read a real DDVS enrollment lead', async ({ page }) => {
    test.skip(
      !secondTenantCode() || !secondTenantAdminEmail(),
      'Set E2E_STUDENT_CRM_SECOND_TENANT and E2E_STUDENT_CRM_SECOND_TENANT_ADMIN_EMAIL for a true two-tenant isolation check.'
    );

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const leadListResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/leads?maxResultCount=1`
    );
    await expectOk(leadListResponse, 'GET DDVS lead for tenant isolation test');
    const leadList = await leadListResponse.json();
    const ddvsLeadId = leadList?.items?.[0]?.id as string | undefined;
    expect(ddvsLeadId, 'A DDVS lead is required for tenant isolation coverage.').toBeTruthy();

    await page.context().clearCookies();
    await login(page, secondTenantAdminEmail()!, secondTenantPassword(), secondTenantCode()!);
    const crossTenantResult = await browserSessionApiGet(
      page,
      `/student-enrollment/admissions-crm/leads/${ddvsLeadId!}`,
      'DDVS'
    );

    expect(
      [400, 401, 403, 404],
      `Second-tenant token exposed a DDVS lead: ${crossTenantResult.status} ${crossTenantResult.body}`
    ).toContain(crossTenantResult.status);
    expect(crossTenantResult.body).not.toContain(ddvsLeadId!);
  });

  test('a board-scoped principal cannot read another board enrollment data', async ({ page }) => {
    const expectedBoardName = principalScopeBoard();
    test.skip(!expectedBoardName, 'Set E2E_PRINCIPAL_SCOPE_BOARD for UserScope coverage.');

    await login(page, principalEmail());
    const academicYearId = await resolveAcademicYearId(page);
    const sessionProfile = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      return session?.profile;
    });
    const userId = sessionProfile?.sub as string | undefined;
    expect(userId, 'Authenticated principal user id is required.').toBeTruthy();

    const scopeResult = await browserSessionApiGet(
      page,
      `/app/user-scope/user-scope-hierarchy?userId=${userId}&academicYearId=${academicYearId}`
    );
    expect(scopeResult.status, `UserScope hierarchy failed: ${scopeResult.body}`).toBe(200);
    const scope = JSON.parse(scopeResult.body);
    const yearScope = scope?.accessibleHierarchy?.find(
      (year: { academicYearId?: string }) => year.academicYearId === academicYearId
    );
    expect(yearScope, 'Current academic year must be present in the principal scope.').toBeTruthy();
    expect(yearScope.hasFullBoardAccess, 'Principal unexpectedly has full board access.').toBe(
      false
    );

    const boards = (yearScope.boards || []) as Array<{
      boardName: string;
      hasAccess: boolean;
      mediums?: Array<{ mediumId: string; hasAccess: boolean }>;
    }>;
    const expectedBoard = boards.find((board) =>
      board.boardName.toLowerCase().includes(expectedBoardName!.toLowerCase())
    );
    const deniedBoard = boards.find((board) =>
      board.boardName.toLowerCase().includes(principalDeniedScopeBoard().toLowerCase())
    );
    expect(expectedBoard, `Expected ${expectedBoardName} board was not returned.`).toBeTruthy();
    expect(expectedBoard?.hasAccess, `${expectedBoardName} should be accessible.`).toBe(true);
    expect(
      deniedBoard,
      `Denied ${principalDeniedScopeBoard()} board was not returned.`
    ).toBeTruthy();
    expect(deniedBoard?.hasAccess, `${principalDeniedScopeBoard()} should not be accessible.`).toBe(
      false
    );

    const deniedMediumId = deniedBoard?.mediums?.[0]?.mediumId;
    expect(
      deniedMediumId,
      'A denied-board medium is required for the API scope check.'
    ).toBeTruthy();
    const leadsResult = await browserSessionApiGet(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/leads?academicMediumId=${deniedMediumId}&maxResultCount=1`
    );
    expect(
      [400, 401, 403, 404],
      `Board-scoped principal read denied enrollment data: ${leadsResult.status} ${leadsResult.body}`
    ).toContain(leadsResult.status);
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
    await expect(page.getByRole('button', { name: /Add Inquiry/i })).not.toBeVisible({
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
        waitUntil: 'domcontentloaded',
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

  test('Enrollment skip navigation moves keyboard focus into the workspace', async ({ page }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    await page.goto(workspaceUrl('/student/enrollment/pipeline', academicYearId), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });

    const skipLink = page.getByRole('link', { name: 'Skip to Enrollment workspace' });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await skipLink.press('Enter');
    await expect(page.locator('#student-enrollment-content')).toBeFocused();

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await skipLink.evaluate((element) => (element as HTMLAnchorElement).click());
    await expect(page.locator('#student-enrollment-content')).toBeFocused();
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
          waitUntil: 'domcontentloaded',
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
        const pipelineColumnValue = url.searchParams.get('pipelineColumn');
        const pipelineColumn =
          pipelineColumnValue == null ? undefined : Number(pipelineColumnValue);
        leadRequests.push(url);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            buildAdmissionCrmScaleLeadPage({
              academicYearId,
              skipCount,
              maxResultCount,
              pipelineColumn,
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
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByText(new RegExp(`of ${admissionCrmScaleTotal}`, 'i'))).toBeVisible();
    await expect(page.getByTestId('student-enrollment-pipeline-row')).toHaveCount(50);

    await page.getByRole('button', { name: 'Board view' }).click();
    await expect
      .poll(() => leadRequests.some((url) => url.searchParams.has('pipelineColumn')))
      .toBe(true);
    await expect
      .poll(
        () =>
          new Set(
            leadRequests
              .filter((url) => url.searchParams.has('pipelineColumn'))
              .map((url) => url.searchParams.get('pipelineColumn'))
          ).size
      )
      .toBeGreaterThan(1);

    leadRequests.forEach((url) => {
      const maximum = Number(url.searchParams.get('maxResultCount'));
      expect(maximum).toBeLessThanOrEqual(url.searchParams.has('pipelineColumn') ? 25 : 50);
    });

    const boardColumns = page.getByTestId('student-enrollment-pipeline-column');
    if ((await boardColumns.count()) > 1) {
      await expect
        .poll(() => page.getByTestId('student-enrollment-pipeline-card').count())
        .toBeGreaterThan(1);

      const loadedBoardColumns = await boardColumns.evaluateAll((columns) =>
        columns
          .map((column) => ({
            pipelineColumn: column.getAttribute('data-pipeline-column'),
            cards: Array.from(
              column.querySelectorAll<HTMLElement>(
                '[data-testid="student-enrollment-pipeline-card"]'
              )
            ).map((card) => ({
              id: card.dataset.leadId,
              pipelineColumn: card.dataset.leadPipelineColumn,
            })),
          }))
          .filter((column) => column.cards.length > 0)
      );
      expect(loadedBoardColumns.length).toBeGreaterThan(1);
      loadedBoardColumns.forEach((column) => {
        expect(
          column.cards.every((card) => card.pipelineColumn === column.pipelineColumn),
          column.pipelineColumn ?? 'unknown pipeline column'
        ).toBe(true);
      });
      const boardLeadIds = loadedBoardColumns.flatMap((column) =>
        column.cards.map((card) => card.id)
      );
      expect(new Set(boardLeadIds).size).toBe(boardLeadIds.length);
    } else {
      await expect(page.getByText('Column 0 Applicant 1 Scale', { exact: true })).toHaveCount(1);
      await expect(page.getByText('Column 1 Applicant 1 Scale', { exact: true })).toHaveCount(1);
      await expect(page.getByText('Column 2 Applicant 1 Scale', { exact: true })).toHaveCount(1);
    }

    expect(leadRequests.length).toBeGreaterThan(1);
    expect(staffRequests.length).toBeGreaterThan(0);
    staffRequests.forEach((url) => {
      expect(Number(url.searchParams.get('maxResultCount'))).toBeLessThanOrEqual(25);
    });
  });

  test('Registration worklist selection updates the canonical URL and dataset', async ({
    page,
  }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const worklistRequests: URL[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (/\/admissions-crm\/[^/]+\/leads$/.test(url.pathname)) worklistRequests.push(url);
    });

    await page.goto(`/student/enrollment/registration?cycle=${academicYearId}&queue=21`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByRole('region', { name: 'Registration Stage filter' })).toContainText(
      'Choose the stage of registration work you want to review.'
    );
    const eligible = page.getByRole('button', { name: 'Eligible', exact: true });
    await expect(eligible).toBeVisible();
    await eligible.click();
    await expect(page).toHaveURL(/(?:\?|&)column=4(?:&|$)/);
    await expect(page).not.toHaveURL(/(?:\?|&)queue=/);
    await expect
      .poll(() => worklistRequests.some((url) => url.searchParams.get('pipelineColumn') === '4'))
      .toBe(true);

    await page.getByRole('button', { name: 'Registration Done', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Registration Done', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/(?:\?|&)column=6(?:&|$)/);
    await expect
      .poll(() => worklistRequests.some((url) => url.searchParams.get('pipelineColumn') === '6'))
      .toBe(true);
  });

  test('workspace URLs preserve operational state without exposing applicant search text', async ({
    page,
  }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    await page.goto(
      `/student/enrollment/pipeline?cycle=${academicYearId}&view=list&column=0&page=2`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await page.getByLabel('Search applicants').fill('Parent phone 9999999999');
    await expect(page).toHaveURL(new RegExp(`cycle=${academicYearId}`));
    await expect(page).not.toHaveURL(/page=2/);
    expect(page.url()).not.toContain('Parent');
    expect(page.url()).not.toContain('9999999999');

    await page.goto(`/student/enrollment/entrance-exams?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/entrance-exams/?\\?cycle=${academicYearId}`)
    );

    await page.goto(`/student/enrollment/pipeline?cycle=${academicYearId}&view=list&column=0`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(/view=list/);
    await expect(page).toHaveURL(/column=0/);
    await expect(page).not.toHaveURL(/page=2/);

    await page.goto(`/student/enrollment/my-work?cycle=${academicYearId}&page=2`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.getByPlaceholder('Search...').fill('Private applicant 8888888888');
    await expect(page).not.toHaveURL(/page=2/);
    expect(decodeURIComponent(page.url())).not.toContain('Private applicant');
    expect(page.url()).not.toContain('8888888888');
    await page.getByRole('button', { name: 'Filter Applicant' }).click();
    const applicantFilterMenu = page.getByRole('menu');
    await applicantFilterMenu.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Contains', exact: true }).click();
    await applicantFilterMenu.getByRole('textbox').fill('Private column filter 6666666666');
    await applicantFilterMenu.getByRole('button', { name: 'Apply', exact: true }).click();
    expect(decodeURIComponent(page.url())).not.toContain('Private column filter');
    expect(page.url()).not.toContain('6666666666');
    await page.goto(`/student/enrollment/pipeline?cycle=${academicYearId}&view=list`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.goto(`/student/enrollment/my-work?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByPlaceholder('Search...')).toHaveValue('Private applicant 8888888888');
    await expect(
      page.getByText('Private column filter 6666666666', { exact: false })
    ).toBeVisible();

    await page.goto(`/student/enrollment/registration?cycle=${academicYearId}&page=2`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page
      .getByPlaceholder(/Search registration applicants/i)
      .fill('Private registration 7777777777');
    await expect(page).not.toHaveURL(/page=2/);
    expect(decodeURIComponent(page.url())).not.toContain('Private registration');
    expect(page.url()).not.toContain('7777777777');

    await page.goto(`/student/enrollment/settings?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/?\\?cycle=${academicYearId}`)
    );

    await page.goto('/student/enrollment/pipeline?column=999&page=-2', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).not.toHaveURL(/column=999/);
    await expect(page).not.toHaveURL(/page=-2/);
  });

  test('Enrollment settings use domain navigation and URL-backed task panels', async ({ page }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    await page.goto(`/student/enrollment/settings?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/?\\?cycle=${academicYearId}`)
    );
    await expect(page.getByRole('heading', { name: 'Enrollment Setup Center' })).toBeVisible();
    const admissionYearLink = page
      .locator('a[href^="/student/enrollment/settings/admission-year"]')
      .first();
    await expect(admissionYearLink).toHaveAttribute('href', new RegExp(`cycle=${academicYearId}`));
    await admissionYearLink.click();
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/admission-year/?\\?cycle=${academicYearId}`)
    );
    await expect(page.getByRole('heading', { name: 'Admission Year Setup' })).toBeVisible();
    await expect(page.getByText('Enrollment settings categories')).toHaveCount(0);

    await page.goto(`/student/enrollment/settings/pipeline?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/pipeline/?\\?cycle=${academicYearId}`)
    );
    await expect(page.getByRole('heading', { name: 'Pipeline Settings' })).toBeVisible();
    const pipelineSettings = page.getByRole('navigation', { name: 'Pipeline settings' });
    await pipelineSettings.getByRole('link', { name: /Inquiry Types/ }).click();
    await expect(page).toHaveURL(/panel=types/);
    await expect(page.getByRole('heading', { name: 'Inquiry Types', level: 2 })).toBeVisible();
    await pipelineSettings.getByRole('link', { name: /Lead Scoring/ }).click();
    await expect(page).toHaveURL(/panel=scoring/);

    await page.goto(`/student/enrollment/settings/registration?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByRole('heading', { name: 'Registration Settings' })).toBeVisible();
    const registrationSettings = page.getByRole('navigation', { name: 'Registration settings' });
    await registrationSettings.getByRole('link', { name: /Form Numbering/ }).click();
    await expect(page).toHaveURL(/panel=form-numbering/);
    await expect(page.getByRole('heading', { name: 'Form Numbering', level: 2 })).toBeVisible();
    await registrationSettings.getByRole('link', { name: /Required Documents/ }).click();
    await expect(page).toHaveURL(/panel=documents/);
    await expect(page.getByRole('heading', { name: 'Document Checklists' })).toBeVisible();

    await page.goto(`/student/enrollment/settings/entrance-exam?cycle=${academicYearId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/student/enrollment/settings/entrance-exam/?\\?cycle=${academicYearId}`)
    );
    const examSettingsHeader = page.locator('header').filter({ hasText: 'Assessment Settings' });
    await expect(
      examSettingsHeader.getByRole('heading', { name: 'Assessment Settings' })
    ).toBeVisible();
    await expect(examSettingsHeader.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      new RegExp(`/student/enrollment/settings/?\\?cycle=${academicYearId}`)
    );
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
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
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

  test('principal can duplicate, preview, and download a public inquiry form QR code', async ({
    page,
  }) => {
    test.setTimeout(150_000);

    await login(page);
    const configuration = await getApplicationConfiguration(page);
    const tenantId = configuration?.currentTenant?.id;
    expect(tenantId, 'Current tenant id is required for the public form QR code.').toBeTruthy();

    const academicYearId = await resolveAcademicYearId(page);
    const template = await createPublicInquiryTemplate(page, academicYearId);

    await page.goto(
      `/student/enrollment/settings/inquiry-capture?cycle=${academicYearId}&panel=forms`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByRole('heading', { name: 'Form Templates' })).toBeVisible();

    const templateCard = page.getByRole('article', {
      name: `Inquiry form ${template.templateName}`,
      exact: true,
    });
    await expect(templateCard).toBeVisible();
    await expect(templateCard.getByRole('button', { name: 'Download QR' })).toBeEnabled();

    await templateCard.getByRole('button', { name: 'Language Preview' }).click();
    const preview = page.getByRole('dialog', { name: 'Parent Form Preview' });
    await expect(preview).toBeVisible();
    await expect(preview.getByLabel('Desktop parent form preview')).toBeVisible();

    await preview.getByLabel('Preview Language').click();
    await page.getByRole('option', { name: 'Gujarati' }).click();
    await expect(preview.getByRole('status')).toContainText('English fallback text');

    await preview.getByRole('button', { name: 'Mobile preview' }).click();
    await expect(preview.getByLabel('Mobile parent form preview')).toBeVisible();
    await preview.getByRole('button', { name: 'Close parent form preview' }).click();

    const downloadPromise = page.waitForEvent('download');
    await templateCard.getByRole('button', { name: 'Download QR' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/-qr\.png$/);

    await templateCard.getByRole('button', { name: 'Duplicate Form' }).click();
    const duplicateDialog = page.getByRole('dialog', { name: 'Duplicate Inquiry Form?' });
    await expect(duplicateDialog).toContainText(
      'Create an inactive draft with the same fields, translations, consent, and visibility rules.'
    );
    const duplicateResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'POST' &&
        url.pathname.endsWith(
          `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-templates`
        )
      );
    });
    await duplicateDialog.getByRole('button', { name: 'Create Draft Copy' }).click();
    const duplicateResponse = await duplicateResponsePromise;
    await expectOk(duplicateResponse, 'duplicate public inquiry form');
    const duplicate = await duplicateResponse.json();

    expect(duplicate.templateName).toBe(`${template.templateName} Copy`);
    expect(duplicate.isActive).toBe(false);
    expect(duplicate.fields).toHaveLength(template.fields.length);
    const duplicateCard = page.getByRole('article', {
      name: `Inquiry form ${duplicate.templateName}`,
      exact: true,
    });
    await expect(duplicateCard).toBeVisible({ timeout: 30_000 });
    await expect(duplicateCard).toContainText('Inactive');
  });

  test('registration template builder previews localized parent content across three steps', async ({
    page,
  }) => {
    await login(page);
    const academicYearId = await resolveAcademicYearId(page);

    await page.goto(
      `/student/enrollment/settings/registration?cycle=${academicYearId}&panel=registration`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByRole('heading', { name: 'Registration Settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Registration Form Templates' })).toBeVisible();
    await page.getByRole('button', { name: 'Use Starter Template' }).click();

    const builder = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: 'New Registration Template' }),
    });
    await expect(builder).toBeVisible();
    await expect(builder.getByText('Template Rules', { exact: true })).toBeVisible();
    await expect(builder.getByText('Sections & Fields', { exact: true })).toBeVisible();
    await expect(builder.getByText('Languages & Preview', { exact: true })).toBeVisible();
    await expect(builder.getByLabel('Template name')).toHaveValue('Standard School Registration');

    await builder.getByRole('button', { name: 'Continue' }).click();
    await expect(builder.getByText('Sections and fields')).toBeVisible();
    await expect(builder.getByLabel('Section title').first()).not.toHaveValue('');

    await builder.getByRole('button', { name: 'Continue' }).click();
    await expect(builder.getByText('Parent Language Content')).toBeVisible();
    await expect(builder.getByRole('tab', { name: 'Gujarati' })).toBeVisible();
    await expect(builder.getByRole('tab', { name: 'Hindi' })).toBeVisible();

    const localizedSectionTitle = uniqueToken('Gujarati section ');
    await builder.getByLabel('Gujarati Section Title').first().fill(localizedSectionTitle);
    await builder.getByRole('button', { name: 'Preview', exact: true }).click();

    const preview = page.getByRole('dialog').filter({
      has: page.getByRole('heading', { name: 'Registration form preview' }),
    });
    await expect(preview).toBeVisible();
    await preview.getByLabel('Parent Language').click();
    await page.getByRole('option', { name: 'Gujarati' }).click();
    await expect(preview.getByText(localizedSectionTitle)).toBeVisible();

    const viewportSelector = preview.getByRole('combobox', { name: 'Viewport' });
    await viewportSelector.click();
    await page.getByRole('option', { name: 'Mobile' }).click();
    await expect(viewportSelector).toHaveText('Mobile');

    await preview.getByRole('tab', { name: 'Print Form' }).click();
    await expect(preview.getByRole('button', { name: 'Print' })).toBeVisible();
    await preview.getByRole('button', { name: 'Close' }).click();
    await builder.getByRole('button', { name: 'Close', exact: true }).click();
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
          admissionIntent: `Admission inquiry for ${e2eTargetStandard?.standardName}`,
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
          inquirySourceId: e2eInquirySourceId,
          inquiryTypeId: e2eInquiryTypeId,
          targetStandardId: e2eTargetStandardId,
          channel: 1,
          firstName: firstLead.firstName,
          parentGuardianName: 'Playwright Parent',
          primaryContactNo: phone,
          admissionIntent: `Admission inquiry for ${e2eTargetStandard?.standardName}`,
          desiredClassName: e2eTargetStandard?.standardName,
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
    await page.getByRole('button', { name: /Add Inquiry/i }).click();
    const quickInquiry = page.getByRole('dialog', { name: 'Add Inquiry' });
    await expect(quickInquiry).toBeVisible();
    await expect(quickInquiry.getByLabel('First name')).toBeVisible();
    await expect(quickInquiry.getByLabel('Middle name (optional)')).toBeVisible();
    await expect(quickInquiry.getByLabel('Last name (optional)')).toBeVisible();
    await expect(quickInquiry.getByLabel('Board')).toBeVisible();
    await expect(quickInquiry.getByLabel('Medium')).toBeVisible();
    await expect(quickInquiry.getByLabel('Standard')).toBeVisible();
    await expect(quickInquiry.getByLabel('Admission pathway')).toBeVisible();
    await expect(quickInquiry.getByLabel('Inquiry channel')).toBeVisible();
    await expect(quickInquiry.getByText('@', { exact: true })).toBeVisible();
    await quickInquiry.getByLabel('Email address').fill('invalid-email');
    await quickInquiry.getByLabel('Email address').blur();
    await expect(
      quickInquiry.getByText('Enter a valid email address, for example parent@example.com.')
    ).toBeVisible();

    const quickInquiryFirstName = `Ui${Date.now()}`;
    const quickInquiryMiddleName = 'Journey';
    const quickInquiryLastName = 'Smoke';
    const quickInquiryPhone = uniquePhone();
    const quickInquiryEmail = `playwright.quick.${Date.now()}@example.test`;
    await quickInquiry.getByLabel('First name').fill(quickInquiryFirstName);
    await quickInquiry.getByLabel('Middle name (optional)').fill(quickInquiryMiddleName);
    await quickInquiry.getByLabel('Last name (optional)').fill(quickInquiryLastName);
    await quickInquiry.getByLabel('Parent or guardian').fill('Playwright Guardian');
    await quickInquiry.getByLabel('Contact number').fill(quickInquiryPhone);
    await quickInquiry.getByLabel('Email address').fill(quickInquiryEmail);

    await quickInquiry.getByLabel('Board').click();
    await page.getByRole('listbox').getByRole('option').first().click();
    await quickInquiry.getByLabel('Medium').click();
    await page.getByRole('listbox').getByRole('option').first().click();
    await quickInquiry.getByLabel('Standard').click();
    await page.getByRole('listbox').getByRole('option').first().click();
    await quickInquiry.getByLabel('Admission pathway').click();
    await page.getByRole('option', { name: 'Fresh admission', exact: true }).click();
    await quickInquiry.getByLabel('Inquiry channel').click();
    await page.getByRole('option', { name: 'Quick inquiry', exact: true }).click();

    const uiCreateResponsePromise = page.waitForResponse(
      (candidate) =>
        candidate.request().method() === 'POST' &&
        new URL(candidate.url()).pathname.endsWith(
          `/student-enrollment/admissions-crm/${academicYearId}/leads`
        )
    );
    await quickInquiry.getByRole('button', { name: 'Create Inquiry' }).click();
    const uiCreateResponse = await uiCreateResponsePromise;
    await expectOk(uiCreateResponse, 'create quick inquiry through the UI');
    const uiCreatedLead = await uiCreateResponse.json();
    expect(uiCreatedLead?.stage, 'UI quick inquiry should start as New Inquiry.').toBe(0);
    expect(uiCreatedLead?.firstName).toBe(quickInquiryFirstName);
    expect(uiCreatedLead?.middleName).toBe(quickInquiryMiddleName);
    expect(uiCreatedLead?.lastName).toBe(quickInquiryLastName);
    expect(uiCreatedLead?.email).toBe(quickInquiryEmail);
    expect(uiCreatedLead?.intendedRouteNameSnapshot).toBe('Fresh admission');
    expect(uiCreatedLead?.intendedRouteDefinitionVersion).toBe(1);
    await expect(page).toHaveURL(new RegExp(`/student/enrollment/applicants/${uiCreatedLead.id}`));
    let applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
    await expect(applicantWorkspace).toContainText(
      `${quickInquiryFirstName} ${quickInquiryMiddleName} ${quickInquiryLastName}`
    );
    const applicantContext = applicantWorkspace.getByRole('complementary', {
      name: 'Applicant context',
    });
    await expect(applicantContext).toContainText('Admission Pathway');
    await expect(applicantContext).toContainText('Fresh admission');
    await expect(applicantContext).toContainText('Version 1 captured at inquiry');
    await expect(
      applicantWorkspace.locator('[aria-label="Admission journey"]').getByText('Inquiry', {
        exact: true,
      })
    ).toBeVisible();
    await applicantWorkspace.getByRole('button', { name: 'Activity & Audit' }).click();
    await expect(page.locator('#applicant-activity-title')).toBeVisible();
    const activityActor = page.getByText(/^Actor:/).first();
    await expect(activityActor).toBeVisible();
    await expect(activityActor).not.toContainText('Loading staff');
    await expect(activityActor).not.toContainText('Staff identity unavailable');
    await page.getByRole('button', { name: 'Close activity and audit' }).click();
    await applicantWorkspace.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/student\/enrollment\/pipeline/);

    await page.getByRole('textbox', { name: 'Search applicants' }).fill(firstLead.firstName);
    expect(decodeURIComponent(page.url())).not.toContain(firstLead.firstName);
    const createdLeadRow = page.locator(
      `[data-testid="student-enrollment-pipeline-row"][data-lead-id="${firstLead.id}"]`
    );
    await expect(createdLeadRow).toBeVisible({ timeout: 30_000 });
    await createdLeadRow.click();
    await expect(page).toHaveURL(new RegExp(`/student/enrollment/applicants/${firstLead.id}`));
    applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
    await expect(applicantWorkspace).toBeVisible();
    const admissionJourney = applicantWorkspace.locator('[aria-label="Admission journey"]');
    await expect(admissionJourney.getByText('Inquiry', { exact: true })).toBeVisible();
    await expect(admissionJourney.getByText('Entrance Exam', { exact: true })).toBeVisible();
    await expect(admissionJourney.getByText('Registration', { exact: true })).toBeVisible();
    await expect(admissionJourney.getByText('Finance', { exact: true })).toBeVisible();
    await expect(admissionJourney.getByText('Class Placement', { exact: true })).toBeVisible();
    await expect(admissionJourney.getByText('Activation', { exact: true })).toBeVisible();
    await applicantWorkspace.getByRole('button', { name: 'Activity & Audit' }).click();
    await expect(page.locator('#applicant-activity-title')).toBeVisible();
    await page.getByRole('button', { name: 'Close activity and audit' }).click();
    await applicantWorkspace.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/student\/enrollment\/pipeline/);
    expect(decodeURIComponent(page.url())).not.toContain(firstLead.firstName);
    await expect(page.getByRole('textbox', { name: 'Search applicants' })).toHaveValue(
      firstLead.firstName
    );
  });

  test('My Work preserves task context and protects an unsaved applicant edit', async ({
    page,
  }) => {
    test.setTimeout(150_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const applicationConfiguration = await getApplicationConfiguration(page);
    const currentUserId = applicationConfiguration?.currentUser?.id as string;
    expect(currentUserId, 'Authenticated user id is required for My Work.').toBeTruthy();

    const lead = await createCrmLead(page, academicYearId, uniquePhone(), 'MyWork');
    const taskTitle = uniqueToken('Call guardian ');
    const taskResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/leads/${lead.id}/tasks`,
      {
        method: 'POST',
        body: {
          title: taskTitle,
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
          assignedUserId: currentUserId,
          notes: 'Confirm the preferred follow-up time.',
        },
      }
    );
    await expectOk(taskResponse, 'create assigned My Work task');

    const directMyWorkResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/${academicYearId}/operations/my-work?skipCount=0&maxResultCount=25`
    );
    await expectOk(directMyWorkResponse, 'load My Work without medium filter');

    const myWorkResponsePromise = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith(
        `/student-enrollment/admissions-crm/${academicYearId}/operations/my-work`
      )
    );
    await page.goto(workspaceUrl('/student/enrollment/my-work', academicYearId), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    const myWorkResponse = await myWorkResponsePromise;
    await expectOk(myWorkResponse, `load My Work ${myWorkResponse.url()}`);
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible({ timeout: 30_000 });
    const workRow = page.locator('tr').filter({ hasText: taskTitle });
    await expect(workRow).toBeVisible();
    await workRow.getByRole('button', { name: 'Complete task' }).click();

    await expect(page).toHaveURL(new RegExp(`/student/enrollment/applicants/${lead.id}`));
    const applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
    await expect(
      applicantWorkspace.getByRole('complementary', { name: 'Current work' })
    ).toContainText(taskTitle);
    expect(decodeURIComponent(page.url())).not.toContain(taskTitle);
    expect(decodeURIComponent(page.url())).not.toContain(lead.primaryContactNo);

    await applicantWorkspace.getByRole('button', { name: 'Add note' }).click();
    const note = applicantWorkspace.getByLabel('Note');
    await note.fill('Unsaved My Work follow-up note');
    await applicantWorkspace.getByRole('button', { name: 'Activity & Audit' }).click();
    const discardDialog = page.getByRole('dialog').filter({ hasText: 'Discard unsaved changes?' });
    await expect(discardDialog).toBeVisible();
    await discardDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('#applicant-activity-title')).toHaveCount(0);
    await expect(note).toHaveValue('Unsaved My Work follow-up note');
    await applicantWorkspace.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('terminal inquiry stages do not unlock new downstream work', async ({ page }) => {
    test.setTimeout(120_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const lead = await createCrmLead(page, academicYearId, uniquePhone(), 'Archived');
    const archiveResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/leads/${lead.id}/archive`,
      {
        method: 'POST',
        body: {
          reason: 'Applicant withdrew during the E2E terminal-stage check.',
        },
      }
    );
    await expectOk(archiveResponse, 'archive CRM lead');
    const archivedLead = await archiveResponse.json();
    expect(archivedLead?.stage, 'Archive response should be terminal.').toBe(9);
    const persistedArchivedLead = await getCrmLead(page, lead.id);
    expect(persistedArchivedLead?.stage, 'Archived lead should persist as terminal.').toBe(9);

    const browserLeadResponsePromise = page.waitForResponse(
      (candidate) =>
        candidate.request().method() === 'GET' &&
        new URL(candidate.url()).pathname.endsWith(
          `/student-enrollment/admissions-crm/leads/${lead.id}`
        )
    );
    const browserProgressResponsePromise = page.waitForResponse(
      (candidate) =>
        candidate.request().method() === 'GET' &&
        new URL(candidate.url()).pathname.endsWith(
          `/student-enrollment/admissions-crm/workspace/applicants/${lead.id}/progress`
        )
    );
    await page.goto(
      `${workspaceUrl(`/student/enrollment/applicants/${lead.id}`, academicYearId)}&tab=next`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    const browserLeadResponse = await browserLeadResponsePromise;
    const browserProgressResponse = await browserProgressResponsePromise;
    await expectOk(browserLeadResponse, 'load archived CRM lead in the browser');
    await expectOk(browserProgressResponse, 'load archived applicant progress in the browser');
    expect((await browserLeadResponse.json())?.stage).toBe(9);
    expect((await browserProgressResponse.json())?.closedOutcome).toBe(1);
    const applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
    await expect(applicantWorkspace).toContainText(lead.firstName);
    await expect(applicantWorkspace.getByText('Archived', { exact: true }).first()).toBeVisible();
    await expect(applicantWorkspace.getByText('Outcome Withdrawn', { exact: true })).toBeVisible();
    await expect(
      applicantWorkspace.getByRole('button', { name: 'Schedule Assessment' })
    ).toHaveCount(0);
    await expect(
      applicantWorkspace.getByRole('button', { name: 'Activity & Audit' })
    ).toBeVisible();
  });

  test('paper registration uses configured academic and pathway options end to end', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    expect(e2eTargetStandard).toBeTruthy();
    const templateName = uniqueToken('Paper registration ');
    const template = await createPublishedRegistrationTemplate(
      page,
      academicYearId,
      String(e2eTargetStandard?.standardName),
      templateName
    );

    try {
      await page.goto(workspaceUrl('/student/enrollment/registration', academicYearId), {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      await page.getByRole('button', { name: 'Enter Paper Registration' }).click();
      const dialog = page.getByRole('dialog', { name: 'Enter Paper Registration' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('@', { exact: true })).toBeVisible();
      await dialog.getByLabel('Email address').fill('invalid-email');
      await dialog.getByLabel('Email address').blur();
      await expect(
        dialog.getByText('Enter a valid email address, for example parent@example.com.')
      ).toBeVisible();

      const firstName = uniqueToken('Paper');
      const email = `paper.${Date.now()}@example.test`;
      await dialog.getByLabel('First name').fill(firstName);
      await dialog.getByLabel('Last name').fill('Registration');
      await dialog
        .getByRole('textbox', { name: 'Parent or guardian', exact: true })
        .fill('Direct Registration Guardian');
      await dialog.getByRole('textbox', { name: 'Parent or guardian mobile' }).fill(uniquePhone());
      await dialog.getByLabel('Email address').fill(email);
      await dialog.getByRole('button', { name: 'Next' }).click();

      await dialog.getByLabel('Board').click();
      await page.getByRole('option', { name: e2eTargetStandard?.boardName, exact: true }).click();
      await dialog.getByLabel('Medium').click();
      await page.getByRole('option', { name: e2eTargetStandard?.mediumName, exact: true }).click();
      await dialog.getByLabel('Standard').click();
      await page
        .getByRole('option', { name: e2eTargetStandard?.standardName, exact: true })
        .click();
      await dialog.getByLabel('Admission pathway').click();
      await page.getByRole('option', { name: 'Fresh admission', exact: true }).click();
      await dialog.getByRole('button', { name: 'Next' }).click();

      await dialog.getByLabel('Registration template').click();
      await page.getByRole('option', { name: `${templateName} - v1`, exact: true }).click();
      const paperFormNumber = `PW-PAPER-${Date.now()}`;
      await dialog.getByLabel('Paper form number').fill(paperFormNumber);
      await dialog.getByRole('button', { name: 'Next' }).click();

      const paperResponsePromise = page.waitForResponse(
        (candidate) =>
          candidate.request().method() === 'POST' &&
          new URL(candidate.url()).pathname.endsWith(
            `/student-enrollment/admissions-crm/${academicYearId}/registrations/from-paper`
          )
      );
      await dialog.getByRole('button', { name: 'Create From Paper Form' }).click();
      const paperResponse = await paperResponsePromise;
      await expectOk(paperResponse, 'create paper registration through the UI');
      const paperRegistration = await paperResponse.json();

      await expect(page).toHaveURL(
        new RegExp(`/student/enrollment/applicants/${paperRegistration.applicant.id}`)
      );
      const applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
      await expect(applicantWorkspace).toContainText(firstName);
      await expect(applicantWorkspace).toContainText(paperFormNumber);
      const applicantContext = applicantWorkspace.getByRole('complementary', {
        name: 'Applicant context',
      });
      await expect(applicantContext).toContainText('Admission Pathway');
      await expect(applicantContext).toContainText('Fresh admission');
      await expect(applicantWorkspace).toContainText(String(e2eTargetStandard?.standardName));
    } finally {
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/configuration/registration-templates/${template.id}/retire`,
        { method: 'POST' }
      );
    }
  });

  test('public form captures consent and creates status token', async ({ page }) => {
    test.setTimeout(150_000);

    await login(page);
    const configuration = await getApplicationConfiguration(page);
    const tenantId = configuration?.currentTenant?.id;
    expect(tenantId, 'Current tenant id is required for public admissions CRM E2E.').toBeTruthy();

    const academicYearId = await resolveAcademicYearId(page);
    const template = await createPublicInquiryTemplate(page, academicYearId);
    try {
      expect(template?.isActive, 'Public inquiry template should be active.').toBe(true);

      const formResponse = await publicApiRequest(
        page,
        `/public/student-enrollment/admissions-crm/${tenantId}/forms/${template.id}`
      );
      await expectOk(formResponse, 'read public CRM form');
      const form = await formResponse.json();
      expect(form?.consentVersion, 'Public form should expose a consent version.').toBeTruthy();

      const inquiryPage = await page.context().newPage();
      try {
        await inquiryPage.setViewportSize({ width: 390, height: 844 });
        await inquiryPage.goto(`/student/admissions/inquiry/${tenantId}/${template.id}`, {
          waitUntil: 'domcontentloaded',
          timeout: 60_000,
        });
        await expect(
          inquiryPage.getByRole('heading', { name: template.templateName })
        ).toBeVisible();
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
              parentName: 'Public CRM Guardian',
              parentPhone: uniquePhone(),
              parentEmail: `${uniqueToken('parent').toLowerCase()}@example.com`,
              admissionIntent: 'Admission inquiry for Grade 2',
              targetStandardId: e2eTargetStandardId,
              desiredClass: e2eTargetStandard?.standardName,
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
      expect(
        challenge?.maskedDestination,
        'OTP challenge should mask the destination.'
      ).toBeTruthy();
      expect(
        challenge?.deliveryStatus,
        'OTP challenge should return delivery status.'
      ).toBeTruthy();
    } finally {
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/configuration/form-templates/${template.id}/status`,
        { method: 'PATCH', body: { isActive: false } }
      );
    }
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
    const examDialog = page.getByRole('dialog', { name: /Manage Assessment/i });
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

  test('principal bulk result import validates correction files and OMR payloads', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await login(page);
    const academicYearId = await resolveAcademicYearId(page);
    const principalConfiguration = await getApplicationConfiguration(page);
    const principalPolicies = principalConfiguration?.auth?.grantedPolicies ?? {};
    expect(
      principalPolicies['Students.Enrollment.AdmissionsCrm.BulkOperations'],
      'Principal requires bulk-operations permission for the import flow.'
    ).toBe(true);
    expect(principalPolicies['Students.Enrollment.AdmissionsCrm.ChangeExamResult']).toBe(true);
    expect(principalPolicies['Students.Enrollment.AdmissionsCrm.OverrideExamResult']).toBe(true);

    const lead = await createCrmLead(page, academicYearId, uniquePhone(), 'BulkResult');
    const slot = await getAvailableEntranceExamSlot(page, academicYearId);
    const scheduleResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/leads/${lead.id}/exam/schedule`,
      {
        method: 'POST',
        body: { entranceExamSlotId: slot.id },
      }
    );
    await expectOk(scheduleResponse, 'schedule exam for bulk result import');
    const scheduled = await scheduleResponse.json();

    await expectOk(
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/exams/${scheduled.id}/attendance`,
        {
          method: 'POST',
          body: { attendanceStatus: 1 },
        }
      ),
      'mark attendance before recording the existing result'
    );
    await expectOk(
      await crmApiRequest(page, `/student-enrollment/admissions-crm/exams/${scheduled.id}/result`, {
        method: 'POST',
        body: {
          totalMarks: 100,
          passingMarks: 40,
          obtainedMarks: 67,
          meritRank: 3,
        },
      }),
      'record existing result for correction import'
    );

    const examRow = await openExamRowInWorkspace(
      page,
      lead.firstName,
      scheduled.slotNameSnapshot || slot.slotName,
      academicYearId
    );
    await examRow.getByRole('checkbox', { name: `Select ${lead.firstName}` }).check();

    const bulkActions = page.getByRole('region', { name: 'Bulk exam actions' });
    await expect(bulkActions).toBeVisible();
    await expect(bulkActions.getByRole('button', { name: 'Give Marks' })).toBeVisible();
    await expect(bulkActions.getByRole('button', { name: 'Upload Results' })).toBeVisible();
    await expect(bulkActions.getByRole('button', { name: 'OMR Import' })).toBeVisible();

    await bulkActions.getByRole('button', { name: 'Upload Results' }).click();
    const uploadDialog = page.getByRole('dialog', { name: 'Upload Exam Results' });
    await expect(uploadDialog.getByLabel('Correction Reason')).toBeVisible();
    await uploadDialog.locator('input[name="exam-result-file"]').setInputFiles({
      name: 'corrected-exam-results.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        [
          'Exam Record ID,Total Marks,Passing Marks,Obtained Marks,Merit Rank',
          `${scheduled.id},100,40,71,2`,
        ].join('\n')
      ),
    });
    await expect(uploadDialog.getByText('1 result validated and ready to import.')).toBeVisible({
      timeout: 30_000,
    });
    await expect(uploadDialog.getByRole('button', { name: 'Import Results' })).toBeDisabled();
    await uploadDialog
      .getByLabel('Correction Reason')
      .fill('Verified score correction from signed source sheet.');
    await expect(uploadDialog.getByRole('button', { name: 'Import Results' })).toBeEnabled();
    await uploadDialog.getByRole('button', { name: 'Cancel' }).click();

    await bulkActions.getByRole('button', { name: 'OMR Import' }).click();
    const omrDialog = page.getByRole('dialog', { name: 'Import OMR Results' });
    await expect(omrDialog).toContainText('exported by your OMR scanner');
    await omrDialog.getByRole('button', { name: 'Cancel' }).click();
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
      await prepareLeadForRegistration(page, academicYearId, lead.id);
      const registrationTemplateName = uniqueToken('Playwright exam gate ');
      registrationTemplate = await createPublishedRegistrationTemplate(
        page,
        academicYearId,
        String(e2eTargetStandard?.standardName),
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
      await expect(page).toHaveURL(new RegExp(`/student/enrollment/applicants/${lead.id}`));
      const applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
      await expect(applicantWorkspace.getByText('Registration has not been issued')).toBeVisible();
      await applicantWorkspace.getByRole('button', { name: 'Issue registration' }).click();
      await applicantWorkspace.getByLabel('Registration template').click();
      await page.getByRole('option', { name: `${registrationTemplateName} - v1` }).click();
      await applicantWorkspace.getByRole('button', { name: 'Issue', exact: true }).click();

      await expect
        .poll(async () => (await getCrmLead(page, lead.id)).registrationFormNumber, {
          timeout: 30_000,
          message: 'Registration form issue should persist.',
        })
        .not.toBeFalsy();
      const issuedLead = await getCrmLead(page, lead.id);
      expect(issuedLead.registrationFormNumber).toBeTruthy();
      const issuedFormNumber = String(issuedLead.registrationFormNumber);
      await expect(
        applicantWorkspace.getByText(new RegExp(escapeRegExp(issuedFormNumber)))
      ).toBeVisible();

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
          inquirySourceId: e2eInquirySourceId,
          inquiryTypeId: e2eInquiryTypeId,
          targetStandardId: e2eTargetStandardId,
          channel: 1,
          firstName: `Journey${unique}`,
          parentGuardianName: 'Playwright Parent',
          primaryContactNo: phone,
          admissionIntent: `Admission inquiry for ${e2eTargetStandard?.standardName}`,
          desiredClassName: e2eTargetStandard?.standardName,
          campusBranchName: campus,
        },
      }
    );
    await expectOk(leadResponse, 'create registration journey lead');
    const lead = await leadResponse.json();
    await prepareLeadForRegistration(page, academicYearId, lead.id);

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
          autoIssueAtStage: 5,
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

    await prepareEligibleExamResultForRegistration(page, academicYearId, lead.id);

    const currentRegistrationResponse = await crmApiRequest(
      page,
      `/student-enrollment/admissions-crm/leads/${lead.id}/registrations/current`
    );
    await expectOk(currentRegistrationResponse, 'read auto-issued CRM registration');
    const autoIssuedRegistration = await currentRegistrationResponse.json();
    expect(autoIssuedRegistration?.id).toBeTruthy();
    expect(autoIssuedRegistration?.leadId).toBe(lead.id);
    expect(autoIssuedRegistration?.academicYearId).toBe(academicYearId);
    expect(autoIssuedRegistration?.registrationTemplateId).toBe(registrationTemplate.id);
    expect(autoIssuedRegistration?.formNumber).toBeTruthy();
    expect(autoIssuedRegistration?.applicantStatusPath).toBeTruthy();
    const registration = autoIssuedRegistration;
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
    const canCaptureOtp = canCaptureOtpForConfiguredApi();
    await expectOk(
      await crmApiRequest(
        page,
        `/student-enrollment/admissions-crm/${academicYearId}/communication/providers/1`,
        {
          method: 'PUT',
          body: {
            isEnabled: true,
            providerName: canCaptureOtp ? 'Playwright OTP webhook' : 'Playwright manual OTP queue',
            senderId: 'e2e',
            settings: {
              adapter: canCaptureOtp ? 'webhook' : 'manual',
              payloadMode: 'default',
              headers: {},
              parameters: {},
              callbackMappings: {},
            },
            webhookUrl: canCaptureOtp ? otpWebhookUrl : null,
          },
        }
      ),
      'configure local OTP webhook'
    );

    const parentPage = await page.context().newPage();
    try {
      capturedOtp = '';
      await parentPage.goto(registration.applicantStatusPath, { waitUntil: 'domcontentloaded' });
      const otpChallengePromise = parentPage.waitForResponse(
        (response) =>
          response.url().includes('/status/') &&
          response.url().endsWith('/otp') &&
          response.request().method() === 'POST'
      );
      await parentPage.getByRole('button', { name: 'Send OTP' }).click();
      const otpChallengeResponse = await otpChallengePromise;
      expect(otpChallengeResponse.ok()).toBe(true);
      const otpChallenge = await otpChallengeResponse.json();
      expect(otpChallenge.maskedDestination).toBeTruthy();
      expect(otpChallenge.deliveryStatus).toBeTruthy();
      await expect(parentPage.getByLabel('OTP code')).toBeVisible();
      await expect(parentPage.getByText(String(otpChallenge.deliveryStatus))).toBeVisible();

      let accessSessionToken = '';
      if (canCaptureOtp) {
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
        accessSessionToken = verifiedStatus.accessSessionToken as string;
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
          buffer: pdfFixture('first unreadable version'),
        });
        await parentPage.getByRole('button', { name: 'Upload' }).click();
        await expect(parentPage.getByText('Uploaded', { exact: true })).toBeVisible({
          timeout: 20_000,
        });
      }

      await page.goto(
        workspaceUrl(`/student/enrollment/applicants/${lead.id}?tab=registration`, academicYearId),
        { waitUntil: 'domcontentloaded', timeout: 60_000 }
      );
      await expect(page).toHaveURL(new RegExp(`/student/enrollment/applicants/${lead.id}`));
      const applicantWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
      await applicantWorkspace
        .locator('[aria-label="Admission journey"]')
        .getByRole('button', { name: /Registration/ })
        .click();
      await expect(applicantWorkspace).toContainText(registration.formNumber);
      if (!canCaptureOtp) {
        await applicantWorkspace.getByLabel('Parent occupation').fill('Engineer');
        await applicantWorkspace.getByLabel('Declaration accepted').check();
        await applicantWorkspace.getByRole('button', { name: 'Submit registration' }).click();
        await expect(applicantWorkspace.getByText('Submitted', { exact: true })).toBeVisible({
          timeout: 20_000,
        });
        await applicantWorkspace
          .getByLabel('Choose file for Birth certificate')
          .last()
          .setInputFiles({
            name: 'birth.pdf',
            mimeType: 'application/pdf',
            buffer: pdfFixture('first unreadable version'),
          });
        await applicantWorkspace.getByRole('button', { name: 'Upload Birth certificate' }).click();
        await expect(applicantWorkspace.getByText('Uploaded', { exact: true })).toBeVisible({
          timeout: 20_000,
        });
      }
      await applicantWorkspace
        .locator('#registration-lifecycle-operation')
        .getByRole('button', { name: 'Verify Registration' })
        .click();
      await expect(applicantWorkspace.getByText('Verified', { exact: true })).toBeVisible({
        timeout: 20_000,
      });
      const documentReason = applicantWorkspace.getByLabel('Decision or waiver reason');
      await documentReason.fill('The first scan is unreadable.');
      await applicantWorkspace.getByRole('button', { name: 'Reject' }).click();
      await expect(applicantWorkspace.getByText('Rejected', { exact: true })).toBeVisible({
        timeout: 20_000,
      });

      const replacementResponse = await parentPage.request.post(
        canCaptureOtp
          ? `${apiBaseUrl()}/api/public/student-enrollment/admissions-crm/${tenantId}/status/${registration.applicantStatusPath.split('/').pop()}/registration/documents`
          : `${apiBaseUrl()}/api/student-enrollment/admissions-crm/registrations/${registration.id}/documents`,
        canCaptureOtp
          ? {
              multipart: {
                AccessSessionToken: accessSessionToken,
                RequirementKey: 'birth-certificate',
                File: {
                  name: 'birth.pdf',
                  mimeType: 'application/pdf',
                  buffer: pdfFixture('clear replacement version'),
                },
              },
            }
          : {
              headers: {
                Authorization: `Bearer ${await getAccessToken(page)}`,
                __tenant: tenantCode(),
              },
              multipart: {
                RequirementKey: 'birth-certificate',
                File: {
                  name: 'birth.pdf',
                  mimeType: 'application/pdf',
                  buffer: pdfFixture('clear replacement version'),
                },
              },
            }
      );
      await expectOk(replacementResponse, 'upload replacement document');
      const replacementChecklist = await replacementResponse.json();
      const replacementDocument = replacementChecklist?.documents?.find(
        (document: { requirementKey?: string }) => document.requirementKey === 'birth-certificate'
      );
      expect(replacementDocument?.id).toBeTruthy();
      expect(replacementDocument?.status).toBe(0);
      await expectOk(
        await crmApiRequest(
          page,
          `/student-enrollment/admissions-crm/documents/${replacementDocument.id}/review`,
          { method: 'POST', body: { approve: true } }
        ),
        'verify replacement document'
      );

      await page.goto(
        workspaceUrl(`/student/enrollment/applicants/${lead.id}?tab=registration`, academicYearId),
        { waitUntil: 'domcontentloaded', timeout: 60_000 }
      );
      await expect(page).toHaveURL(new RegExp(`/student/enrollment/applicants/${lead.id}`));
      const refreshedWorkspace = page.getByRole('article', { name: 'Applicant workspace' });
      await refreshedWorkspace
        .locator('[aria-label="Admission journey"]')
        .getByRole('button', { name: /Registration/ })
        .click();
      await expect(refreshedWorkspace.getByRole('button', { name: 'Original Seen' })).toBeVisible({
        timeout: 20_000,
      });
      await refreshedWorkspace.getByRole('button', { name: 'Original Seen' }).click();
      await refreshedWorkspace.getByRole('button', { name: 'Confirm Readiness' }).click();
      await expect(refreshedWorkspace.getByText('Readiness confirmed')).toBeVisible({
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
