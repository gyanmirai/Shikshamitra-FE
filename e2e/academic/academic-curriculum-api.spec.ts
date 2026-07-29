/* eslint-disable import/no-extraneous-dependencies */
import { expect, test, type APIResponse, type Page } from '@playwright/test';

import { academicApiRequest, getAcademicJson, resolveAcademicContext } from './academic-api';

const SUBJECT_MASTER_STATUS = {
  active: 0,
  archived: 2,
} as const;

const SUBJECT_STATUS = {
  draft: 0,
  published: 1,
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

function hasDuplicateMatch(body: any) {
  const result = unwrapResult(body);
  return Boolean(
    result?.hasExactDuplicate ||
    result?.hasSimilarDuplicate ||
    result?.hasSameSubjectCombination ||
    result?.matches?.length
  );
}

async function createSubject(page: Page, academicMediumId: string, name: string) {
  return expectOkJson(
    await academicApiRequest(page, `/academic-mediums/${academicMediumId}/subjects`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        displayName: name,
        category: 'E2E',
        color: '#00B96B',
        icon: 'book',
        description: 'Created by Academic Curriculum E2E.',
        status: SUBJECT_MASTER_STATUS.active,
        sortOrder: null,
        educationMediumId: academicMediumId,
      }),
    })
  );
}

async function deleteSubject(page: Page, academicMediumId: string, subjectId?: string) {
  if (!subjectId) return;
  const response = await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/subjects/${subjectId}`,
    { method: 'DELETE' }
  );
  if ([200, 204, 404].includes(response.status())) return;

  await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/subjects/${subjectId}/archive`,
    {
      method: 'POST',
      body: JSON.stringify({ reason: 'Academic Curriculum E2E cleanup' }),
    }
  ).catch(() => undefined);
}

async function deleteElectiveGroup(page: Page, academicMediumId: string, groupId?: string) {
  if (!groupId) return;
  const response = await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/elective-groups/${groupId}`,
    { method: 'DELETE' }
  );
  if ([200, 204, 404].includes(response.status())) return;

  await academicApiRequest(
    page,
    `/academic-mediums/${academicMediumId}/elective-groups/${groupId}/archive`,
    {
      method: 'POST',
      body: JSON.stringify({ reason: 'Academic Curriculum E2E cleanup' }),
    }
  ).catch(() => undefined);
}

async function deleteAssignment(page: Page, assignmentId?: string) {
  if (!assignmentId) return;
  const response = await academicApiRequest(
    page,
    `/academics/curriculum/subject-assignments/${assignmentId}`,
    { method: 'DELETE' }
  );
  if ([200, 204, 404].includes(response.status())) return;

  await academicApiRequest(
    page,
    `/academics/curriculum/subject-assignments/${assignmentId}/archive`,
    {
      method: 'POST',
    }
  ).catch(() => undefined);
}

async function firstStandardId(page: Page, academicMediumId: string) {
  const standardsBody = await getAcademicJson(
    page,
    `/education-medium/${academicMediumId}/standards`
  );
  return pagedItems(standardsBody).find((standard) => standard?.id)?.id as string | undefined;
}

test.describe(
  'Academic Curriculum API workflows',
  { tag: ['@module-academic', '@submodule-curriculum', '@critical', '@api'] },
  () => {
    test.use({ storageState: 'playwright/.auth/academic-admin.json' });

    test('covers subject lifecycle, duplicate detection, archive, restore, audit, and delete', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const runId = `e2e-${Date.now()}-${test.info().workerIndex}`;
      let subjectId: string | undefined;

      try {
        const subject = await createSubject(page, academicMediumId, `${runId}-subject`);
        subjectId = subject.id;
        expect(subject.name).toBe(`${runId}-subject`);

        const duplicate = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/subjects/check-duplicate`,
            {
              method: 'POST',
              body: JSON.stringify({ name: `${runId}-subject` }),
            }
          )
        );
        expect(hasDuplicateMatch(duplicate)).toBe(true);

        const updated = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/subjects/${subjectId}`,
            {
              method: 'PUT',
              body: JSON.stringify({
                name: `${runId}-subject`,
                displayName: `${runId}-display`,
                category: 'E2E',
                color: '#1976D2',
                icon: 'book',
                description: 'Updated by Academic Curriculum E2E.',
                status: SUBJECT_MASTER_STATUS.active,
                sortOrder: 1,
                educationMediumId: academicMediumId,
              }),
            }
          )
        );
        expect(updated.displayName).toBe(`${runId}-display`);

        const usage = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/subjects/${subjectId}/usage`
          )
        );
        expect(usage.subjectId || usage.data?.subjectId).toBe(subjectId);

        const archived = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/subjects/${subjectId}/archive`,
            {
              method: 'POST',
              body: JSON.stringify({ reason: `${runId} archive` }),
            }
          )
        );
        expect(archived.status).toBe(SUBJECT_MASTER_STATUS.archived);

        const restored = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/subjects/${subjectId}/restore`,
            { method: 'POST' }
          )
        );
        expect(restored.status).toBe(SUBJECT_MASTER_STATUS.active);

        const auditLogs = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/subjects/${subjectId}/audit-logs`
          )
        );
        expect(Array.isArray(auditLogs)).toBe(true);

        const deleteResponse = await academicApiRequest(
          page,
          `/academic-mediums/${academicMediumId}/subjects/${subjectId}`,
          { method: 'DELETE' }
        );
        expect(deleteResponse.ok(), `${deleteResponse.url()} ${deleteResponse.status()}`).toBe(
          true
        );
        subjectId = undefined;
      } finally {
        await deleteSubject(page, academicMediumId, subjectId);
      }
    });

    test('rejects invalid subject and elective group payloads with controlled 4xx responses', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const runId = `e2e-${Date.now()}-${test.info().workerIndex}-negative`;

      await expectClientError(
        await academicApiRequest(page, `/academic-mediums/${academicMediumId}/subjects`, {
          method: 'POST',
          body: JSON.stringify({
            name: 'A',
            displayName: 'A',
            category: 'E2E',
            color: 'not-a-color',
            educationMediumId: academicMediumId,
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academic-mediums/${academicMediumId}/subjects`, {
          method: 'POST',
          body: JSON.stringify({
            name: `${runId}-wrong-medium`,
            displayName: `${runId}-wrong-medium`,
            color: '#00B96B',
            educationMediumId: '00000000-0000-0000-0000-000000000000',
          }),
        })
      );

      await expectClientError(
        await academicApiRequest(page, `/academic-mediums/${academicMediumId}/elective-groups`, {
          method: 'POST',
          body: JSON.stringify({
            name: `${runId}-elective-group`,
            color: '#00B96B',
            subjectIds: [],
          }),
        })
      );
    });

    test('covers elective group lifecycle with two E2E subjects', async ({ page }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const runId = `e2e-${Date.now()}-${test.info().workerIndex}-elective`;
      const subjects: Array<{ id: string }> = [];
      let groupId: string | undefined;

      try {
        subjects.push(await createSubject(page, academicMediumId, `${runId}-subject-a`));
        subjects.push(await createSubject(page, academicMediumId, `${runId}-subject-b`));

        const createdGroup = await expectOkJson(
          await academicApiRequest(page, `/academic-mediums/${academicMediumId}/elective-groups`, {
            method: 'POST',
            body: JSON.stringify({
              name: `${runId}-group`,
              color: '#9C27B0',
              groupType: 'E2E',
              description: 'Created by Academic Curriculum E2E.',
              subjectIds: subjects.map((subject) => subject.id),
            }),
          })
        );
        groupId = createdGroup.id;
        expect(createdGroup.name).toBe(`${runId}-group`);

        const duplicate = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/elective-groups/check-duplicate`,
            {
              method: 'POST',
              body: JSON.stringify({
                name: `${runId}-group`,
                subjectIds: subjects.map((subject) => subject.id),
              }),
            }
          )
        );
        expect(hasDuplicateMatch(duplicate)).toBe(true);

        const updatedGroup = await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/elective-groups/${groupId}`,
            {
              method: 'PUT',
              body: JSON.stringify({
                name: `${runId}-group-updated`,
                color: '#673AB7',
                groupType: 'E2E',
                description: 'Updated by Academic Curriculum E2E.',
                subjectIds: subjects.map((subject) => subject.id),
              }),
            }
          )
        );
        expect(updatedGroup.name).toBe(`${runId}-group-updated`);

        await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/elective-groups/${groupId}/archive`,
            {
              method: 'POST',
              body: JSON.stringify({ reason: `${runId} archive` }),
            }
          )
        );

        await expectOkJson(
          await academicApiRequest(
            page,
            `/academic-mediums/${academicMediumId}/elective-groups/${groupId}/restore`,
            { method: 'POST' }
          )
        );

        const deleteResponse = await academicApiRequest(
          page,
          `/academic-mediums/${academicMediumId}/elective-groups/${groupId}`,
          { method: 'DELETE' }
        );
        expect(deleteResponse.ok(), `${deleteResponse.url()} ${deleteResponse.status()}`).toBe(
          true
        );
        groupId = undefined;
      } finally {
        await deleteElectiveGroup(page, academicMediumId, groupId);
        await Promise.all(
          subjects.map((subject) => deleteSubject(page, academicMediumId, subject.id))
        );
      }
    });

    test('covers subject assignment contract, health, readiness, archive, restore, and delete', async ({
      page,
    }) => {
      const context = await resolveAcademicContext(page);
      const academicMediumId = context.currentMedium.id;
      const standardId = await firstStandardId(page, academicMediumId);
      test.skip(!standardId, 'Seeded academic medium must expose at least one standard.');

      const runId = `e2e-${Date.now()}-${test.info().workerIndex}-assignment`;
      let subject: { id: string } | undefined;
      let assignmentId: string | undefined;

      try {
        const createdSubject = await createSubject(page, academicMediumId, `${runId}-subject`);
        subject = createdSubject;
        const subjectId = createdSubject.id;

        const createAssignmentResponse = await academicApiRequest(
          page,
          `/academics/curriculum/subject-assignments?academicMediumId=${academicMediumId}`,
          {
            method: 'POST',
            body: JSON.stringify({
              classId: standardId,
              status: SUBJECT_STATUS.draft,
              subjects: [
                {
                  subjectId,
                  subjectCode: `E2E${Date.now().toString().slice(-6)}`,
                  subjectType: SUBJECT_TYPE.core,
                  weeklyPeriods: 4,
                  difficultyLevel: 0,
                  subjectGroup: 'E2E',
                  learningGoal: 'E2E learning goal',
                  prerequisites: 'E2E prerequisites',
                  description: 'Created by Academic Curriculum E2E.',
                },
              ],
            }),
          }
        );
        expect(
          createAssignmentResponse.ok(),
          `${createAssignmentResponse.url()} ${createAssignmentResponse.status()}`
        ).toBe(true);

        const listBody = unwrapResult(
          await expectOkJson(
            await academicApiRequest(
              page,
              `/academics/curriculum/${standardId}/subject-assignments?page=0&pageSize=100&includeArchived=true`
            )
          )
        );
        const assignment = pagedItems(listBody).find((item) =>
          item?.subjects?.some((candidate: any) => candidate.subjectId === subject?.id)
        );
        expect(assignment, 'created subject assignment should appear in list').toBeTruthy();
        assignmentId = assignment.id;

        await expectOkJson(
          await academicApiRequest(
            page,
            `/academics/curriculum/subject-assignments/${assignmentId}/setup-health`
          )
        );

        await expectOkJson(
          await academicApiRequest(page, `/academics/curriculum/${standardId}/publish-readiness`)
        );

        await expectOkJson(
          await academicApiRequest(page, `/academics/curriculum/${standardId}/subject-kpi`)
        );

        await academicApiRequest(
          page,
          `/academics/curriculum/subject-assignments/${assignmentId}/archive`,
          { method: 'POST' }
        );

        await academicApiRequest(
          page,
          `/academics/curriculum/subject-assignments/${assignmentId}/restore`,
          { method: 'POST' }
        );

        const deleteResponse = await academicApiRequest(
          page,
          `/academics/curriculum/subject-assignments/${assignmentId}`,
          { method: 'DELETE' }
        );
        expect(deleteResponse.ok(), `${deleteResponse.url()} ${deleteResponse.status()}`).toBe(
          true
        );
        assignmentId = undefined;
      } finally {
        await deleteAssignment(page, assignmentId);
        await deleteSubject(page, academicMediumId, subject?.id);
      }
    });
  }
);
