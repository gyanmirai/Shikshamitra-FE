/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse, type Page } from '@playwright/test';

import { academicApiRequest, resolveAcademicContext } from './academic-api';

const CALENDAR_STATUS = {
  draft: 1,
  published: 2,
  archived: 3,
} as const;

const DAY_TYPE = {
  vacation: 3,
  event: 5,
} as const;

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

function attachCases(...ids: string[]) {
  test.info().annotations.push({ type: 'case', description: ids.join(', ') });
}

function nextWeekday(start: Date, offsetDays: number) {
  let candidate = addDays(start, offsetDays);
  while (candidate.getUTCDay() === 0 || candidate.getUTCDay() === 6) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

function calendarWindow(academicYear: { startDate?: string | null; endDate?: string | null }) {
  const yearStart = academicYear.startDate
    ? new Date(academicYear.startDate)
    : new Date('2026-04-01');
  const yearEnd = academicYear.endDate ? new Date(academicYear.endDate) : addDays(yearStart, 60);
  const start = nextWeekday(yearStart, 7);
  const end = addDays(start, 21);

  if (end > yearEnd) {
    return {
      start: nextWeekday(yearStart, 1),
      end: addDays(nextWeekday(yearStart, 1), 14),
    };
  }

  return { start, end };
}

async function expectOkJson<T = any>(response: APIResponse): Promise<T> {
  expect(response.ok(), `${response.url()} ${response.status()}`).toBe(true);
  return response.json();
}

async function expectClientError(response: APIResponse) {
  expect(
    response.status(),
    `${response.url()} should return a controlled 4xx`
  ).toBeGreaterThanOrEqual(400);
  expect(response.status(), `${response.url()} should not return 5xx`).toBeLessThan(500);
}

async function safeArchiveAndDeleteCalendar(page: Page, calendarId?: string) {
  if (!calendarId) return;

  await academicApiRequest(page, `/academic/calendars/${calendarId}/archive`, {
    method: 'POST',
  }).catch(() => undefined);
  await academicApiRequest(page, `/academic/calendars/${calendarId}`, {
    method: 'DELETE',
  }).catch(() => undefined);
}

test.describe(
  'Academic Calendar full API workflow',
  { tag: ['@module-academic', '@submodule-academic-calendar', '@critical', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('AC-CAL-005..014 creates, edits, marks days, publishes, declares closure, audits, archives, and deletes calendar', async ({
      page,
    }) => {
      attachCases(
        'AC-CAL-005',
        'AC-CAL-006',
        'AC-CAL-007',
        'AC-CAL-008',
        'AC-CAL-009',
        'AC-CAL-010',
        'AC-CAL-011',
        'AC-CAL-012',
        'AC-CAL-013',
        'AC-CAL-014'
      );

      const context = await resolveAcademicContext(page);
      const runId = `e2e-${Date.now()}-${test.info().workerIndex}`;
      const window = calendarWindow(context.academicYear);
      const eventDate = nextWeekday(window.start, 2);
      const closureDate = nextWeekday(window.start, 4);
      let calendarId: string | undefined;
      let emergencyClosureDayId: string | undefined;

      try {
        const created = await expectOkJson(
          await academicApiRequest(page, '/academic/calendars', {
            method: 'POST',
            body: JSON.stringify({
              academicYearId: context.academicYear.id,
              name: `${runId}-calendar`,
              description: `${runId} Academic Calendar workflow`,
              startDate: isoDateTime(window.start),
              endDate: isoDateTime(window.end),
              isDefault: false,
            }),
          })
        );
        calendarId = created.id;
        expect(created.name).toBe(`${runId}-calendar`);
        expect(created.status).toBe(CALENDAR_STATUS.draft);

        const updated = await expectOkJson(
          await academicApiRequest(page, `/academic/calendars/${calendarId}`, {
            method: 'PUT',
            body: JSON.stringify({
              name: `${runId}-calendar-updated`,
              description: `${runId} updated description`,
              isDefault: false,
            }),
          })
        );
        expect(updated.name).toBe(`${runId}-calendar-updated`);

        const addedDay = await expectOkJson(
          await academicApiRequest(page, `/academic/calendars/${calendarId}/days`, {
            method: 'POST',
            body: JSON.stringify({
              date: isoDateTime(eventDate),
              dayType: DAY_TYPE.event,
              title: `${runId}-event`,
              description: 'E2E event day marker',
              appliesToAll: true,
              changeReason: `${runId} verifies day creation`,
            }),
          })
        );
        expect(addedDay.title).toBe(`${runId}-event`);

        const published = await expectOkJson(
          await academicApiRequest(page, `/academic/calendars/${calendarId}/publish`, {
            method: 'POST',
          })
        );
        expect(published.status).toBe(CALENDAR_STATUS.published);

        const closureDays = await expectOkJson(
          await academicApiRequest(page, '/academic/calendar-days/emergency-closure', {
            method: 'POST',
            body: JSON.stringify({
              date: isoDateTime(closureDate),
              startDate: isoDateTime(closureDate),
              endDate: isoDateTime(closureDate),
              title: `${runId}-closure`,
              description: 'E2E emergency closure',
              appliesToAll: true,
              notifyParents: false,
              notifyTeachers: false,
              notifyStudents: false,
              notifyStaff: false,
              autoScanImpacts: true,
            }),
          })
        );
        expect(Array.isArray(closureDays)).toBe(true);
        expect(closureDays[0]?.title).toBe(`${runId}-closure`);
        emergencyClosureDayId = closureDays[0]?.id;

        await expectOkJson(
          await academicApiRequest(
            page,
            `/academic/calendar-impact-logs/by-day/${emergencyClosureDayId}`
          )
        );

        const auditLogs = await expectOkJson(
          await academicApiRequest(page, `/academic/calendar-audit-logs/by-calendar/${calendarId}`)
        );
        const actionLabels = auditLogs.map((item: { actionLabel?: string }) => item.actionLabel);
        expect(actionLabels).toContain('Calendar Created');
        expect(actionLabels).toContain('Calendar Updated');
        expect(actionLabels).toContain('Calendar Published');
        expect(actionLabels).toContain('Emergency Closure Declared');

        const cancelResponse = await academicApiRequest(
          page,
          `/academic/calendar-days/${emergencyClosureDayId}/cancel-emergency-closure`,
          { method: 'POST' }
        );
        expect(cancelResponse.ok(), `${cancelResponse.url()} ${cancelResponse.status()}`).toBe(
          true
        );

        const archived = await expectOkJson(
          await academicApiRequest(page, `/academic/calendars/${calendarId}/archive`, {
            method: 'POST',
          })
        );
        expect(archived.status).toBe(CALENDAR_STATUS.archived);

        const deleteResponse = await academicApiRequest(page, `/academic/calendars/${calendarId}`, {
          method: 'DELETE',
        });
        expect(deleteResponse.ok(), `${deleteResponse.url()} ${deleteResponse.status()}`).toBe(
          true
        );
        calendarId = undefined;
      } finally {
        await safeArchiveAndDeleteCalendar(page, calendarId);
      }
    });

    test('AC-CAL-017..019 rejects duplicate calendar names, duplicate day markers, and invalid vacation ranges', async ({
      page,
    }) => {
      attachCases('AC-CAL-017', 'AC-CAL-018', 'AC-CAL-019');

      const context = await resolveAcademicContext(page);
      const runId = `e2e-${Date.now()}-${test.info().workerIndex}-negative`;
      const window = calendarWindow(context.academicYear);
      const markerDate = nextWeekday(window.start, 3);
      let calendarId: string | undefined;

      try {
        const created = await expectOkJson(
          await academicApiRequest(page, '/academic/calendars', {
            method: 'POST',
            body: JSON.stringify({
              academicYearId: context.academicYear.id,
              name: `${runId}-calendar`,
              description: `${runId} negative Academic Calendar workflow`,
              startDate: isoDateTime(window.start),
              endDate: isoDateTime(window.end),
              isDefault: false,
            }),
          })
        );
        calendarId = created.id;

        await expectClientError(
          await academicApiRequest(page, '/academic/calendars', {
            method: 'POST',
            body: JSON.stringify({
              academicYearId: context.academicYear.id,
              name: `${runId}-calendar`,
              description: 'duplicate name must be rejected',
              startDate: isoDateTime(window.start),
              endDate: isoDateTime(window.end),
              isDefault: false,
            }),
          })
        );

        await expectOkJson(
          await academicApiRequest(page, `/academic/calendars/${calendarId}/days`, {
            method: 'POST',
            body: JSON.stringify({
              date: isoDateTime(markerDate),
              dayType: DAY_TYPE.event,
              title: `${runId}-duplicate-marker`,
              appliesToAll: true,
              changeReason: `${runId} initial marker`,
            }),
          })
        );

        await expectClientError(
          await academicApiRequest(page, `/academic/calendars/${calendarId}/days`, {
            method: 'POST',
            body: JSON.stringify({
              date: isoDateTime(markerDate),
              dayType: DAY_TYPE.event,
              title: `${runId}-duplicate-marker-again`,
              appliesToAll: true,
              changeReason: `${runId} duplicate marker`,
            }),
          })
        );

        await expectClientError(
          await academicApiRequest(page, `/academic/calendars/${calendarId}/days`, {
            method: 'POST',
            body: JSON.stringify({
              date: isoDateTime(addDays(markerDate, 2)),
              endDate: isoDateTime(addDays(markerDate, 1)),
              dayType: DAY_TYPE.vacation,
              title: `${runId}-invalid-vacation`,
              appliesToAll: true,
              changeReason: `${runId} invalid vacation`,
            }),
          })
        );
      } finally {
        await safeArchiveAndDeleteCalendar(page, calendarId);
      }
    });
  }
);
