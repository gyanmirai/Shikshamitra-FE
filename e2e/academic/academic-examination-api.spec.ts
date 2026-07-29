/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse, type Page } from '@playwright/test';

import { academicApiRequest, getAcademicJson, resolveAcademicContext } from './academic-api';

const EXAM_STATUS = {
  pending: 0,
  published: 1,
  completed: 2,
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
  const text = await response.text();
  return text ? unwrapResult(JSON.parse(text)) : (null as T);
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

async function firstExam(page: Page, academicMediumId: string) {
  for (const status of Object.values(EXAM_STATUS)) {
    const body = await expectOkJson(
      await academicApiRequest(
        page,
        `/academics/exams?AcademicMediumId=${academicMediumId}&Status=${status}&SkipCount=0&MaxResultCount=10`
      )
    );
    const exam = pagedItems(body).find((item) => optionValue(item, 'examId', 'id'));
    if (exam) return exam;
  }
  return undefined;
}

test.describe(
  'Academic Examination API contracts and edge validations',
  { tag: ['@module-academic', '@submodule-examination', '@critical', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('reads exam list, schedule, room, subject, marks, seating, and result contracts', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const standardId = await firstStandardId(page, academicMediumId);
      test.skip(!standardId, 'Seeded academic medium must expose at least one standard.');
      const seededStandardId = standardId as string;

      const seatAllocation = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/exams/seat-allocation?StandardId=${seededStandardId}&Page=1&PageSize=10`
        )
      );
      expect(Array.isArray(seatAllocation.items)).toBe(true);

      const exam = await firstExam(page, academicMediumId);
      test.skip(!exam, 'Seeded academic data must expose at least one exam.');
      const examId = optionValue(exam, 'examId', 'id') as string;

      const basicDetails = await expectOkJson(
        await academicApiRequest(page, `/academics/exams/${examId}/basic-details`)
      );
      expect(optionValue(basicDetails, 'id', 'examId')).toBeTruthy();

      const schedule = await expectOkJson(
        await academicApiRequest(page, `/academics/exams/${examId}/schedule`)
      );
      expect(Array.isArray(schedule.subjects)).toBe(true);

      const rooms = await expectOkJson(
        await academicApiRequest(page, `/academics/exams/${examId}/rooms`)
      );
      expect(Array.isArray(rooms.subjects)).toBe(true);

      const subjects = await expectOkJson(
        await academicApiRequest(page, `/academics/exams/${examId}/subjects`)
      );
      expect(Array.isArray(subjects)).toBe(true);

      const divisionId = await firstDivisionForStandard(page, seededStandardId);
      const subjectId = optionValue(subjects[0], 'subjectId', 'id');
      test.skip(
        !divisionId || !subjectId,
        'Seeded exam must expose at least one subject and standard division.'
      );
      const seededDivisionId = divisionId as string;
      const seededSubjectId = subjectId as string;

      const marks = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/exams/marks?ExamId=${examId}&SubjectId=${seededSubjectId}&DivisionId=${seededDivisionId}&StandardId=${seededStandardId}&Page=1&PageSize=20`
        )
      );
      expect(Array.isArray(marks.items)).toBe(true);

      const marksSummary = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/exams/marks/summary?ExamId=${examId}&SubjectId=${seededSubjectId}&DivisionId=${seededDivisionId}`
        )
      );
      expect(typeof marksSummary).toBe('object');

      const readinessResponse = await academicApiRequest(
        page,
        `/academics/results/readiness?examId=${examId}&divisionId=${seededDivisionId}`
      );
      expect([200, 404], `${readinessResponse.url()} ${readinessResponse.status()}`).toContain(
        readinessResponse.status()
      );

      const resultHeaderResponse = await academicApiRequest(
        page,
        `/academics/results?examId=${examId}&divisionId=${seededDivisionId}`
      );
      expect(
        resultHeaderResponse.ok(),
        `${resultHeaderResponse.url()} ${resultHeaderResponse.status()}`
      ).toBe(true);
    });

    test('rejects invalid exam creation, schedule, marks, seating, and result payloads safely', async ({
      page,
    }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expectClientError(
        await academicApiRequest(page, '/academics/exams/basic-details', {
          method: 'POST',
          body: JSON.stringify({
            examName: '',
            divisionIds: [],
            subjectIds: [],
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academics/exams/${fakeId}/schedule`, {
          method: 'PUT',
          body: JSON.stringify({
            subjects: [],
            syncToAcademicCalendar: true,
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(
          page,
          `/academics/exams/${fakeId}/students/${fakeId}/marks?subjectId=${fakeId}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              marks: -1,
              totalMarks: 0,
              feedback: 'Invalid marks boundary check',
              attendanceStatus: 0,
            }),
          }
        )
      );

      await expectClientError(
        await academicApiRequest(page, `/academics/exams/${fakeId}/seating-plan`, {
          method: 'PUT',
          body: JSON.stringify({
            roomIds: [],
            rules: {
              seatGap: -1,
            },
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, '/academics/results/generate', {
          method: 'POST',
          body: JSON.stringify({
            examId: fakeId,
            divisionId: fakeId,
            forceRegenerate: false,
          }),
        })
      );
    });
  }
);
