/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse, type Page } from '@playwright/test';

import { academicApiRequest, getAcademicJson, resolveAcademicContext } from './academic-api';

const TIMETABLE_STATUS = {
  published: 2,
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

test.describe(
  'Academic remaining workflow contracts and protected transitions',
  { tag: ['@module-academic', '@critical', '@workflow', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('covers lesson-plan list, timeline, submit, review, homework, and invalid create boundaries', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const today = new Date().toISOString().slice(0, 10);

      const plans = await expectOkJson(
        await academicApiRequest(
          page,
          `/academic/curriculum/lesson-plans?AcademicYearId=${context.academicYear.id}&SkipCount=0&MaxResultCount=10`
        )
      );
      expect(Array.isArray(pagedItems(plans))).toBe(true);

      const timeline = await expectOkJson(
        await academicApiRequest(page, `/academic/curriculum/lesson-plans/timeline?date=${today}`)
      );
      expect(Array.isArray(timeline) || typeof timeline === 'object').toBe(true);

      await expectClientError(
        await academicApiRequest(page, '/academic/curriculum/lesson-plans', {
          method: 'POST',
          body: JSON.stringify({
            academicYearId: context.academicYear.id,
            teacherId: fakeId,
            standardId: fakeId,
            divisionId: fakeId,
            subjectId: fakeId,
            chapterId: fakeId,
            plannedDate: today,
            topic: '',
            plannedCompletionPercentage: 101,
          }),
        })
      );

      for (const action of ['submit', 'approve', 'reject', 'request-changes'] as const) {
        await expectClientError(
          await academicApiRequest(page, `/academic/curriculum/lesson-plans/${fakeId}/${action}`, {
            method: 'POST',
            body: JSON.stringify({ remarks: 'E2E invalid workflow boundary.' }),
          })
        );
      }

      await expectClientError(
        await academicApiRequest(page, `/academic/curriculum/lesson-plans/${fakeId}/homework`, {
          method: 'POST',
          body: JSON.stringify({ title: '', dueDate: today }),
        })
      );
    });

    test('covers timetable publish validation and locked-slot mutation boundaries', async ({
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
          `/academics/timetable/by-standard/${seededStandardId}/division/${seededDivisionId}`,
          {
            method: 'POST',
            body: JSON.stringify({
              status: TIMETABLE_STATUS.published,
              timetable: {},
            }),
          }
        )
      );

      for (const path of [
        '/academics/timetable/assign-teachers',
        '/academics/timetable/assign-rooms',
      ]) {
        await expectClientError(
          await academicApiRequest(page, path, {
            method: 'POST',
            body: JSON.stringify({
              standardId: seededStandardId,
              divisionId: seededDivisionId,
              day: 'Monday',
              startTime: '09:00:00',
              endTime: '10:00:00',
              subjectType: 0,
              subjects: [{ subjectId: '00000000-0000-0000-0000-000000000000' }],
            }),
          })
        );
      }
    });

    test('covers homework and assignment submission, assessment, feedback, and grading boundaries', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const [homeworkAssessments, assignmentAssessments] = await Promise.all([
        academicApiRequest(page, `/academics/homeworks/${fakeId}/assessments`),
        academicApiRequest(page, `/academics/assignments/${fakeId}/assessments`),
      ]);
      await expectClientError(homeworkAssessments);
      await expectClientError(assignmentAssessments);

      await expectClientError(
        await academicApiRequest(page, '/academic/assignment-submissions', {
          method: 'POST',
          body: JSON.stringify({
            assignmentId: fakeId,
            studentId: fakeId,
            fileName: '',
          }),
        })
      );

      for (const root of ['homework', 'assignments'] as const) {
        await expectClientError(
          await academicApiRequest(
            page,
            `/${root}/${fakeId}/submissions/${fakeId}/feedback?academicMediumId=${academicMediumId}`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                marks: -1,
                totalMarks: 0,
                feedback: 'E2E invalid feedback boundary.',
              }),
            }
          )
        );
      }
    });

    test('covers exam result publish, freeze, unlock, and seating publication boundaries', async ({
      page,
    }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      for (const path of [
        '/academics/results/publish',
        '/academics/results/freeze',
        `/academics/exams/${fakeId}/seating-plan/finalize`,
        `/academics/exams/${fakeId}/seating-plan/publish`,
        `/academics/exams/${fakeId}/seating-plan/unlock`,
        `/academics/exams/${fakeId}/marks/unlock`,
      ]) {
        await expectClientError(
          await academicApiRequest(page, path, {
            method: 'POST',
            body: JSON.stringify({
              resultHeaderId: fakeId,
              reason: 'E2E invalid publication boundary.',
              remarks: 'E2E invalid publication boundary.',
            }),
          })
        );
      }
    });
  }
);
