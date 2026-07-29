/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse } from '@playwright/test';

import { academicApiRequest, resolveAcademicContext } from './academic-api';

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

test.describe(
  'Academic Homework and Assignment API contracts and edge validations',
  { tag: ['@module-academic', '@submodule-homework-assignment', '@critical', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('reads homework and assignment list/dashboard contracts for the selected medium', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;

      const homeworks = await expectOkJson(
        await academicApiRequest(
          page,
          `/academic/homeworks?academicMediumId=${academicMediumId}&Page=1&PageSize=10`
        )
      );
      expect(Array.isArray(homeworks.items)).toBe(true);

      const homeworkDashboard = await expectOkJson(
        await academicApiRequest(
          page,
          `/academic/homeworks/dashboard?academicMediumId=${academicMediumId}`
        )
      );
      expect(typeof homeworkDashboard).toBe('object');

      const assignments = await expectOkJson(
        await academicApiRequest(
          page,
          `/academic/assignments?academicMediumId=${academicMediumId}&Page=1&PageSize=10`
        )
      );
      expect(Array.isArray(assignments.items)).toBe(true);

      const assignmentDashboard = await expectOkJson(
        await academicApiRequest(
          page,
          `/academic/assignments/dashboard?academicMediumId=${academicMediumId}`
        )
      );
      expect(typeof assignmentDashboard).toBe('object');
    });

    test('rejects missing and malformed learning-task create and submission payloads safely', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;

      await expectClientError(
        await academicApiRequest(page, `/academic/homeworks?academicMediumId=${academicMediumId}`, {
          method: 'POST',
          body: JSON.stringify({}),
        })
      );

      await expectClientError(
        await academicApiRequest(
          page,
          `/academic/assignments?academicMediumId=${academicMediumId}`,
          {
            method: 'POST',
            body: JSON.stringify({}),
          }
        )
      );

      await expectClientError(
        await academicApiRequest(page, '/academic/homework-submissions', {
          method: 'POST',
          body: JSON.stringify({
            homeworkId: '00000000-0000-0000-0000-000000000000',
            studentId: '00000000-0000-0000-0000-000000000000',
            fileName: '',
          }),
        })
      );
    });

    test('covers rubric list contract and invalid rubric boundary checks', async ({ page }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;

      const rubrics = await expectOkJson(
        await academicApiRequest(page, `/academic/rubrics?AcademicMediumId=${academicMediumId}`)
      );
      expect(Array.isArray(rubrics)).toBe(true);

      await expectClientError(
        await academicApiRequest(page, '/academic/rubrics', {
          method: 'POST',
          body: JSON.stringify({
            academicMediumId,
            isTemplate: true,
            title: '',
            scoringModel: 0,
            visibility: 0,
            criteria: [],
            performanceLevels: [],
          }),
        })
      );
    });
  }
);
