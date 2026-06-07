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

type CalendarViewItem = {
  id: string;
  title: string;
  calendarItemType: number | string;
  typeName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  audienceCount?: number;
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

const unique = (prefix: string) =>
  `${prefix} ${new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14)}`;

const isMeetingEventTypeName = (name?: string) => {
  const normalized = (name || '').trim().toLowerCase();
  return normalized === 'meeting' || normalized === 'meeting event';
};

const routeShouldRender = async (page: Page, path: string, expectedText: RegExp | string) => {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await expect(page.locator('body')).toContainText(expectedText, { timeout: 120_000 });
};

const nextWeekdayIso = (daysFromNow = 14) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().slice(0, 10);
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
    throw new Error('No academic year is available for E2E coverage.');
  }

  return current;
};

const getOrCreateEventType = async (page: Page) => {
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
        name: unique('E2E Event Type'),
        color: '#16A34A',
        description: 'Created by Playwright calendar E2E',
      }),
    },
    'create event type'
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
        name: unique('E2E Holiday Type'),
        color: '#DC2626',
        description: 'Created by Playwright calendar E2E',
      }),
    },
    'create holiday type'
  );
};

test.describe('Calendar group HR audience E2E', () => {
  test.setTimeout(600_000);

  test('creates a HR-backed group and uses it for calendar event and holiday audiences', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 90_000 });

    const academicYear = await getAcademicYear(page);
    const academicYearId = academicYear.id;

    await routeShouldRender(page, '/calendar/dashboard', /Calendar/i);
    await routeShouldRender(page, '/calendar/events', /Events/i);
    await routeShouldRender(page, '/calendar/holidays', /Holidays/i);
    await routeShouldRender(page, '/calendar/view', /Calendar View/i);
    await routeShouldRender(page, '/calendar/group-management', /Group Management/i);

    const employeeList = await api<{ items: any[] }>(
      page,
      '/employees?page=1&pageSize=10',
      {},
      'employee list for group selection'
    );
    const activeEmployees = employeeList.items
      .filter((employee) => employee.status === 0)
      .slice(0, 2);
    expect(activeEmployees.length).toBeGreaterThanOrEqual(2);

    const selectorResults = await Promise.all(
      activeEmployees.map(async (employee) => {
        const selection = await api<{ items: any[]; totalCount: number }>(
          page,
          '/groups/users-for-selection',
          {
            method: 'POST',
            body: JSON.stringify({
              academicYearId,
              skipCount: 0,
              maxResultCount: 10,
              searchTerm: employee.employeeIdentifier,
              divisionFilters: [],
              roleFilters: [],
              studentFilters: [],
              employeeFilters: [],
            }),
          },
          `calendar users-for-selection for ${employee.employeeIdentifier}`
        );
        const selectedEmployee = selection.items.find(
          (item) => item.memberType === 1 && item.memberId === employee.id
        );
        expect(selectedEmployee).toBeTruthy();
        expect(selectedEmployee.employeeStatusType).toBe(0);
        return selectedEmployee;
      })
    );

    const employees = selectorResults;
    expect(employees.length).toBe(2);

    await api<{ items: any[]; totalCount: number }>(
      page,
      '/groups/users-for-selection',
      {
        method: 'POST',
        body: JSON.stringify({
          academicYearId,
          skipCount: 0,
          maxResultCount: 25,
          searchTerm: '',
          divisionFilters: [],
          roleFilters: [],
          studentFilters: [],
          employeeFilters: [],
        }),
      },
      'calendar users-for-selection'
    );

    const groupName = unique('E2E HR Audience Group');
    const createGroupBody = {
      name: groupName,
      description: 'Calendar group E2E with multiple HR employees',
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
        selectedMembers: employees.map((employee) => ({
          memberType: 1,
          memberId: employee.memberId,
          userId: null,
        })),
      },
    };
    const createdGroup = await api<{ id: string; employeeCount: number; memberCount: number }>(
      page,
      `/groups?academicYearId=${academicYearId}`,
      { method: 'POST', body: JSON.stringify(createGroupBody) },
      'create calendar employee group'
    );
    expect(createdGroup.employeeCount).toBe(2);
    expect(createdGroup.memberCount).toBeGreaterThanOrEqual(2);

    const createdDetails = await api<any>(page, `/groups/${createdGroup.id}`, {}, 'get group');
    expect(createdDetails.nameBased.employees).toHaveLength(2);
    expect(createdDetails.nameBased.employees[0].employeeName).toBeTruthy();
    expect(createdDetails.nameBased.employees[0].employeeName).not.toBe(
      createdDetails.nameBased.employees[0].id
    );

    const updatedBody = {
      ...createGroupBody,
      description: 'Calendar group E2E after removing one HR employee',
      nameBased: {
        ...createGroupBody.nameBased,
        selectedMembers: createGroupBody.nameBased.selectedMembers.slice(0, 1),
      },
    };
    await api(
      page,
      `/groups/${createdGroup.id}?academicYearId=${academicYearId}`,
      { method: 'PUT', body: JSON.stringify(updatedBody) },
      'update calendar employee group'
    );
    const updatedDetails = await api<any>(
      page,
      `/groups/${createdGroup.id}`,
      {},
      'get updated group'
    );
    expect(updatedDetails.employeeCount).toBe(1);
    expect(updatedDetails.studentCount).toBe(0);
    expect(updatedDetails.nameBased.employees).toHaveLength(1);
    expect(updatedDetails.nameBased.employees[0].employeeName).not.toBe(
      updatedDetails.nameBased.employees[0].id
    );

    await routeShouldRender(page, '/calendar/group-management', /Group Management/i);
    await expect(page.locator('body')).toContainText(/Students/i);
    await expect(page.locator('body')).toContainText(/Employees/i);
    await expect(page.locator('body')).toContainText(/Total Audience/i);
    const listedGroups = await api<{ items: Array<{ id: string; name: string }> }>(
      page,
      `/groups?academicYearId=${academicYearId}&includeDetails=true&filter=${encodeURIComponent(groupName)}`,
      {},
      'filtered group list'
    );
    expect(listedGroups.items.some((group) => group.id === createdGroup.id)).toBe(true);

    const eventType = await getOrCreateEventType(page);
    const holidayType = await getOrCreateHolidayType(page);
    const eventDate = nextWeekdayIso(45);
    const eventTitle = unique('E2E Group Calendar Event');
    const createdEvent = await api<{ id: string; title: string; audienceIds: string[] }>(
      page,
      `/calendar/events?academicYearId=${academicYearId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          academicYearId,
          title: eventTitle,
          eventTypeId: eventType.id,
          description: 'Calendar event targeted to the E2E HR audience group',
          poster: '',
          mode: 1,
          venue: 'E2E Training Room',
          startDate: eventDate,
          endDate: eventDate,
          startTime: '10:00',
          endTime: '11:00',
          isRecurring: false,
          recurrenceJson: null,
          audienceIds: [createdGroup.id],
        }),
      },
      'create calendar event with group audience'
    );
    expect(createdEvent.title).toBe(eventTitle);
    expect(createdEvent.audienceIds).toContain(createdGroup.id);

    const updatedEventTitle = `${eventTitle} Updated`;
    const updatedEvent = await api<{ id: string; title: string; audienceIds: string[] }>(
      page,
      `/calendar/events/${createdEvent.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          academicYearId,
          title: updatedEventTitle,
          eventTypeId: eventType.id,
          description: 'Updated calendar event targeted to the E2E HR audience group',
          poster: '',
          mode: 1,
          venue: 'E2E Training Room',
          startDate: eventDate,
          endDate: eventDate,
          startTime: '10:30',
          endTime: '11:30',
          isRecurring: false,
          recurrenceJson: null,
          audienceIds: [createdGroup.id],
        }),
      },
      'update calendar event with group audience'
    );
    expect(updatedEvent.title).toBe(updatedEventTitle);
    expect(updatedEvent.audienceIds).toContain(createdGroup.id);

    const eventDetails = await api<{
      id: string;
      title: string;
      audienceCount: number;
      eventType?: { name?: string };
    }>(page, `/calendar/items/${createdEvent.id}`, {}, 'calendar event details');
    expect(eventDetails.title).toBe(updatedEventTitle);
    expect(eventDetails.audienceCount).toBe(1);
    expect(eventDetails.eventType?.name).toBeTruthy();

    const holidayDate = nextWeekdayIso(60);
    const holidayName = unique('E2E Group Calendar Holiday');
    const createdHoliday = await api<{ id: string; holidayName: string; audienceIds: string[] }>(
      page,
      `/calendar/holidays?academicYearId=${academicYearId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          academicYearId,
          holidayName,
          holidayTypeId: holidayType.id,
          startDate: holidayDate,
          endDate: holidayDate,
          description: 'Calendar holiday targeted to the E2E HR audience group',
          audienceIds: [createdGroup.id],
          attachments: '',
        }),
      },
      'create calendar holiday with group audience'
    );
    expect(createdHoliday.holidayName).toBe(holidayName);
    expect(createdHoliday.audienceIds).toContain(createdGroup.id);

    const holidayDetails = await api<{
      id: string;
      title: string;
      audienceCount: number;
      holidayType?: { name?: string };
    }>(page, `/calendar/items/${createdHoliday.id}`, {}, 'calendar holiday details');
    expect(holidayDetails.title).toBe(holidayName);
    expect(holidayDetails.audienceCount).toBe(1);
    expect(holidayDetails.holidayType?.name).toBeTruthy();

    const publicEventTitle = unique('E2E Public Calendar Event');
    const publicEvent = await api<{ id: string; title: string; audienceIds: string[] }>(
      page,
      `/calendar/events?academicYearId=${academicYearId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          academicYearId,
          title: publicEventTitle,
          eventTypeId: eventType.id,
          description: 'Public calendar event for Calendar View E2E',
          poster: '',
          mode: 1,
          venue: 'E2E Public Room',
          startDate: eventDate,
          endDate: eventDate,
          startTime: '12:00',
          endTime: '13:00',
          isRecurring: false,
          recurrenceJson: null,
          audienceIds: [],
        }),
      },
      'create public calendar event'
    );
    expect(publicEvent.audienceIds).toHaveLength(0);

    const publicHolidayName = unique('E2E Public Calendar Holiday');
    const publicHoliday = await api<{ id: string; holidayName: string; audienceIds: string[] }>(
      page,
      `/calendar/holidays?academicYearId=${academicYearId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          academicYearId,
          holidayName: publicHolidayName,
          holidayTypeId: holidayType.id,
          startDate: holidayDate,
          endDate: holidayDate,
          description: 'Public calendar holiday for Calendar View E2E',
          audienceIds: [],
          attachments: '',
        }),
      },
      'create public calendar holiday'
    );
    expect(publicHoliday.audienceIds).toHaveLength(0);

    const calendarView = await api<{ items: CalendarViewItem[] }>(
      page,
      `/calendar/view?academicYearId=${academicYearId}&maxResultCount=500`,
      {},
      'calendar view with group audiences'
    );
    const calendarEvent = calendarView.items.find((item) => item.id === publicEvent.id);
    const calendarHoliday = calendarView.items.find((item) => item.id === publicHoliday.id);
    expect(calendarEvent?.title).toBe(publicEventTitle);
    expect(calendarEvent?.typeName).toBeTruthy();
    expect(calendarEvent?.startDate).toBeTruthy();
    expect(calendarEvent?.audienceCount).toBe(0);
    expect(calendarHoliday?.title).toBe(publicHolidayName);
    expect(calendarHoliday?.typeName).toBeTruthy();
    expect(calendarHoliday?.startDate).toBeTruthy();
    expect(calendarHoliday?.audienceCount).toBe(0);

    const eventTypeFilteredView = await api<{ items: CalendarViewItem[] }>(
      page,
      `/calendar/view?academicYearId=${academicYearId}&eventTypeIds=${eventType.id}&maxResultCount=500`,
      {},
      'calendar view filtered by event type'
    );
    expect(eventTypeFilteredView.items.some((item) => item.id === publicEvent.id)).toBe(true);
    expect(
      eventTypeFilteredView.items
        .filter((item) => item.calendarItemType === 0 || item.calendarItemType === 'Event')
        .every((item) => item.typeName === eventType.name)
    ).toBe(true);

    const holidayTypeFilteredView = await api<{ items: CalendarViewItem[] }>(
      page,
      `/calendar/view?academicYearId=${academicYearId}&holidayTypeIds=${holidayType.id}&maxResultCount=500`,
      {},
      'calendar view filtered by holiday type'
    );
    expect(holidayTypeFilteredView.items.some((item) => item.id === publicHoliday.id)).toBe(true);
    expect(
      holidayTypeFilteredView.items
        .filter((item) => item.calendarItemType === 1 || item.calendarItemType === 'Holiday')
        .every((item) => item.typeName === holidayType.name)
    ).toBe(true);

    await routeShouldRender(page, '/calendar/view', /Calendar View/i);
  });
});
