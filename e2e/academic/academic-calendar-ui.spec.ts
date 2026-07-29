/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type Page } from '@playwright/test';

import { primeAcademicSelection, resolveAcademicContext, type AcademicContext } from './academic-api';

const CALENDAR_STATUS = {
  draft: 1,
  published: 2,
} as const;

const DAY_TYPE = {
  event: 5,
} as const;

const baseUrl = () =>
  process.env.E2E_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function attachCases(...ids: string[]) {
  test.info().annotations.push({ type: 'case', description: ids.join(', ') });
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isoDateTime(date: Date) {
  return `${isoDate(date)}T00:00:00+05:30`;
}

function nextWeekday(start: Date, offsetDays: number) {
  let candidate = addDays(start, offsetDays);
  while (candidate.getUTCDay() === 0 || candidate.getUTCDay() === 6) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

function calendarStart(context: AcademicContext) {
  const startDate = context.academicYear.startDate?.slice(0, 10);
  return new Date(`${startDate || new Date().toISOString().slice(0, 10)}T12:00:00Z`);
}

async function selectDayType(page: Page, optionName: RegExp) {
  await page.getByRole('dialog').locator('.MuiSelect-select').first().click();
  await page.getByRole('option', { name: optionName }).click();
}

async function openMarkerDialog(page: Page, markerDate: Date) {
  await page.getByRole('tab', { name: /Month View/i }).click();
  await page.getByTestId(`academic-calendar-month-day-${isoDate(markerDate)}`).click();
  await expect(page.getByRole('dialog')).toContainText(/Add Marker/i);
}

async function mockCalendarManagementApis(
  page: Page,
  context: AcademicContext,
  options?: { status?: number }
) {
  const start = calendarStart(context);
  const markerDate = nextWeekday(start, 7);
  const calendar = {
    id: 'ui-calendar-1',
    academicYearId: context.academicYear.id,
    name: 'UI Test Academic Calendar',
    description: 'Mocked calendar for Playwright UI form coverage',
    startDate: isoDateTime(start),
    endDate: isoDateTime(addDays(start, 45)),
    status: options?.status ?? CALENDAR_STATUS.draft,
    isDefault: true,
    totalWorkingDays: 32,
    totalHolidays: 0,
  };
  const createdDayBodies: any[] = [];

  await page.route('**/api/academic/calendars**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();

    if (url.pathname.endsWith('/api/academic/calendars') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [calendar], totalCount: 1 }),
      });
      return;
    }

    if (url.pathname.endsWith(`/api/academic/calendars/${calendar.id}/days`) && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
      return;
    }

    if (url.pathname.endsWith(`/api/academic/calendars/${calendar.id}/days`) && method === 'POST') {
      const body = request.postDataJSON();
      createdDayBodies.push(body);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: `ui-day-${createdDayBodies.length}`, ...body }),
      });
      return;
    }

    await route.continue();
  });

  return { calendar, markerDate, createdDayBodies };
}

test.describe(
  'Academic Calendar UI form checks',
  { tag: ['@module-academic', '@submodule-academic-calendar', '@ui', '@form'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test.beforeEach(async ({ page }) => {
      const context = await resolveAcademicContext(page);
      await primeAcademicSelection(page, context);
    });

    test('AC-CAL-029 calendar management screen renders and switches to month view', async ({
      page,
    }) => {
      attachCases('AC-CAL-029');
      const context = await resolveAcademicContext(page);
      const { markerDate } = await mockCalendarManagementApis(page, context);

      await page.goto(`${baseUrl()}/academic/calendarManagement`, {
        waitUntil: 'domcontentloaded',
      });

      await expect(page.getByRole('heading', { name: /Calendar Management/i })).toBeVisible();
      await expect(page.getByText('UI Test Academic Calendar')).toBeVisible();
      await page.getByRole('tab', { name: /Month View/i }).click();
      await expect(page.getByTestId(`academic-calendar-month-day-${isoDate(markerDate)}`)).toBeVisible();
    });

    test('AC-CAL-030 day marker form shows required-field validation', async ({ page }) => {
      attachCases('AC-CAL-030');
      const context = await resolveAcademicContext(page);
      const { markerDate } = await mockCalendarManagementApis(page, context);

      await page.goto(`${baseUrl()}/academic/calendarManagement`, {
        waitUntil: 'domcontentloaded',
      });
      await openMarkerDialog(page, markerDate);
      await page.getByRole('button', { name: /Add Day/i }).click();

      await expect(page.getByText('Day Type is required')).toBeVisible();
      await expect(page.getByText('Title is required')).toBeVisible();
    });

    test('AC-CAL-031 day marker form exposes conditional fields by marker type and scope', async ({
      page,
    }) => {
      attachCases('AC-CAL-031');
      const context = await resolveAcademicContext(page);
      const { markerDate } = await mockCalendarManagementApis(page, context);

      await page.goto(`${baseUrl()}/academic/calendarManagement`, {
        waitUntil: 'domcontentloaded',
      });
      await openMarkerDialog(page, markerDate);

      await selectDayType(page, /^Holiday$/i);
      await expect(page.getByRole('dialog').locator('label', { hasText: 'Holiday Category *' })).toBeVisible();

      await selectDayType(page, /^Vacation$/i);
      await expect(page.getByRole('dialog').locator('label', { hasText: 'End Date *' })).toBeVisible();

      await selectDayType(page, /^Half Day$/i);
      await expect(page.getByRole('dialog').locator('label', { hasText: 'Start Time *' })).toBeVisible();
      await expect(page.getByRole('dialog').locator('label', { hasText: 'End Time *' })).toBeVisible();

      await page.getByRole('switch', { name: /Applies to all classes/i }).click();
      await expect(page.getByRole('dialog').locator('label', { hasText: 'Class *' })).toBeVisible();
    });

    test('AC-CAL-032 day marker form submits a valid event payload', async ({ page }) => {
      attachCases('AC-CAL-032');
      const context = await resolveAcademicContext(page);
      const { markerDate, createdDayBodies } = await mockCalendarManagementApis(page, context);
      const title = `UI event ${Date.now()}`;

      await page.goto(`${baseUrl()}/academic/calendarManagement`, {
        waitUntil: 'domcontentloaded',
      });
      await openMarkerDialog(page, markerDate);
      await selectDayType(page, /^Event$/i);
      await page.getByLabel(/Title/i).fill(title);
      await page.getByLabel(/Description/i).fill('Created by mocked Academic Calendar UI test');
      await page.getByRole('button', { name: /Add Day/i }).click();

      await expect.poll(() => createdDayBodies.length).toBe(1);
      expect(createdDayBodies[0]).toMatchObject({
        title,
        dayType: DAY_TYPE.event,
        appliesToAll: true,
      });
    });

    test('AC-CAL-033 published calendar day changes require a change reason', async ({ page }) => {
      attachCases('AC-CAL-033');
      const context = await resolveAcademicContext(page);
      const { markerDate } = await mockCalendarManagementApis(page, context, {
        status: CALENDAR_STATUS.published,
      });

      await page.goto(`${baseUrl()}/academic/calendarManagement`, {
        waitUntil: 'domcontentloaded',
      });
      await openMarkerDialog(page, markerDate);
      await selectDayType(page, /^Event$/i);
      await page.getByLabel(/Title/i).fill('Published calendar marker');
      await page.getByRole('button', { name: /Add Day/i }).click();

      await expect(page.getByText('Change reason is required for published calendar')).toBeVisible();
    });
  }
);
