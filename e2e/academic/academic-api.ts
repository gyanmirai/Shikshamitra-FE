import { expect, type Page, type APIResponse } from '@playwright/test';

export type AcademicYear = {
  id: string;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type AcademicContext = {
  academicYear: AcademicYear;
  currentBoard: {
    id: string | undefined;
    name: string | undefined;
  };
  currentMedium: {
    id: string;
    name: string;
    educationMediumStages: Array<{
      id: string;
      name: string;
      divisions: any[];
    }>;
  };
};

const tenant = () => process.env.E2E_TENANT || 'DDVS';

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }
  return url.replace(/\/$/, '');
};

export async function getAccessToken(page: Page): Promise<string> {
  if (page.url() === 'about:blank') {
    await page.goto('/academic/dashboard', { waitUntil: 'domcontentloaded', timeout: 90000 });
  }

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

export async function academicApiRequest(
  page: Page,
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<APIResponse> {
  const token = await getAccessToken(page);
  const { body, ...requestInit } = init;
  const requestHeaders =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : init.headers || {};

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(body ? { data: body } : {}),
    headers: {
      accept: 'application/json',
      __tenant: tenant(),
      Authorization: `Bearer ${token}`,
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...requestHeaders,
    },
  });
}

export async function getAcademicJson<T = any>(page: Page, path: string): Promise<T> {
  const response = await academicApiRequest(page, path);
  expect(response.ok(), `GET ${path} failed with ${response.status()}`).toBe(true);
  return response.json();
}

function pagedItems<T>(body: any): T[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  return [];
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

export async function resolveAcademicContext(page: Page): Promise<AcademicContext> {
  const yearsBody = await getAcademicJson(page, '/app/academic-year?Sorting=name');
  const years = pagedItems<any>(yearsBody)
    .map(toAcademicYear)
    .filter((year) => year?.id);
  const academicYear = currentAcademicYear(years);

  if (!academicYear?.id) {
    throw new Error('Seeded academic year is required.');
  }

  const yearsToProbe = [
    academicYear,
    ...years.filter((year) => year.id.toLowerCase() !== academicYear.id.toLowerCase()),
  ];
  let selectedYear = academicYear;
  let options: any[] = [];
  let firstMedium: any;
  let mediumId: string | undefined;

  for (const candidateYear of yearsToProbe) {
    const optionsBody = await getAcademicJson(
      page,
      `/app/academic-organization-options?academicYearId=${candidateYear.id}`
    );
    const candidateOptions = pagedItems<any>(optionsBody);
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

    if (candidateMediumId) {
      selectedYear = candidateYear;
      options = candidateOptions;
      firstMedium = candidateMedium;
      mediumId = candidateMediumId;
      break;
    }
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
          ) || 'E2E Stage',
        divisions: Array.isArray(item?.divisions) ? item.divisions : [],
      };
    })
    .filter((stage, index, all) => all.findIndex((item) => item.id === stage.id) === index);

  return {
    academicYear: selectedYear,
    currentBoard: {
      id: optionValue(firstMedium, 'boardId', 'educationBoardId', 'board.id') || '',
      name: optionValue(firstMedium, 'boardName', 'educationBoardName', 'board.name') || '',
    },
    currentMedium: {
      id: mediumId,
      name:
        optionValue(firstMedium, 'mediumName', 'academicMediumName', 'medium.name') || 'E2E Medium',
      educationMediumStages:
        stages.length > 0
          ? stages
          : [{ id: `${mediumId}-stage`, name: 'E2E Stage', divisions: [] }],
    },
  };
}

export async function primeAcademicSelection(page: Page, context: AcademicContext) {
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
