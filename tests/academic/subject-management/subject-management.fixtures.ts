import { expect, type Page, type TestInfo } from '@playwright/test';

import {
  getAcademicJson,
  academicApiRequest,
  type AcademicContext,
  primeAcademicSelection,
} from '../../../e2e/academic/academic-api';

export type TestSubject = {
  id: string;
  name: string;
  displayName?: string | null;
};

const tenant = () => process.env.E2E_TENANT || 'DDVS';
const password = () => process.env.E2E_PASSWORD || process.env.E2E_ADMIN_PASSWORD || 'Temp@123';
const adminCandidates = () => [
  process.env.E2E_ADMIN_EMAIL || 'admin-ddvs',
  'admin-ddvs@ddvs.com',
].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

export function uniqueName(prefix: string, workerIndex: number) {
  const suffix = `${Date.now()}-${workerIndex}-${Math.random().toString(36).slice(2, 7)}`;
  return `${prefix} ${suffix}`;
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isAuthenticatedAdminProject(testInfo: TestInfo) {
  const {
    project: {
      use: { storageState },
    },
  } = testInfo;
  return (
    typeof storageState === 'string' &&
    storageState.replace(/\\/g, '/').endsWith('playwright/.auth/admin.json')
  );
}

function pagedItems(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

function optionValue(item: any, ...keys: string[]) {
  return keys
    .map((key) => key.split('.').reduce((current, part) => current?.[part], item))
    .find(Boolean);
}

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

function currentAcademicYear(years: any[]) {
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

async function resolveAcademicContextForOption(
  page: Page,
  academicYear: any,
  options: any[],
  optionIndex = 0
): Promise<AcademicContext | undefined> {
  const option = options[optionIndex];
  if (!option) return undefined;

  const mediumId = optionValue(
    option,
    'mediumId',
    'academicMediumId',
    'medium.id',
    'academicMedium.id',
    'id'
  );
  if (!mediumId) {
    return resolveAcademicContextForOption(page, academicYear, options, optionIndex + 1);
  }

  const standardsPayload = await getAcademicJson(
    page,
    `/education-medium/${mediumId}/standards`
  ).catch(() => []);
  const standards = [
    ...collectStandards(option),
    ...collectStandards({ standards: standardsPayload }),
  ];
  if (standards.length === 0) {
    return resolveAcademicContextForOption(page, academicYear, options, optionIndex + 1);
  }

  const stageId =
    optionValue(
      option,
      'educationMediumStageId',
      'mediumStageId',
      'stageId',
      'stage.id',
      'educationMediumStage.id'
    ) || `${mediumId}-stage`;

  return {
    academicYear,
    currentBoard: {
      id: optionValue(option, 'boardId', 'educationBoardId', 'board.id') || '',
      name: optionValue(option, 'boardName', 'educationBoardName', 'board.name') || '',
    },
    currentMedium: {
      id: mediumId,
      name:
        optionValue(option, 'mediumName', 'academicMediumName', 'medium.name') || 'E2E Medium',
      educationMediumStages: [
        {
          id: stageId,
          name:
            optionValue(
              option,
              'educationMediumStageName',
              'mediumStageName',
              'stageName',
              'stage.name',
              'educationMediumStage.name'
            ) || 'E2E Stage',
          standards,
          divisions: [],
        } as any,
      ],
    },
  };
}

async function resolveAcademicContextForYear(
  page: Page,
  yearsToProbe: any[],
  yearIndex = 0
): Promise<AcademicContext | undefined> {
  const academicYear = yearsToProbe[yearIndex];
  if (!academicYear) return undefined;

  const options = pagedItems(
    await getAcademicJson(
      page,
      `/app/academic-organization-options?academicYearId=${academicYear.id}`
    )
  );
  const context = await resolveAcademicContextForOption(page, academicYear, options);
  return context || resolveAcademicContextForYear(page, yearsToProbe, yearIndex + 1);
}

async function resolveAcademicContextWithStandards(page: Page): Promise<AcademicContext> {
  const years = pagedItems(await getAcademicJson(page, '/app/academic-year?Sorting=name'))
    .map((item) => item?.academicYear || item)
    .filter((year) => year?.id);
  const selectedYear = currentAcademicYear(years);

  if (!selectedYear?.id) {
    throw new Error('Seeded academic year is required for subject-management E2E.');
  }

  const yearsToProbe = [
    selectedYear,
    ...years.filter((year) => year.id.toLowerCase() !== selectedYear.id.toLowerCase()),
  ];

  const context = await resolveAcademicContextForYear(page, yearsToProbe);
  if (context) return context;

  throw new Error('Seeded academic medium with standards is required for subject-management E2E.');
}

async function sessionHasToken(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return false;
    const session = await response.json();
    return Boolean(session?.accessToken);
  });
}

async function loginWithCandidate(page: Page, email: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('textbox', { name: 'School Code' })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole('textbox', { name: 'School Code' }).fill(tenant());
  await page.getByRole('textbox', { name: 'Email / Username' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password());
  await page.getByRole('button', { name: /Sign In/i }).click();
  await expect.poll(() => sessionHasToken(page), {
    message: `expected ${email} to authenticate`,
    timeout: 60_000,
  }).toBe(true);
}

export async function ensureAcademicAdmin(page: Page) {
  await page.goto('/academic/dashboard/', { waitUntil: 'domcontentloaded' });
  if (!(await sessionHasToken(page).catch(() => false))) {
    const loginResult = await adminCandidates().reduce<Promise<{ lastError?: unknown }>>(
      async (previousAttempt, candidate) => {
        const previous = await previousAttempt;
        if (await sessionHasToken(page).catch(() => false)) return previous;

        try {
          await loginWithCandidate(page, candidate);
          return previous;
        } catch (error) {
          return { lastError: error };
        }
      },
      Promise.resolve({})
    );
    if (!(await sessionHasToken(page).catch(() => false))) {
      throw loginResult.lastError instanceof Error
        ? loginResult.lastError
        : new Error('Unable to authenticate admin.');
    }
  }

  const context = await resolveAcademicContextWithStandards(page);
  await primeAcademicSelection(page, context);
  return context;
}

export async function openAcademicCurriculumMenuPage(
  page: Page,
  linkName: string,
  expectedText: string | RegExp,
  options: { settings?: boolean } = {}
) {
  await page.goto('/academic/dashboard/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText('Curriculum', { timeout: 30_000 });

  const targetLink = page.getByRole('link', { name: new RegExp(`^${escapeRegExp(linkName)}$`) });
  if (!(await targetLink.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /^Curriculum$/ }).click();
  }

  if (options.settings) {
    if (!(await targetLink.isVisible().catch(() => false))) {
      await page.getByRole('button', { name: /^Settings$/ }).last().click();
    }
  }

  await targetLink.click();
  await expect(page).not.toHaveURL(/\/login(?:\/|\?|$)/i);
  await expect(page.locator('body')).toContainText(expectedText, { timeout: 30_000 });
}

export async function openSubjectCreation(page: Page) {
  await openAcademicCurriculumMenuPage(page, 'Subjects Creation', 'Subject Creation', {
    settings: true,
  });
}

export async function openSubjectAllocation(page: Page) {
  await openAcademicCurriculumMenuPage(page, 'Subject Allocation', 'Subject Allocation');
}

export async function currentClassIdFromAllocationPage(page: Page) {
  await openSubjectAllocation(page);
  const classInput = page.locator('input[name="class"]').first();
  await expect(classInput).toHaveValue(/.+/);
  return classInput.inputValue();
}

export async function createSubjectByApi(page: Page, academicMediumId: string, name: string) {
  const response = await academicApiRequest(page, `/academic-mediums/${academicMediumId}/subjects`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      displayName: name,
      category: 'General',
      color: '#00B96B',
      icon: 'book',
      description: 'Created by Playwright subject-management coverage.',
      status: 0,
      sortOrder: null,
      educationMediumId: academicMediumId,
    }),
  });
  expect(response.ok(), `create subject ${name} failed with ${response.status()}`).toBe(true);
  const subject = await response.json();
  return {
    id: subject.id || subject.data?.id,
    name: subject.name || subject.data?.name || name,
    displayName: subject.displayName || subject.data?.displayName,
  } satisfies TestSubject;
}

export async function deleteSubjectByApi(page: Page, academicMediumId: string, subjectId?: string) {
  if (!subjectId) return undefined;
  const response = await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/subjects/${subjectId}`,
    { method: 'DELETE' }
  );
  return response.status();
}

export async function archiveSubjectByApi(page: Page, academicMediumId: string, subjectId?: string) {
  if (!subjectId) return undefined;
  const response = await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/subjects/${subjectId}/archive`,
    {
      method: 'POST',
      body: JSON.stringify({ reason: 'Playwright cleanup' }),
    }
  );
  return response.status();
}

export async function cleanupSubjectByApi(
  page: Page,
  academicMediumId: string,
  subject?: TestSubject
) {
  if (!subject?.id) return;
  const deleteStatus = await deleteSubjectByApi(page, academicMediumId, subject.id);
  if ([200, 204, 404].includes(deleteStatus ?? 0)) return;

  const usageResponse = await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/subjects/${subject.id}/usage`
  );
  if (usageResponse.status() !== 404) {
    await archiveSubjectByApi(page, academicMediumId, subject.id);
  }
}

export async function findAssignmentForSubject(page: Page, classId: string, subjectId: string) {
  const response = await academicApiRequest(
    page,
    `/academics/curriculum/${classId}/subject-assignments?page=0&pageSize=100&includeArchived=true`
  );
  if (!response.ok()) return undefined;
  const body = await response.json();
  const items = body?.data?.items || body?.items || [];
  return items.find((item: any) =>
    item?.subjects?.some((subject: any) => subject.subjectId === subjectId)
  );
}

export async function cleanupAssignmentByApi(page: Page, assignmentId?: string) {
  if (!assignmentId) return;
  const response = await academicApiRequest(
    page,
    `/academics/curriculum/subject-assignments/${assignmentId}`,
    { method: 'DELETE' }
  );
  if ([200, 204, 404].includes(response.status())) return;

  const archiveResponse = await academicApiRequest(
    page,
    `/academics/curriculum/subject-assignments/${assignmentId}/archive`,
    { method: 'POST' }
  );
  expect([200, 400, 404, 409, 500]).toContain(archiveResponse.status());
}

export async function selectFirstSubjectColor(page: Page) {
  const colorLabel = page.getByText('Subject Color *', { exact: true }).last();
  await expect(colorLabel).toBeVisible();
  const colorButton = colorLabel.locator('..').locator('..').getByRole('button').first();
  await colorButton.click();
}

type OkResponse = {
  ok(): boolean;
  status(): number;
};

export async function expectOkResponse(response: OkResponse, label: string) {
  expect(response.ok(), `${label} failed with ${response.status()}`).toBe(true);
}
