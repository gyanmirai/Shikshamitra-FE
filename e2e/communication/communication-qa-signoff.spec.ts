/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop */
import { writeFile } from 'node:fs/promises';
import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test';

import { employeeApiRequest } from '../hr/employee/employee-api';

const communicationQaEnabled = process.env.E2E_COMMUNICATION_QA === '1';

enum CommunicationChannelType {
  WhatsApp = 0,
  Sms = 1,
  Email = 2,
  InApp = 3,
}

enum CommunicationProviderStatus {
  Disabled = 0,
  Enabled = 1,
  Suspended = 2,
}

enum CommunicationTemplateApprovalStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
}

enum CommunicationReplyStatus {
  Open = 0,
  Assigned = 1,
  Resolved = 2,
  Archived = 3,
}

type PagedResult<T> = {
  items?: T[];
  totalCount?: number;
};

type AcademicYear = {
  id: string;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type AcademicContext = {
  academicYear: AcademicYear;
  currentBoard: Record<string, unknown>;
  currentMedium: {
    id: string;
    name: string;
    educationMediumStages: Array<Record<string, unknown>>;
  };
};

type ChannelProviderSetting = {
  id: string;
  channel: CommunicationChannelType;
  providerName: string;
  senderId?: string | null;
  isEnabled: boolean;
  isDefault: boolean;
  configurationJson?: string | null;
  secretReference?: string | null;
  fallbackOrder?: CommunicationChannelType[];
  dailyQuota?: number | null;
  monthlyQuota?: number | null;
  consentRequired: boolean;
  templateApprovalRequired: boolean;
  status: CommunicationProviderStatus;
};

type CommunicationTemplate = {
  id: string;
  templateName: string;
};

type CommunicationCampaign = {
  id: string;
  title: string;
  status: number;
  queuedCount?: number;
  failedCount?: number;
};

type DeliveryAttempt = {
  id: string;
  campaignId: string;
  recipientSnapshotId?: string | null;
  channel: CommunicationChannelType;
  destination: string;
  status: number;
  providerName?: string | null;
  providerMessageId?: string | null;
  attemptNumber: number;
  estimatedCost?: number | null;
};

type CommunicationReply = {
  id: string;
  campaignId?: string | null;
  deliveryAttemptId?: string | null;
  channel: CommunicationChannelType;
  fromAddress: string;
  body: string;
  assignedDepartment?: string | null;
  status: CommunicationReplyStatus;
  internalNotes?: string | null;
};

type UsageLedgerEntry = {
  id: string;
  campaignId?: string | null;
  channel: CommunicationChannelType;
  providerName: string;
  attemptCount: number;
  deliveredCount: number;
  failedCount: number;
  estimatedCost: number;
};

type ResponseLike = {
  ok: () => boolean;
  status: () => number;
  text: () => Promise<string>;
};

type RouteCheck = {
  label: string;
  path: string;
  expected: string;
  status: 'passed' | 'failed';
  error?: string;
};

type QaFailure = {
  code: string;
  message: string;
  details?: unknown;
};

type QaReport = {
  generatedAt: string;
  runId: string;
  tenant: string;
  baseUrl: string;
  apiUrl: string;
  academicContext?: {
    academicYearId: string;
    academicYearName?: string | null;
    academicMediumId: string;
    academicMediumName: string;
  };
  routeChecks: RouteCheck[];
  workflow: {
    providerSettingId?: string;
    providerName?: string;
    templateId?: string;
    templateName?: string;
    campaignId?: string;
    campaignStatus?: number;
    deliveryAttemptId?: string;
    providerMessageId?: string | null;
    replyId?: string;
    assignedDepartment?: string;
    usageAttemptCount?: number;
  };
  cleanup: {
    providerDeleted?: boolean;
    templateDeleted?: boolean;
    previousEmailDefaultRestored?: boolean;
  };
  warnings: string[];
  failures: QaFailure[];
};

type RuntimeGuard = {
  failures: string[];
  appendToReport: (report: QaReport) => void;
};

const routeChecks = [
  {
    label: 'Communication Dashboard',
    path: '/communication/dashboard',
    expected: /Weekly Notifications Trend|Delivery Channel Usage/i,
  },
  {
    label: 'Announcements',
    path: '/communication/announcement',
    expected: /Announcements?|Add Announcement/i,
  },
  {
    label: 'Send Notification',
    path: '/communication/notification/send-notification',
    expected: /Sent Notification|Send Notification/i,
  },
  {
    label: 'Templates',
    path: '/communication/notification/templates',
    expected: /Templates?|Add Template|Name/i,
  },
  {
    label: 'Provider Settings',
    path: '/communication/settings/deliveryChannelType',
    expected: /Provider Settings|Provider Setting/i,
  },
  {
    label: 'Notification History',
    path: '/communication/notification-history',
    expected: /Notification History/i,
  },
  {
    label: 'Communication Inbox',
    path: '/communication/messages',
    expected: /Communication Inbox|No replies found/i,
  },
];

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function baseUrl() {
  return process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function apiUrl() {
  return process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44332';
}

function tenant() {
  return process.env.E2E_TENANT || 'DDVS';
}

function assertLocalDdvsOnly() {
  const frontend = new URL(baseUrl());
  const api = new URL(apiUrl());

  expect(localHosts.has(frontend.hostname), `frontend must be local: ${frontend.href}`).toBe(true);
  expect(localHosts.has(api.hostname), `API must be local: ${api.href}`).toBe(true);
  expect(tenant().toUpperCase(), 'tenant must be DDVS').toBe('DDVS');
}

function buildReport(runId: string): QaReport {
  return {
    generatedAt: new Date().toISOString(),
    runId,
    tenant: tenant(),
    baseUrl: baseUrl(),
    apiUrl: apiUrl(),
    routeChecks: [],
    workflow: {},
    cleanup: {},
    warnings: [],
    failures: [],
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function fillStableInput(page: Page, locator: Locator, value: string, label: string) {
  const deadline = Date.now() + 30_000;
  let lastError = '';

  while (Date.now() < deadline) {
    try {
      await expect(locator, `${label} should be visible`).toBeVisible({ timeout: 5_000 });
      await expect(locator, `${label} should be enabled`).toBeEnabled({ timeout: 5_000 });
      await locator.fill(value, { timeout: 5_000 });
      await expect(locator, `${label} should keep filled value`).toHaveValue(value, {
        timeout: 5_000,
      });
      return;
    } catch (error) {
      lastError = errorMessage(error);
      await page.waitForTimeout(500);
    }
  }

  throw new Error(`Could not fill ${label}: ${lastError}`);
}

function addFailure(report: QaReport, code: string, message: string, details?: unknown) {
  report.failures.push({ code, message, details });
}

function appendWarning(report: QaReport, message: string) {
  report.warnings.push(message);
}

function pagedItems<T>(body: PagedResult<T> | T[] | null | undefined): T[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  return [];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function expectOk(response: ResponseLike, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

async function getJson<T>(page: Page, path: string): Promise<T> {
  const response = await employeeApiRequest(page, path);
  await expectOk(response, `GET ${path}`);
  return response.json() as Promise<T>;
}

async function postJson<T>(page: Page, path: string, body: unknown): Promise<T> {
  const response = await employeeApiRequest(page, path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  await expectOk(response, `POST ${path}`);
  return response.json() as Promise<T>;
}

async function putJson<T>(page: Page, path: string, body?: unknown): Promise<T> {
  const response = await employeeApiRequest(page, path, {
    method: 'PUT',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  await expectOk(response, `PUT ${path}`);
  return response.json() as Promise<T>;
}

async function deleteOk(page: Page, path: string) {
  const response = await employeeApiRequest(page, path, { method: 'DELETE' });
  await expectOk(response, `DELETE ${path}`);
}

function isCommunicationApiUrl(value: string) {
  const pathname = new URL(value).pathname.toLowerCase();
  return [
    '/api/communication',
    '/api/announcements',
    '/api/notifications',
    '/api/notification-templates',
    '/api/deliverychanneltypedata',
    '/api/notificationhistorydata',
  ].some((prefix) => pathname.startsWith(prefix));
}

function attachRuntimeGuards(page: Page): RuntimeGuard {
  const failures: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;

    const text = message.text();
    const isNextAuthSessionNoise =
      text.includes('ClientFetchError: Failed to fetch') && text.includes('authjs.dev#autherror');
    const isHandledResource400 =
      text.includes('Failed to load resource') && text.includes('status of 400');
    const isStaticResource404 =
      text.includes('Failed to load resource') && text.includes('status of 404');

    if (isNextAuthSessionNoise || isHandledResource400 || isStaticResource404) return;
    failures.push(`console error at ${page.url()}: ${text}`);
  });

  page.on('pageerror', (error) => {
    failures.push(`page error at ${page.url()}: ${error.message}`);
  });

  page.on('response', (response) => {
    if (isCommunicationApiUrl(response.url()) && response.status() >= 500) {
      failures.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  return {
    failures,
    appendToReport: (report) => {
      failures.forEach((failure) => {
        addFailure(report, 'runtime-guard', failure);
      });
    },
  };
}

function toAcademicYear(item: any): AcademicYear {
  return item?.academicYear || item;
}

function currentAcademicYear(years: AcademicYear[]) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    years.find(
      (year) =>
        year.id &&
        (!year.startDate || year.startDate.slice(0, 10) <= today) &&
        (!year.endDate || year.endDate.slice(0, 10) >= today)
    ) || years.find((year) => year.id)
  );
}

function optionValue(item: any, ...keys: string[]) {
  const matchedValue = keys
    .map((key) => key.split('.').reduce((current, part) => current?.[part], item))
    .find(Boolean);
  return matchedValue ? String(matchedValue) : undefined;
}

async function resolveAcademicContext(page: Page): Promise<AcademicContext> {
  const yearsBody = await getJson<PagedResult<any>>(page, '/app/academic-year?Sorting=name');
  const years = pagedItems(yearsBody)
    .map(toAcademicYear)
    .filter((year) => year?.id);
  const academicYear = currentAcademicYear(years);

  if (!academicYear?.id) {
    throw new Error('Seeded academic year is required for Communication QA.');
  }

  const yearsToProbe = [
    academicYear,
    ...years.filter((year) => year.id.toLowerCase() !== academicYear.id.toLowerCase()),
  ];
  let selectedYear = academicYear;
  let options: any[] = [];
  let firstMedium: any;
  let mediumId: string | undefined;

  const probedYears = await Promise.all(
    yearsToProbe.map(async (candidateYear) => {
      const optionsBody = await getJson<PagedResult<any>>(
        page,
        `/app/academic-organization-options?academicYearId=${candidateYear.id}`
      );
      const candidateOptions = pagedItems(optionsBody);
      const candidateMedium = candidateOptions.find(
        (item) =>
          optionValue(item, 'mediumId', 'academicMediumId', 'medium.id', 'academicMedium.id') !==
          undefined
      );
      const candidateMediumId = optionValue(
        candidateMedium,
        'mediumId',
        'academicMediumId',
        'medium.id',
        'academicMedium.id'
      );

      return {
        candidateYear,
        candidateOptions,
        candidateMedium,
        candidateMediumId,
      };
    })
  );
  const selectedProbe = probedYears.find((candidate) => candidate.candidateMediumId);

  if (selectedProbe) {
    selectedYear = selectedProbe.candidateYear;
    options = selectedProbe.candidateOptions;
    firstMedium = selectedProbe.candidateMedium;
    mediumId = selectedProbe.candidateMediumId;
  }

  if (!mediumId) {
    mediumId = academicYear.id;
    firstMedium = {
      mediumId,
      mediumName: 'E2E Medium',
      boardId: undefined,
      boardName: undefined,
    };
  }

  const mediumOptions = options.filter((item) => {
    const candidate = optionValue(
      item,
      'mediumId',
      'academicMediumId',
      'medium.id',
      'academicMedium.id'
    );
    return candidate === mediumId;
  });

  const stages = mediumOptions
    .map((item, index) => {
      const stageId =
        optionValue(
          item,
          'educationMediumStageId',
          'mediumStageId',
          'stageId',
          'stage.id',
          'educationMediumStage.id'
        ) || `${mediumId}-stage-${index + 1}`;
      return {
        id: stageId,
        name:
          optionValue(
            item,
            'educationMediumStageName',
            'mediumStageName',
            'stageName',
            'stage.name',
            'educationMediumStage.name'
          ) || 'E2E Organization',
        divisions: Array.isArray(item?.divisions) ? item.divisions : [],
      };
    })
    .filter((stage, index, all) => all.findIndex((item) => item.id === stage.id) === index);

  return {
    academicYear: selectedYear,
    currentBoard: {
      id: optionValue(firstMedium, 'boardId', 'educationBoardId', 'board.id'),
      name: optionValue(firstMedium, 'boardName', 'educationBoardName', 'board.name'),
    },
    currentMedium: {
      id: mediumId,
      name:
        optionValue(firstMedium, 'mediumName', 'academicMediumName', 'medium.name') || 'E2E Medium',
      educationMediumStages:
        stages.length > 0
          ? stages
          : [{ id: `${mediumId}-stage`, name: 'E2E Organization', divisions: [] }],
    },
  };
}

async function primeAcademicSelection(page: Page, context: AcademicContext) {
  await page.evaluate((state) => {
    window.localStorage.setItem(
      'persist:root',
      JSON.stringify({
        globalState: JSON.stringify({
          currentYear: state.academicYear,
          currentBoard: state.currentBoard,
          currentMedium: state.currentMedium,
        }),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      })
    );
    window.localStorage.setItem('onboarding_completed', 'true');
  }, context);
}

function providerPayload(setting: ChannelProviderSetting, isDefault = setting.isDefault) {
  return {
    channel: setting.channel,
    providerName: setting.providerName,
    senderId: setting.senderId || null,
    isEnabled: setting.isEnabled,
    isDefault,
    configurationJson: setting.configurationJson || null,
    secretReference: setting.secretReference || null,
    fallbackOrder: setting.fallbackOrder || [setting.channel],
    dailyQuota: setting.dailyQuota ?? null,
    monthlyQuota: setting.monthlyQuota ?? null,
    consentRequired: setting.consentRequired,
    templateApprovalRequired: setting.templateApprovalRequired,
    status: setting.status,
  };
}

async function createQueueOnlyEmailProvider(page: Page, runId: string, report: QaReport) {
  const existingProvidersBody = await getJson<PagedResult<ChannelProviderSetting>>(
    page,
    `/communication/provider-settings?channel=${CommunicationChannelType.Email}&maxResultCount=1000`
  );
  const previousEmailDefaults = pagedItems(existingProvidersBody).filter(
    (provider) => provider.isDefault
  );
  const providerName = `E2E Email Internal ${runId}`;

  const provider = await postJson<ChannelProviderSetting>(
    page,
    '/communication/provider-settings',
    {
      channel: CommunicationChannelType.Email,
      providerName,
      senderId: 'E2E-QA',
      isEnabled: true,
      isDefault: true,
      configurationJson: JSON.stringify({ mode: 'queue-only', runId }),
      secretReference: `e2e/communication/${runId}`,
      fallbackOrder: [CommunicationChannelType.Email],
      dailyQuota: 1000,
      monthlyQuota: 10000,
      consentRequired: false,
      templateApprovalRequired: false,
      status: CommunicationProviderStatus.Enabled,
    }
  );

  report.workflow.providerSettingId = provider.id;
  report.workflow.providerName = provider.providerName;

  return { provider, previousEmailDefaults };
}

async function createApprovedTemplate(
  page: Page,
  runId: string,
  academicMediumId: string,
  report: QaReport
) {
  const template = await postJson<CommunicationTemplate>(page, '/communication/templates', {
    academicMediumId,
    templateName: `E2E Communication QA ${runId}`,
    targetRole: 'ParentGuardian',
    category: 'E2E QA',
    subject: `E2E QA Template ${runId}`,
    body: `Hello {{studentName}}, this is Communication QA ${runId}.`,
    languageCode: 'en',
    channels: [CommunicationChannelType.Email],
    variables: ['studentName'],
    hashtags: ['e2e', 'qa'],
    approvalStatus: CommunicationTemplateApprovalStatus.Approved,
    isActive: true,
  });

  report.workflow.templateId = template.id;
  report.workflow.templateName = template.templateName;
  return template;
}

async function cleanupSetupRecords(
  page: Page,
  report: QaReport,
  provider?: ChannelProviderSetting,
  previousEmailDefaults: ChannelProviderSetting[] = [],
  template?: CommunicationTemplate
) {
  if (provider?.id) {
    try {
      await Promise.all(
        previousEmailDefaults.map((previousDefault) =>
          putJson<ChannelProviderSetting>(
            page,
            `/communication/provider-settings/${previousDefault.id}`,
            providerPayload(previousDefault, true)
          )
        )
      );
      report.cleanup.previousEmailDefaultRestored = previousEmailDefaults.length > 0;
    } catch (error) {
      appendWarning(
        report,
        `Failed to restore previous Email default provider: ${errorMessage(error)}`
      );
    }

    try {
      await deleteOk(page, `/communication/provider-settings/${provider.id}`);
      report.cleanup.providerDeleted = true;
    } catch (error) {
      appendWarning(report, `Failed to delete E2E provider ${provider.id}: ${errorMessage(error)}`);
    }
  }

  if (template?.id) {
    try {
      await deleteOk(page, `/communication/templates/${template.id}`);
      report.cleanup.templateDeleted = true;
    } catch (error) {
      appendWarning(report, `Failed to delete E2E template ${template.id}: ${errorMessage(error)}`);
    }
  }
}

async function attachReport(testInfo: TestInfo, report: QaReport) {
  const reportPath = testInfo.outputPath('communication-qa-signoff-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  await testInfo.attach('communication-qa-signoff-report.json', {
    path: reportPath,
    contentType: 'application/json',
  });
}

async function assertRouteLoads(page: Page, report: QaReport, route: (typeof routeChecks)[number]) {
  const result: RouteCheck = {
    label: route.label,
    path: route.path,
    expected: String(route.expected),
    status: 'failed',
  };

  try {
    await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await expect(page, `${route.label} should stay authenticated`).not.toHaveURL(
      /\/login(?:\?|$)|\/auth/i,
      { timeout: 15_000 }
    );
    await expect(page.locator('body'), `${route.label} expected content`).toContainText(
      route.expected,
      { timeout: 45_000 }
    );
    result.status = 'passed';
  } catch (error) {
    result.error = errorMessage(error);
    addFailure(report, 'route-smoke', `${route.label} did not load correctly.`, {
      path: route.path,
      error: result.error,
    });
  } finally {
    report.routeChecks.push(result);
  }
}

async function searchTableForText(page: Page, tableId: string, text: string) {
  const table = page.getByTestId(tableId);
  await expect(table, `${tableId} should be visible`).toBeVisible({ timeout: 45_000 });

  const search = table.getByPlaceholder('Search...').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(text);
  }

  await expect(table, `${tableId} should contain ${text}`).toContainText(text, {
    timeout: 30_000,
  });
}

async function verifySetupScreens(
  page: Page,
  provider: ChannelProviderSetting,
  template: CommunicationTemplate
) {
  await page.goto('/communication/settings/deliveryChannelType', {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await searchTableForText(page, 'provider-settings-data-table', provider.providerName);

  await page.goto('/communication/notification/templates', {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await searchTableForText(page, 'template-data-table', template.templateName);
}

async function chooseOrganization(page: Page) {
  await page.getByLabel('Organizations').click();
  const allOption = page.getByRole('option', { name: /^All$/ }).first();
  if (await allOption.isVisible().catch(() => false)) {
    await allOption.click();
  } else {
    await page.getByRole('option').first().click();
  }
  await page.keyboard.press('Escape');
}

async function runSendNotificationWizard(page: Page, runId: string, report: QaReport) {
  const subject = `E2E QA Notification ${runId}`;
  const message = `This queued Communication QA message was created by Playwright run ${runId}.`;

  await page.goto('/communication/notification/send-notification', {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await expect(page).not.toHaveURL(/\/login(?:\?|$)|\/auth/i);
  await page.getByRole('button', { name: /^Send Notification$/i }).click();
  await expect(page.getByText(/Select Audience/i)).toBeVisible({ timeout: 30_000 });

  await chooseOrganization(page);

  const audienceTable = page.getByTestId('audience-selection-table');
  await expect(audienceTable.getByText('Prerna Bhanudas Atre')).toBeVisible({
    timeout: 30_000,
  });
  await audienceTable
    .locator('tbody tr')
    .filter({ hasText: 'Prerna Bhanudas Atre' })
    .first()
    .getByRole('checkbox')
    .check();

  const draftResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.toLowerCase() === '/api/notifications' &&
      response.request().method() === 'POST',
    { timeout: 45_000 }
  );
  await page.getByRole('button', { name: /Save & Next/i }).click();
  const draftResponse = await draftResponsePromise;
  await expectOk(draftResponse, 'Create notification draft from wizard');
  const draft = (await draftResponse.json()) as CommunicationCampaign;
  report.workflow.campaignId = draft.id;

  await expect(page.getByText(/Select Channels/i)).toBeVisible({ timeout: 30_000 });
  await page.getByRole('checkbox', { name: /^Email$/i }).check();

  const channelsResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.toLowerCase() ===
        `/api/notifications/${draft.id}/channels`.toLowerCase() &&
      response.request().method() === 'PUT',
    { timeout: 45_000 }
  );
  await page.getByRole('button', { name: /Save & Next/i }).click();
  const channelsResponse = await channelsResponsePromise;
  await expectOk(channelsResponse, 'Choose Email channel from wizard');

  await expect(page.getByRole('heading', { name: /^Compose Message$/i })).toBeVisible({
    timeout: 30_000,
  });
  await fillStableInput(page, page.getByLabel('Subject *'), subject, 'notification subject');
  await page.getByTestId('importance-level-select').click();
  await page.getByRole('option', { name: /^Normal$/i }).click();

  const editor = page.locator('.ProseMirror').last();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await editor.fill(message);
  await page.waitForTimeout(500);

  const publishResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.toLowerCase() ===
        `/api/notifications/${draft.id}/message`.toLowerCase() &&
      response.request().method() === 'PUT',
    { timeout: 45_000 }
  );
  await page.getByRole('button', { name: /^Submit$/i }).focus();
  await page.keyboard.press('Enter');
  const publishResponse = await publishResponsePromise;
  await expectOk(publishResponse, 'Publish notification from wizard');

  const published = (await publishResponse.json()) as CommunicationCampaign;
  report.workflow.campaignStatus = published.status;
  return published;
}

async function waitForDeliveryAttempts(page: Page, campaignId: string) {
  const started = Date.now();
  let lastCount = 0;

  while (Date.now() - started < 30_000) {
    const body = await getJson<PagedResult<DeliveryAttempt>>(
      page,
      `/communication/delivery-attempts?campaignId=${campaignId}&maxResultCount=20`
    );
    const attempts = pagedItems(body);
    lastCount = attempts.length;
    if (attempts.length > 0) return attempts;
    await page.waitForTimeout(1_000);
  }

  throw new Error(
    `No delivery attempts were created for campaign ${campaignId}. Last count: ${lastCount}`
  );
}

async function verifyDeliveryHistoryAndUsage(page: Page, report: QaReport, campaignId: string) {
  const attempts = await waitForDeliveryAttempts(page, campaignId);
  const emailAttempt = attempts.find(
    (attempt) => attempt.channel === CommunicationChannelType.Email
  );

  expect(emailAttempt, `Email delivery attempt expected for campaign ${campaignId}`).toBeTruthy();
  expect(emailAttempt?.providerMessageId || '', 'queue-only provider message id').toMatch(
    /^queued:/
  );
  expect(emailAttempt?.estimatedCost ?? 0, 'queue-only estimated cost').toBe(0);

  report.workflow.deliveryAttemptId = emailAttempt?.id;
  report.workflow.providerMessageId = emailAttempt?.providerMessageId ?? null;

  const usageBody = await getJson<PagedResult<UsageLedgerEntry>>(
    page,
    `/communication/usage-ledger?campaignId=${campaignId}&maxResultCount=20`
  );
  const usageAttemptCount = pagedItems(usageBody).reduce(
    (sum, entry) => sum + (entry.attemptCount || 0),
    0
  );
  expect(usageAttemptCount, 'usage ledger should record provider attempts').toBeGreaterThan(0);
  report.workflow.usageAttemptCount = usageAttemptCount;

  await page.goto('/communication/notification-history', {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await searchTableForText(page, 'announcement-data-table', campaignId.slice(0, 8));

  return emailAttempt as DeliveryAttempt;
}

async function captureReply(page: Page, runId: string, attempt: DeliveryAttempt, report: QaReport) {
  const reply = await postJson<CommunicationReply>(page, '/communication/replies', {
    campaignId: attempt.campaignId,
    deliveryAttemptId: attempt.id,
    recipientSnapshotId: attempt.recipientSnapshotId,
    channel: attempt.channel,
    fromAddress: attempt.destination,
    body: `E2E reply ${runId}`,
  });

  report.workflow.replyId = reply.id;
  return reply;
}

async function assignReplyFromInbox(page: Page, reply: CommunicationReply, report: QaReport) {
  const assignedDepartment = 'Admin Office';
  const internalNotes = `Assigned by Communication QA ${report.runId}`;

  await page.goto('/communication/messages', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await searchTableForText(page, 'communication-replies-table', reply.body);

  const row = page
    .getByTestId('communication-replies-table')
    .locator(`tr[data-row-id="${reply.id}"]`)
    .first();
  await expect(row, 'captured reply row should be visible').toBeVisible({ timeout: 30_000 });
  await row.getByTestId('table-action-edit').click();

  const dialog = page.getByRole('dialog').filter({ hasText: 'Assign Reply' });
  await expect(dialog).toBeVisible({ timeout: 30_000 });
  await dialog.getByLabel('Department').fill(assignedDepartment);
  await dialog.getByLabel('Internal Notes').fill(internalNotes);
  await dialog.getByRole('button', { name: /^Save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });

  const assigned = await expect
    .poll(
      async () => {
        const repliesBody = await getJson<PagedResult<CommunicationReply>>(
          page,
          `/communication/replies?campaignId=${reply.campaignId}&maxResultCount=20`
        );
        return pagedItems(repliesBody).find((item) => item.id === reply.id);
      },
      { timeout: 30_000 }
    )
    .toMatchObject({
      assignedDepartment,
      status: CommunicationReplyStatus.Assigned,
      internalNotes,
    })
    .then(() => true)
    .catch(() => false);

  expect(assigned, 'reply assignment should persist through the Communication API').toBe(true);
  report.workflow.assignedDepartment = assignedDepartment;
}

test.describe('Communication authenticated QA sign-off', () => {
  test.skip(
    !communicationQaEnabled,
    'Set E2E_COMMUNICATION_QA=1 to run Communication authenticated QA sign-off.'
  );

  test('smokes authenticated screens and verifies queue-only send/history/inbox workflow', async ({
    page,
  }, testInfo) => {
    test.setTimeout(600_000);

    const runId = Date.now().toString(36);
    const report = buildReport(runId);
    const runtimeGuards = attachRuntimeGuards(page);
    let provider: ChannelProviderSetting | undefined;
    let previousEmailDefaults: ChannelProviderSetting[] = [];
    let templateRecord: CommunicationTemplate | undefined;
    let unexpectedError: unknown;

    try {
      assertLocalDdvsOnly();

      await page.goto('/dashboard/', { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await expect(page, 'dashboard should stay authenticated').not.toHaveURL(/\/login|\/auth/i, {
        timeout: 30_000,
      });

      const academicContext = await resolveAcademicContext(page);
      report.academicContext = {
        academicYearId: academicContext.academicYear.id,
        academicYearName: academicContext.academicYear.name,
        academicMediumId: academicContext.currentMedium.id,
        academicMediumName: academicContext.currentMedium.name,
      };
      await primeAcademicSelection(page, academicContext);

      const { provider: setupProvider, previousEmailDefaults: setupPreviousEmailDefaults } =
        await createQueueOnlyEmailProvider(page, runId, report);
      provider = setupProvider;
      previousEmailDefaults = setupPreviousEmailDefaults;
      templateRecord = await createApprovedTemplate(
        page,
        runId,
        academicContext.currentMedium.id,
        report
      );

      await routeChecks.reduce(async (previous, route) => {
        await previous;
        await assertRouteLoads(page, report, route);
      }, Promise.resolve());

      await verifySetupScreens(page, provider, templateRecord);
      const published = await runSendNotificationWizard(page, runId, report);
      const deliveryAttempt = await verifyDeliveryHistoryAndUsage(page, report, published.id);
      const reply = await captureReply(page, runId, deliveryAttempt, report);
      await assignReplyFromInbox(page, reply, report);
    } catch (error) {
      unexpectedError = error;
      addFailure(report, 'unexpected-error', errorMessage(error));
    } finally {
      await cleanupSetupRecords(page, report, provider, previousEmailDefaults, templateRecord);
      runtimeGuards.appendToReport(report);
      await attachReport(testInfo, report);
    }

    if (unexpectedError) {
      throw unexpectedError instanceof Error
        ? unexpectedError
        : new Error(errorMessage(unexpectedError));
    }

    expect(runtimeGuards.failures, runtimeGuards.failures.join('\n')).toEqual([]);
    expect(report.failures, JSON.stringify(report.failures, null, 2)).toEqual([]);
  });
});
