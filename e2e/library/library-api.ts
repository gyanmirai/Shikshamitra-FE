/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Page, type APIResponse } from '@playwright/test';

const tenant = () => process.env.E2E_TENANT || 'DDVS';

export const libraryE2EEnabled = process.env.E2E_LIBRARY === '1';

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const addDaysIso = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
};

export const uniqueLibraryText = (prefix: string) =>
  `${prefix} ${Date.now()} ${Math.random().toString(16).slice(2, 8)}`;

const apiBaseUrl = () => {
  const url = process.env.E2E_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('Set E2E_API_URL or NEXT_PUBLIC_API_URL to the backend host URL.');
  }
  return url.replace(/\/$/, '');
};

export async function getAccessToken(page: Page) {
  if (page.url() === 'about:blank') {
    await page.goto('/library/dashboard', { waitUntil: 'domcontentloaded', timeout: 90_000 });
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

export async function libraryApiRequest(
  page: Page,
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<APIResponse> {
  const token = await getAccessToken(page);
  const { body, signal, ...requestInit } = init;
  const requestHeaders =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : init.headers || {};

  return page.request.fetch(`${apiBaseUrl()}/api${path}`, {
    ...requestInit,
    ...(signal ? { signal } : {}),
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

export async function expectLibraryOk(response: APIResponse, label: string) {
  const details = response.ok() ? '' : await response.text();
  expect(response.ok(), `${label}: ${response.status()} ${details}`).toBe(true);
}

export async function getLibraryJson(page: Page, path: string) {
  const response = await libraryApiRequest(page, path);
  await expectLibraryOk(response, `GET ${path}`);
  return response.json();
}

export async function postLibraryJson(page: Page, path: string, body: unknown) {
  const response = await libraryApiRequest(page, path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  await expectLibraryOk(response, `POST ${path}`);
  return response.json();
}

export async function putLibraryJson(page: Page, path: string, body: unknown) {
  const response = await libraryApiRequest(page, path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  await expectLibraryOk(response, `PUT ${path}`);
  return response.json();
}

export async function deleteLibraryResource(page: Page, path: string) {
  const response = await libraryApiRequest(page, path, { method: 'DELETE' });
  await expectLibraryOk(response, `DELETE ${path}`);
  return response;
}

export function listItems(body: any) {
  return Array.isArray(body) ? body : body?.items || [];
}

export async function getAcademicYearId(page: Page) {
  if (process.env.E2E_LIBRARY_ACADEMIC_YEAR_ID) {
    return process.env.E2E_LIBRARY_ACADEMIC_YEAR_ID;
  }

  const body = await getLibraryJson(page, '/app/academic-year?Sorting=name');
  const items = listItems(body);
  if (!items.length) {
    throw new Error('Library E2E requires at least one academic year.');
  }

  const today = todayIso();
  const current =
    items.find((item: any) => {
      const start = String(item.startDate || item.fromDate || '').slice(0, 10);
      const end = String(item.endDate || item.toDate || '').slice(0, 10);
      return start && end && start <= today && today <= end;
    }) || items[0];

  if (!current?.id) {
    throw new Error('Academic year response did not include an id.');
  }

  return current.id as string;
}

async function getOrCreateBookCategory(page: Page, academicYearId: string) {
  const listPath = `/library/book-categories?academicYearId=${academicYearId}&page=1&pageSize=100`;
  const existing = listItems(await getLibraryJson(page, listPath)).find((item: any) =>
    String(item.categoryName || item.name || '').startsWith('E2E Release Gate')
  );
  if (existing?.id) return existing;

  const categoryName = uniqueLibraryText('E2E Release Gate Category');
  await postLibraryJson(page, `/library/book-categories?academicYearId=${academicYearId}`, {
    categoryName,
    description: 'Created by Library release-gate E2E.',
  });

  const created = listItems(await getLibraryJson(page, listPath)).find(
    (item: any) => item.categoryName === categoryName || item.name === categoryName
  );
  if (!created?.id) throw new Error('Could not create Library E2E book category.');
  return created;
}

async function getOrCreateChargeCategory(page: Page, academicYearId: string) {
  const listPath = `/library/charge-categories?academicYearId=${academicYearId}&page=1&pageSize=100`;
  const existing = listItems(await getLibraryJson(page, listPath)).find((item: any) =>
    String(item.chargeType || item.name || '').startsWith('E2E Release Gate')
  );
  if (existing?.id) return existing;

  const chargeType = uniqueLibraryText('E2E Release Gate Charge');
  await postLibraryJson(page, `/library/charge-categories?academicYearId=${academicYearId}`, {
    chargeType,
    amount: 25,
    isFixed: true,
    description: 'Created by Library release-gate E2E.',
  });

  const created = listItems(await getLibraryJson(page, listPath)).find(
    (item: any) => item.chargeType === chargeType || item.name === chargeType
  );
  if (!created?.id) throw new Error('Could not create Library E2E charge category.');
  return created;
}

async function getOrCreateSection(page: Page, academicYearId: string) {
  const listPath = `/library/sections?academicYearId=${academicYearId}&page=1&pageSize=100`;
  const existing = listItems(await getLibraryJson(page, listPath)).find(
    (item: any) =>
      String(item.sectionName || '').startsWith('E2E Release Gate') &&
      (item.shelfDetails || []).some((shelf: any) => shelf?.id)
  );
  if (existing?.id) return existing;

  const sectionName = uniqueLibraryText('E2E Release Gate Section');
  await postLibraryJson(page, `/library/sections?academicYearId=${academicYearId}`, {
    sectionName,
    numberOfShelf: 1,
    shelfItems: ['E2E Shelf'],
  });

  const created = listItems(await getLibraryJson(page, listPath)).find(
    (item: any) => item.sectionName === sectionName
  );
  if (!created?.id || !(created.shelfDetails || []).some((shelf: any) => shelf?.id)) {
    throw new Error('Could not create Library E2E section and shelf.');
  }
  return created;
}

export async function ensureLibraryFixture(page: Page) {
  const academicYearId = await getAcademicYearId(page);
  const [bookCategory, chargeCategory, section] = await Promise.all([
    getOrCreateBookCategory(page, academicYearId),
    getOrCreateChargeCategory(page, academicYearId),
    getOrCreateSection(page, academicYearId),
  ]);
  const members = listItems(await getLibraryJson(page, '/library/members?page=1&pageSize=20'));
  const member = members[0];
  if (!member?.id) {
    throw new Error('Library E2E requires at least one seeded active library member.');
  }

  const shelf = section.shelfDetails.find((item: any) => item?.id);
  const accessionOne = `E2E-${Date.now()}-1`;
  const accessionTwo = `E2E-${Date.now()}-2`;
  const title = uniqueLibraryText('E2E Release Gate Book');
  const createdBook = await postLibraryJson(
    page,
    `/library/books?academicYearId=${academicYearId}`,
    {
      title,
      isbn: `E2E-${Date.now()}`,
      author: 'Release Gate',
      publisher: 'ShikshaMitra QA',
      edition: '1',
      subject: 'QA',
      categoryId: bookCategory.id,
      language: 2,
      applicableAge: 'All',
      price: 100,
      pages: 120,
      numberOfCopies: 2,
      copies: [
        {
          copyNumber: 1,
          accessionNumber: accessionOne,
          sectionId: section.id,
          shelfId: shelf.id,
        },
        {
          copyNumber: 2,
          accessionNumber: accessionTwo,
          sectionId: section.id,
          shelfId: shelf.id,
        },
      ],
    }
  );

  return {
    academicYearId,
    bookId: createdBook.id,
    title,
    accessionOne,
    accessionTwo,
    member,
    bookCategory,
    chargeCategory,
    section,
    shelf,
  };
}
