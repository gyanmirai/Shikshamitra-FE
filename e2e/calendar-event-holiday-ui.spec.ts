import { test, expect, type Page, type APIResponse } from '@playwright/test';

import { employeeApiRequest } from './hr/employee/employee-api';

type AcademicYear = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
};

type CalendarType = {
  id: string;
  name: string;
  color?: string;
};

type EmployeeListItem = {
  id: string;
  employeeIdentifier?: string;
  employeeCode?: string;
  status?: number;
};

const json = async <T>(response: APIResponse, label: string): Promise<T> => {
  const text = await response.text();
  if (!response.ok()) {
    throw new Error(`${label} failed: ${response.status()} ${text}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
};

const api = async <T>(page: Page, path: string, init: RequestInit = {}, label = path) =>
  json<T>(await employeeApiRequest(page, path, init), label);

const randomLetters = () =>
  Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join(
    ''
  );

const titleCase = (value: string) =>
  value
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');

const isMeetingEventTypeName = (name?: string) => {
  const normalized = name?.trim().toLowerCase();
  return normalized === 'meeting' || normalized === 'meeting event';
};

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const formatDateTime = (date: Date, hour = 10, minute = 0) =>
  `${formatDate(date)} ${pad(hour)}:${pad(minute)}`;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getInYearDate = (academicYear: AcademicYear, offsetDays = 14) => {
  const start = academicYear.startDate ? new Date(academicYear.startDate) : new Date();
  const end = academicYear.endDate ? new Date(academicYear.endDate) : addDays(start, 180);
  const fromNow = addDays(new Date(), offsetDays);
  let candidate = new Date(Math.max(start.getTime() + 86_400_000, fromNow.getTime()));

  if (candidate > end) {
    candidate = addDays(start, Math.min(offsetDays, 30));
  }
  if (candidate > end) {
    candidate = start;
  }

  return candidate;
};

const getAcademicYear = async (page: Page) => {
  const years = await api<{ items: AcademicYear[] }>(
    page,
    '/app/academic-year?Sorting=name',
    {},
    'academic year list'
  );
  const now = Date.now();
  const current =
    years.items.find((year) => {
      const start = year.startDate ? new Date(year.startDate).getTime() : 0;
      const end = year.endDate ? new Date(year.endDate).getTime() : 0;
      return start <= now && now <= end;
    }) || years.items.find((year) => year.name.includes(String(new Date().getFullYear())));

  if (!current?.id) {
    throw new Error('No academic year is available for Calendar Event/Holiday UI E2E.');
  }

  return current;
};

const getOrCreateNonMeetingEventType = async (page: Page) => {
  const existing = await api<{ items: CalendarType[] }>(
    page,
    '/calendar/event-types',
    {},
    'event type list'
  );
  const nonMeeting = existing.items.find((item) => !isMeetingEventTypeName(item.name));
  if (nonMeeting?.id) {
    return nonMeeting;
  }

  return api<CalendarType>(
    page,
    '/calendar/event-types',
    {
      method: 'POST',
      body: JSON.stringify({
        name: titleCase(`Ui Event Type ${randomLetters()}`),
        color: '#16A34A',
        description: 'Created by Playwright calendar UI E2E',
      }),
    },
    'create non-meeting event type'
  );
};

const getOrCreateHolidayType = async (page: Page) => {
  const existing = await api<{ items: CalendarType[] }>(
    page,
    '/calendar/holiday-types',
    {},
    'holiday type list'
  );
  if (existing.items[0]?.id) {
    return existing.items[0];
  }

  return api<CalendarType>(
    page,
    '/calendar/holiday-types',
    {
      method: 'POST',
      body: JSON.stringify({
        name: titleCase(`Ui Holiday Type ${randomLetters()}`),
        color: '#DC2626',
        description: 'Created by Playwright calendar UI E2E',
      }),
    },
    'create holiday type'
  );
};

const createAudienceGroup = async (page: Page, academicYearId: string) => {
  const employees = await api<{ items: EmployeeListItem[] }>(
    page,
    '/employees?page=1&pageSize=25',
    {},
    'employee list for calendar audience group'
  );
  const employee = employees.items.find(
    (item) => item.status === 0 && (item.employeeIdentifier || item.employeeCode)
  );
  if (!employee) {
    throw new Error('At least one active employee is required for Calendar UI E2E.');
  }

  const selection = await api<{ items: any[] }>(
    page,
    '/groups/users-for-selection',
    {
      method: 'POST',
      body: JSON.stringify({
        academicYearId,
        skipCount: 0,
        maxResultCount: 10,
        searchTerm: employee.employeeIdentifier || employee.employeeCode,
        divisionFilters: [],
        roleFilters: [],
        studentFilters: [],
        employeeFilters: [],
      }),
    },
    'users-for-selection for UI audience group'
  );
  const selectedEmployee = selection.items.find(
    (item) => item.memberType === 1 && item.memberId === employee.id
  );
  if (!selectedEmployee) {
    throw new Error('Active employee was not returned by group users-for-selection.');
  }

  const groupName = titleCase(`Calendar Ui Audience ${randomLetters()}`);
  return api<{ id: string; name: string }>(
    page,
    `/groups?academicYearId=${academicYearId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: groupName,
        description: 'Calendar UI E2E audience group',
        ruleBased: {
          boardIds: [],
          mediumIds: [],
          classIds: [],
          divisionIds: [],
          roleIds: [],
          studentFilters: [],
          employeeFilters: [],
        },
        nameBased: {
          divisionIds: [],
          roleIds: [],
          studentFilters: [],
          employeeFilters: [],
          selectedMembers: [
            {
              memberType: 1,
              memberId: selectedEmployee.memberId,
              userId: null,
            },
          ],
        },
      }),
    },
    'create UI audience group'
  );
};

const selectMuiOption = async (page: Page, testId: string, optionText: string) => {
  await page.getByTestId(testId).getByRole('combobox').click();
  await page.getByRole('option', { name: optionText }).click();
};

const selectAutocompleteOption = async (page: Page, testId: string, optionText: string) => {
  const input = page.getByTestId(testId).locator('input');
  await input.click();
  await input.fill(optionText);
  await page.getByRole('option', { name: optionText }).click();
  await page.keyboard.press('Escape');
};

const fillPickerInput = async (page: Page, testId: string, value: string) => {
  const field = page.getByTestId(testId);
  const [datePart, timePart] = value.split(' ');
  const [day, month, year] = datePart.split('/');

  await field.getByRole('spinbutton', { name: 'Day' }).fill(day);
  await field.getByRole('spinbutton', { name: 'Month' }).fill(month);
  await field.getByRole('spinbutton', { name: 'Year' }).fill(year);

  if (timePart) {
    const [hours, minutes] = timePart.split(':');
    await field.getByRole('spinbutton', { name: 'Hours' }).fill(hours);
    await field.getByRole('spinbutton', { name: 'Minutes' }).fill(minutes);
  }

  await page.keyboard.press('Tab');
};

const findEventByTitle = async (page: Page, academicYearId: string, title: string) => {
  const events = await api<{ items: Array<{ id: string; title: string; audienceIds: string[] }> }>(
    page,
    `/calendar/events?academicYearId=${academicYearId}&maxResultCount=500`,
    {},
    'event list after UI submit'
  );
  return events.items.find((event) => event.title === title);
};

const findHolidayByName = async (page: Page, academicYearId: string, holidayName: string) => {
  const holidays = await api<{
    items: Array<{ id: string; holidayName: string; audienceIds: string[] }>;
  }>(
    page,
    `/calendar/holidays?academicYearId=${academicYearId}&maxResultCount=500`,
    {},
    'holiday list after UI submit'
  );
  return holidays.items.find((holiday) => holiday.holidayName === holidayName);
};

const deleteQuietly = async (page: Page, path: string) => {
  try {
    await employeeApiRequest(page, path, { method: 'DELETE' });
  } catch {
    // Best-effort cleanup only.
  }
};

test.describe('Calendar event and holiday UI', () => {
  test.setTimeout(420_000);

  test('creates event and holiday audiences through the UI', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    const academicYear = await getAcademicYear(page);
    const eventType = await getOrCreateNonMeetingEventType(page);
    const holidayType = await getOrCreateHolidayType(page);
    const audienceGroup = await createAudienceGroup(page, academicYear.id);
    const eventTitle = titleCase(`Calendar Ui Event ${randomLetters()}`);
    const holidayName = titleCase(`Calendar Ui Holiday ${randomLetters()}`);
    const eventDate = getInYearDate(academicYear, 21);
    const holidayDate = getInYearDate(academicYear, 28);
    let createdEventId: string | undefined;
    let createdHolidayId: string | undefined;

    try {
      await page.goto('/calendar/events', { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await expect(page.getByRole('heading', { name: /Events/i })).toBeVisible({
        timeout: 60_000,
      });
      await page.getByRole('button', { name: /^Event$/i }).click();
      await expect(page.getByRole('heading', { name: /Add Event/i })).toBeVisible({
        timeout: 30_000,
      });

      await selectAutocompleteOption(page, 'calendar-event-audience-select', audienceGroup.name);
      await fillPickerInput(page, 'calendar-event-end-datetime', formatDateTime(eventDate, 11));
      await page.getByLabel('Venue *').fill('Ui Room');
      await page.getByLabel('Title *').fill(eventTitle);
      await selectMuiOption(page, 'calendar-event-type-select', eventType.name);
      await page.getByTestId('calendar-event-submit-button').click();

      await expect
        .poll(
          async () => {
            const event = await findEventByTitle(page, academicYear.id, eventTitle);
            createdEventId = event?.id;
            return event?.audienceIds.includes(audienceGroup.id) ?? false;
          },
          { timeout: 60_000 }
        )
        .toBe(true);

      await expect(page.getByRole('heading', { name: /Events/i })).toBeVisible({
        timeout: 30_000,
      });
      await page.getByPlaceholder('Search...').first().fill(eventTitle);
      await expect(
        page.getByTestId('calendar-event-row').filter({ hasText: eventTitle })
      ).toBeVisible({
        timeout: 30_000,
      });

      await page.goto('/calendar/holidays', { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await expect(page.getByRole('heading', { name: /Holidays/i })).toBeVisible({
        timeout: 60_000,
      });
      await page.getByRole('button', { name: /^Holiday$/i }).click();
      await expect(page.getByRole('heading', { name: /Add Holiday/i })).toBeVisible({
        timeout: 30_000,
      });

      await page.getByLabel('Holiday Name *').fill(holidayName);
      await selectMuiOption(page, 'calendar-holiday-type-select', holidayType.name);
      await fillPickerInput(page, 'calendar-holiday-start-date', formatDate(holidayDate));
      await fillPickerInput(page, 'calendar-holiday-end-date', formatDate(holidayDate));
      await selectAutocompleteOption(page, 'calendar-holiday-audience-select', audienceGroup.name);
      await page.getByTestId('calendar-holiday-submit-button').click();

      await expect
        .poll(
          async () => {
            const holiday = await findHolidayByName(page, academicYear.id, holidayName);
            createdHolidayId = holiday?.id;
            return holiday?.audienceIds.includes(audienceGroup.id) ?? false;
          },
          { timeout: 60_000 }
        )
        .toBe(true);

      await expect(page.getByRole('heading', { name: /Holidays/i })).toBeVisible({
        timeout: 30_000,
      });
      await page.getByPlaceholder('Search...').first().fill(holidayName);
      await expect(
        page.getByTestId('calendar-holiday-row').filter({ hasText: holidayName })
      ).toBeVisible({ timeout: 30_000 });
    } finally {
      if (createdEventId) {
        await deleteQuietly(page, `/calendar/events/${createdEventId}`);
      }
      if (createdHolidayId) {
        await deleteQuietly(page, `/calendar/holidays/${createdHolidayId}`);
      }
      await deleteQuietly(page, `/groups/${audienceGroup.id}`);
    }
  });
});
