/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse } from '@playwright/test';

import { academicApiRequest, resolveAcademicContext } from './academic-api';

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

test.describe(
  'Academic Question Bank API contracts and edge validations',
  { tag: ['@module-academic', '@submodule-examination', '@critical', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('reads question bank settings, dashboard, list, and detail contracts', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicYearId = context.academicYear.id;

      const settings = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/question-bank/settings?academicYearId=${academicYearId}`
        )
      );
      expect(settings.academicYearId).toBe(academicYearId);
      expect(typeof settings.enableDuplicateCheck).toBe('boolean');

      const dashboard = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/question-bank/dashboard?academicYearId=${academicYearId}`
        )
      );
      expect(typeof dashboard.totalQuestions).toBe('number');
      expect(typeof dashboard.pendingReview).toBe('number');

      const questions = await expectOkJson(
        await academicApiRequest(
          page,
          `/academics/question-bank/questions?AcademicYearId=${academicYearId}&Page=1&PageSize=20`
        )
      );
      expect(Array.isArray(questions.items)).toBe(true);

      const questionId = questions.items.find((item: any) => item?.id)?.id as string | undefined;
      test.skip(!questionId, 'Seeded academic data must expose at least one question.');

      const question = await expectOkJson(
        await academicApiRequest(page, `/academics/question-bank/questions/${questionId}`)
      );
      expect(question.id).toBe(questionId);
      expect(typeof question.questionText).toBe('string');
    });

    test('rejects invalid create, duplicate-check, review, archive, duplicate, and bulk actions safely', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expectClientError(
        await academicApiRequest(page, '/academics/question-bank/questions', {
          method: 'POST',
          body: JSON.stringify({
            academicYearId: context.academicYear.id,
            standardId: fakeId,
            subjectId: fakeId,
            questionText: '',
            questionType: 0,
            difficultyLevel: 0,
            marks: 0,
            answerKey: '',
            options: [],
            tags: [],
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, '/academics/question-bank/questions/check-duplicate', {
          method: 'POST',
          body: JSON.stringify({
            academicYearId: context.academicYear.id,
            standardId: fakeId,
            subjectId: fakeId,
            questionText: '',
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academics/question-bank/questions/${fakeId}/approve`, {
          method: 'POST',
          body: JSON.stringify({ comment: 'Invalid E2E approve boundary.' }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academics/question-bank/questions/${fakeId}/reject`, {
          method: 'POST',
          body: JSON.stringify({ comment: '' }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academics/question-bank/questions/${fakeId}/archive`, {
          method: 'POST',
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academics/question-bank/questions/${fakeId}/duplicate`, {
          method: 'POST',
        })
      );

      await expectClientError(
        await academicApiRequest(page, '/academics/question-bank/questions/bulk-approve', {
          method: 'POST',
          body: JSON.stringify({ questionIds: [], comment: 'Invalid E2E bulk approve boundary.' }),
        })
      );
    });
  }
);
