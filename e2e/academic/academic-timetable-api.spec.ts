/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse, type Page } from '@playwright/test';

import { academicApiRequest, getAcademicJson, resolveAcademicContext } from './academic-api';

const TIMETABLE_STATUS = {
  draft: 1,
} as const;

const SUBJECT_TYPE = {
  core: 0,
} as const;

function pagedItems(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

function unwrapResult(body: any) {
  return body?.data ?? body;
}

async function expectOkJson<T = any>(response: APIResponse): Promise<T> {
  expect(response.ok(), `${response.url()} ${response.status()}`).toBe(true);
  return unwrapResult(await response.json());
}

async function expectClientError(response: APIResponse) {
  expect(
    response.status(),
    `${response.url()} should return a controlled 4xx`
  ).toBeGreaterThanOrEqual(400);
  expect(response.status(), `${response.url()} should not return 5xx`).toBeLessThan(500);
}

function optionValue(item: any, ...keys: string[]) {
  return keys
    .map((key) => key.split('.').reduce((current, part) => current?.[part], item))
    .find(Boolean);
}

async function firstStandardId(page: Page, academicMediumId: string) {
  const standardsBody = await getAcademicJson(
    page,
    `/education-medium/${academicMediumId}/standards`
  );
  return pagedItems(standardsBody).find((standard) => standard?.id)?.id as string | undefined;
}

async function firstDivisionForStandard(page: Page, standardId: string) {
  const management = await expectOkJson(
    await academicApiRequest(page, `/academics/timetable/management/by-standard/${standardId}`)
  );
  const division = pagedItems(management).find((item) => optionValue(item, 'divisionId', 'id'));
  return optionValue(division, 'divisionId', 'id') as string | undefined;
}

function nextMondayIso() {
  const date = new Date();
  const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + daysUntilMonday);
  return date.toISOString().slice(0, 10);
}

test.describe(
  'Academic Timetable API contracts and edge validations',
  { tag: ['@module-academic', '@submodule-timetable', '@critical', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('reads management, slot config, timetable, and room availability contracts', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const standardId = await firstStandardId(page, academicMediumId);
      test.skip(!standardId, 'Seeded academic medium must expose at least one standard.');
      const seededStandardId = standardId as string;

      const management = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/management/by-standard/${seededStandardId}`
        )
      );
      expect(optionValue(management, 'standardId')).toBe(seededStandardId);
      expect(Array.isArray(management.items)).toBe(true);

      const slotConfig = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/slot-config/by-standard/${seededStandardId}`
        )
      );
      expect(optionValue(slotConfig, 'standardId')).toBe(seededStandardId);
      expect(Array.isArray(slotConfig.items)).toBe(true);

      const divisionId = await firstDivisionForStandard(page, seededStandardId);
      test.skip(!divisionId, 'Seeded standard must expose at least one division.');
      const seededDivisionId = divisionId as string;

      const timetable = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/by-standard/${seededStandardId}/division/${seededDivisionId}`
        )
      );
      expect(typeof timetable.days).toBe('object');
      expect(Array.isArray(timetable.subjectSummary)).toBe(true);

      const rooms = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/room-availability?date=${nextMondayIso()}&startTime=09:00:00&endTime=10:00:00&standardId=${seededStandardId}&divisionId=${seededDivisionId}&includeOccupied=true`
        )
      );
      expect(Array.isArray(rooms)).toBe(true);
    });

    test('rejects empty timetable, teacher assignment, and room assignment payloads safely', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const standardId = await firstStandardId(page, academicMediumId);
      test.skip(!standardId, 'Seeded academic medium must expose at least one standard.');
      const seededStandardId = standardId as string;

      const divisionId = await firstDivisionForStandard(page, seededStandardId);
      test.skip(!divisionId, 'Seeded standard must expose at least one division.');
      const seededDivisionId = divisionId as string;

      await expectClientError(
        await academicApiRequest(
          page,
          `/academics/timetable/by-standard/${seededStandardId}/division/${seededDivisionId}/validate`,
          {
            method: 'POST',
            body: JSON.stringify({
              status: TIMETABLE_STATUS.draft,
              timetable: {},
            }),
          }
        )
      );

      await expectClientError(
        await academicApiRequest(page, '/academics/timetable/assign-teachers', {
          method: 'POST',
          body: JSON.stringify({
            standardId: seededStandardId,
            divisionId: seededDivisionId,
            day: 'Monday',
            startTime: '09:00:00',
            endTime: '10:00:00',
            subjectType: SUBJECT_TYPE.core,
            subjects: [],
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, '/academics/timetable/assign-rooms', {
          method: 'POST',
          body: JSON.stringify({
            standardId: seededStandardId,
            divisionId: seededDivisionId,
            day: 'Monday',
            startTime: '09:00:00',
            endTime: '10:00:00',
            subjectType: SUBJECT_TYPE.core,
            subjects: [],
          }),
        })
      );
    });

    test('reads substitution metadata, dashboard, list, and daily-sheet contracts', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const date = nextMondayIso();

      const metadata = await expectOkJson(
        await academicApiRequest(page, '/academics/timetable/substitutions/create-form-metadata')
      );
      expect(Array.isArray(metadata.standards)).toBe(true);
      expect(Array.isArray(metadata.divisions)).toBe(true);
      expect(Array.isArray(metadata.subjects)).toBe(true);
      expect(Array.isArray(metadata.teachers)).toBe(true);

      const dashboard = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/substitutions/dashboard?date=${date}&academicYearId=${context.academicYear.id}`
        )
      );
      expect(typeof dashboard).toBe('object');

      const substitutions = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/substitutions?academicYearId=${context.academicYear.id}&fromDate=${date}&toDate=${date}&skipCount=0&maxResultCount=10`
        )
      );
      expect(Array.isArray(substitutions.items)).toBe(true);

      const dailySheet = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/timetable/substitutions/daily-sheet?date=${date}&academicYearId=${context.academicYear.id}`
        )
      );
      expect(typeof dailySheet).toBe('object');
    });
  }
);
